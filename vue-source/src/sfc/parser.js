/* @flow */
{
    /* template.vue文件
    <template>
        <div>
          <h1></h1>
        </div>
        </template>
        <script>
        export default {
          computed:{
            money(){
  
            }
          }
        }
        </script>
        <style scope="less">
        
        </style> */
}
import deindent from 'de-indent'
import {
    parseHTML
} from 'compiler/parser/html-parser'
import {
    makeMap
} from 'shared/util'

const splitRE = /\r?\n/g
const replaceRE = /./g
const isSpecialTag = makeMap('script,style,template', true)
// Attribute 对象的属性类型
type Attribute = {
    name: string,
    value: string
};

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 * 解析 单个.vue后缀的组件文件 成为一个sfc 描述对象
 */
export function parseComponent(
    content: string, //组件内容
    options ? : Object = {} //可选的选择，默认为{}
): SFCDescriptor {
    const sfc: SFCDescriptor = {
        template: null,
        script: null,
        styles: [],
        customBlocks: []
    }
    let depth = 0
    //depth 变量，在start中将depth++，在end中depth--。
    //由于我们这里只是想要找到第一层标签，也就是 template、script这些，那么，每个depth === 1的标签就是我们需要获取的信息，包含 template、script、style 以及一些自定义标签。
    //当前的块
    let currentBlock: ? SFCBlock = null
    //每当遇到一个起始标签时，执行start函数。

    function start(
        tag: string,
        attrs: Array < Attribute > ,
        unary: boolean,
        start: number,
        end: number
    ) {
        if (depth === 0) {
            currentBlock = {
                type: tag,
                content: '',
                start: end,
                attrs: attrs.reduce((cumulated, {
                    name,
                    value
                }) => {
                    cumulated[name] = value || true
                    return cumulated
                }, {})
                //将arr数组[{name:'height',value:'13'},{name:'width',value:'12'}]转换为{height:'13',width:‘12’}
            }
            if (isSpecialTag(tag)) {
                //如果是script,style,template 这三个特别的标签就调用checkAttrs给 currentBlock.attrs.name 赋值
                checkAttrs(currentBlock, attrs)
                if (tag === 'style') {
                    //如果标签是style 标签，那么直接推入styles数组,这个就是style标签能写多个的原因
                    sfc.styles.push(currentBlock)
                } else {
                    //否则就将template 或者script标签 进行sfc.template或者sfc.srcipt属性赋值 直接写在了sfc下
                    sfc[tag] = currentBlock
                }
            } else { 
                //如果不是style script template 这三个特别的标签 的普通标签，就将这个currnetBlock对象push进sfc.customBlocks数组里面
                sfc.customBlocks.push(currentBlock)
            }
        }
        //如果是第一层的外层标签 那么depth+1 表示这个currentBlock是第一层标签
        if (!unary) {
            depth++
        }
    }
    //检查特殊属性 lang module scoped src 是否存在 存在的话就给block 加一个 block[name]=attr.name
    function checkAttrs(block: SFCBlock, attrs: Array < Attribute > ) {
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i] //遍历attrs数组里面的对象 [{name:'',value:''}] 
            //下面对属性进行遍历满足下面的相等，会在currentBlock上增加外的属性
            if (attr.name === 'lang') {
                block.lang = attr.value
            }
            if (attr.name === 'scoped') {
                block.scoped = true
            }
            if (attr.name === 'module') {
                block.module = attr.value || true
            }
            if (attr.name === 'src') {
                block.src = attr.value
            }
        }
    }
//每当遇到一个结束标签时，执行end函数。
    function end(tag: string, start: number) {
        //如果当前是第一层标签(depth === 1)，并且 currentBlock 变量存在，那么取出这部分text，放在 currentBlock.content 中。
        if (depth === 1 && currentBlock) {
            currentBlock.end = start
            //将currentBlock的开始标签到结束标签中间的文本都截取出来
            let text = deindent(content.slice(currentBlock.start, currentBlock.end))
            // pad content so that linters and pre-processors can output correct
            // line numbers in errors and warnings
            if (currentBlock.type !== 'template' && options.pad) {
                text = padContent(currentBlock, options.pad) + text
            }
            currentBlock.content = text
            currentBlock = null
        }
        //解析完该currentBlock之后将depth-1
        depth--
    }

    function padContent(block: SFCBlock, pad: true | "line" | "space") {
        if (pad === 'space') {
            return content.slice(0, block.start).replace(replaceRE, ' ')
        } else {
            const offset = content.slice(0, block.start).split(splitRE).length
            const padChar = block.type === 'script' && !block.lang ?
                '//\n' :
                '\n'
            return Array(offset).join(padChar)
        }
    }
    //start ,end 函数作为两个参数传递给了parseHTML
    //parseHTML会遍历解析查找content中的各个标签，解析到每个起始标签时，调用 option 中的 start 方法进行处理；解析到每个结束标签时，调用 option 中的 end 方法进行处理。
    parseHTML(content, {
        start,
        end
    })
    //compiler.parseComponent(file, [options])得到的只是一个组件的 sfc描述对象.js 文件是交给 vue-loader 等库来做的。
    return sfc
}