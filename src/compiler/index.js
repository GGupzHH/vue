/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// ' createCompilerCreator '允许创建使用alternative的编译器
// parser/optimizer/codegen，例如SSR优化编译器。
// 这里我们只导出一个使用默认部分的默认编译器。
// 将 createCompilerCreator  内部定义的 createCompiler返回
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // AST 抽象语法树
  const ast = parse(template.trim(), options)
  console.log(ast)
  if (options.optimize !== false) {
    // 标记AST中的静态根节点
    // 标记静态子树
    // patch的时候会跳过静态节点
    optimize(ast, options)
  }
  // 将AST转换成字符串形式的代码
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
