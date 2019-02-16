/* @flow */
//引入sfc的单文件.vue 组件解析
export { parseComponent } from 'sfc/parser'
export { compile, compileToFunctions } from './compiler/index'
export { ssrCompile, ssrCompileToFunctions } from './server/compiler'
