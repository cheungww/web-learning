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
    content: string, //内容
    options ? : Object = {} //可选的选择，默认为{}
): SFCDescriptor {
    const sfc: SFCDescriptor = {
        template: null,
        script: null,
        styles: [],
        customBlocks: []
    }
    let depth = 0
    //当前的块
    let currentBlock: ? SFCBlock = null

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
                    //如果标签是style 标签，那么直接推入styles数组
                    sfc.styles.push(currentBlock)
                } else {
                    //否则就将template 或者script标签 进行sfc.template或者sfc.srcipt属性赋值 这个就是style标签能写多个的原因
                    sfc[tag] = currentBlock
                }
            } else { // custom blocks
                sfc.customBlocks.push(currentBlock)
            }
        }
        //如果是数组格式 则深度+1
        if (!unary) {
            depth++
        }
    }

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

    function end(tag: string, start: number) {
        //如果是数组格式，并且当前的块存在
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

    parseHTML(content, {
        start,
        end
    })

    return sfc
}