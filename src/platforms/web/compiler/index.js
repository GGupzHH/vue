/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// 调用 createCompiler 合并 options 选项
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
