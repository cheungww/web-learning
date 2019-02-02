# vue-learning(vue 源码阅读注释)

### 观察目录  结构以及 package.json

我们可以从 
```
"scripts": {
"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"...}
```
这段运行代码中可以知道。用 rollup 对 vue 工程运行 scripts/config.js 进行打包运行调试环境，使用了配置文件的 web-full-dev 环境参数选项  

这里
-c 指的是使用Rollup的配置文件，在命令行里加上--config或者-c进行指定
-w/--watch
监听源文件是否有改动，如果有改动，重新打包

进入到scripts/config.js中，我们可以看到 
```
 'web-runtime-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  }
```
从这里，我们可以看到入口是 src目录下的platforms/web/entry-runtime.js
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

在