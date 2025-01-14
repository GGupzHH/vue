/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // 给Vue 实例增加 _init方法
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 如果是 Vue实例 不需要被observe (响应式处理)
    vm._isVue = true
    // merge options
    // 合并用户传入的options 和 初始化的options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      console.log(vm, options)
      initInternalComponent(vm, options)
    } else {
      // mergeOptions 会将data的数据也进行合并
      // 如果是子组件 会将父子组件data数据合并 返回一个新函数 mergedInstanceDataFn
      // 所以在后面initData会判断data是否为function
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化vm.$parent, vm.$root, vm.$children, vm.$refs 等属性值
    initLifecycle(vm)
    // 初始化vm._events={}，初始化事件系统 实际上是父组件在模板中使用v-on或@注册的监听子组件内触发的事件
    initEvents(vm)
    // 初始化render函数
    // 主要定义两个方法
    // 1. vm._c，此方法用于用户使用template模式
    // 2. vm.$createElement，此方法用于用户手写render函数
    // 这2个方法，最终都会调用createElement方法
    // $slots  $scopedSlots  _c  $createElement  $attrs  $listeners
    initRender(vm)
    // 触发生命周期函数  beforeCreate
    callHook(vm, 'beforeCreate')
    // 实现依赖注入 inject
    initInjections(vm) // resolve injections before data/props

    // 初始化了 state props methods data computed watch
    // 初始化的 state props methods 会遍历data中的所有key 检测是否存在props
    
    // 并将对应属性设置成响应式挂载到 vm 实例
    initState(vm)

     // 实现依赖注入 provide
    initProvide(vm) // resolve provide after data/props
    // 触发生命周期函数  beforeCreate
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    //  调用 $mount 挂载整个页面
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 将用户传入的 options 合并
      // 这里的合并 添加了新的属性
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
