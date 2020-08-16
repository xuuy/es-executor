import {initialGlobalEnvironment} from "./env-rec";

export const executionContextStack: ExecutionContextStack = []
export let globalEnvironment: GlobalEnvironment = null
export let runningExecutionContext: RunningExecutionContext = null

// 在 执行全局代码 之前，会预先创建好 全局对象 和 全局环境
export let GlobalObject = Window
globalEnvironment = initialGlobalEnvironment()

// 开始进入全局代码中执行，会先创建一个全局执行上下文，压入执行栈
let GEC = InitialGlobalExecutionContext()
executionContextStack.unshift(GEC)