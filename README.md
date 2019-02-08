# vue-learning(vue 源码阅读注释)

### 观察目录结构以及 package.json

我们可以从 
```
"scripts": {
"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"...}
```
这段运行代码中可以知道。用 rollup 对 vue 工程运行 scripts/config.js 进行打包运行调试环境，使用了配置文件的 web-full-dev 环境参数选项  

这里
-c 指的是使用Rollup的配置文件，在命令行里加上--config或者-c进行指定
-w/--watch
监听源文件是否有改动，如果有改动，重新打包。
进入到scripts/config.js中，我们可以看到 

```
 'web-runtime-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  }
```

从这里，我们可以看到入口是 src目录下的platforms/web/entry-runtime.js
我们进入到entry-runtime.js文件下看看

```
/* @flow */

import Vue from './runtime/index'

export default Vue
```
可以看到这里是从runtime目录下的index.js导入Vue，然后再导出。
让我们看看这个index.js文件里面导入的内容

```
import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser, isChrome } from 'core/util/index'...
```


其实这里是对Vue的构造函数的原型prototype的属性进行赋值，对于devtools调试工具的挂载，使用，对于Vue.prototype.$mount 属性进行函数赋值，经过一系列处理后，导出来Vue

我们可以从第一句看到，Vue构造函数又是从src/core/index.js导入进来的

```
import Vue from 'core/index'
```
那么我们进入到src/core/index.js里面

```
import Vue from './instance/index

....

export default Vue
```

这里是对Vue原型属性进行增加，以及通过initGlobalAPI对于Vu进行相关原型属性的复制，通过Object.defineProperty 对于原型进行属性$ssrContext，FunctionalRenderContext的代理。


通过

```
import Vue from './instance/index
```
我们这里可以看到是相对路径，通过./知道位于当前目录下的instance目下的index.js文件
```
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
initMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

```
我们可以看到，这里就是vue的构造函数了，Vue接收一个options参数，进行实例化，通过this._init 也就是 Vue.prototype._init 函数，对于接收参数，进行实例化，

```
在initMixin(Vue)中，对于Vue进行原型属性的挂载
Vue.prototype._init = function (options) {} 

在stateMixin(Vue)中，对于Vue行原型属性的挂载
Vue.prototype.$data 
Vue.prototype.$props 
Vue.prototype.$set = set 
Vue.prototype.$delete = del 
Vue.prototype.$watch = function(){} 

在eventsMixin(Vue),对于Vue进行原型属性的挂载
Vue.prototype.$on 
Vue.prototype.$once 
Vue.prototype.$off 
Vue.prototype.$emit

在lifecycleMixin(Vue)，对于Vue进行原型属性的挂载
Vue.prototype._update 
Vue.prototype.$forceUpdate 
Vue.prototype.$destroy  

在renderMixin(Vue),对于Vue进行原型属性的挂载
Vue.prototype.$nextTick 
Vue.prototype._render 
Vue.prototype._o = markOnce 
Vue.prototype._n = toNumber 
Vue.prototype._s = toString 
Vue.prototype._l = renderList 
Vue.prototype._t = renderSlot
Vue.prototype._q = looseEqual 
Vue.prototype._i = looseIndexOf 
Vue.prototype._m = renderStatic 
Vue.prototype._f = resolveFilter 
Vue.prototype._k = checkKeyCodes 
Vue.prototype._b = bindObjectProps 
Vue.prototype._v = createTextVNode 
Vue.prototype._e = createEmptyVNode 
Vue.prototype._u = resolveScopedSlots 
Vue.prototype._g = bindObjectListeners
```
这一步处理完，就导出了挂载了原型属性的Vue构造函数，然后在/src/core/index.js 进行导入
```
import Vue from './instance/index

import { initGlobalAPI } from './global-api/index'

import { isServerRendering } from 'core/util/env'

import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

//初始化全局API
initGlobalAPI(Vue)

//原型定义属性 $isServer 标记是不是服务端渲染 

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

//这里原型定义属性 $ssrContext 标记是不是ssr渲染的上下文

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

//原型定义属性 FunctionalRenderContext render函数的上下文

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'
```
首先导入了在原型上挂载了一系列方法属性的Vue，然后通过initGlobalAPI，,在Vue上挂载静态属性和方法，我们进入到./global-api/index.js文件观察做的一些操作。
```
Vue.config Vue.util = util
Vue.set = set 
Vue.delete = del 
Vue.nextTick = util.nextTick 
Vue.options = { 
 components: { KeepAlive }, 
 directives: {}, 
 filters: {}, 
 _base: Vue 
} 
Vue.use 
Vue.mixin 
Vue.cid = 0 
Vue.extend 
Vue.component = function(){} 
Vue.directive = function(){} 
Vue.filter = function(){} 

```
接着定义Vue原型的$isServer，$ssrContext属性，接着定义
```
Vue.version = '__VERSION__'
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})
```
做完这一步，导出来vue 到/src/paltforms/runtime/index.js进行引入
```
import Vue from 'core/index'
...
```
在runtime/index.js 下，安装平台特有的工具函数跟指令

