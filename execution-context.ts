var InitialGlobalExecutionContext = function(): ExecutionContext {
  return {
    VariableEnvironment: globalEnvironment,
    LexicalEnvironment: globalEnvironment,
    ThisBinding: GlobalObject
  }
}

var createFunctionExecutionContext = function(F: FunctionObject, thisArg: object, Arguments: List, strict: boolean): ExecutionContext {
  let This: object
  if (strict) {
    This = thisArg
  } else if (thisArg === null || thisArg === undefined) {
    This = GlobalObject
  } else if (Type(thisArg) !== 'object') {
    This = ToObject(thisArg)
  } else {
    This = thisArg
  }
  // F['[[Scope]]'] FunctionObject的内部属性[[Scope]]保存着外部的LexicalEnvironment
  let localEnv = NewDeclarativeEnvironment(F['[[Scope]]'])

  let code = F['[[Code]]']

  DeclarationBindingInstantiation(code, Arguments)

  return {
    VariableEnvironment: localEnv,
    LexicalEnvironment: localEnv,
    ThisBinding: This
  }
}

var DeclarationBindingInstantiation = function(code: string, ArgumentList: List) {
  let env = runningExecutionContext.VariableEnvironment
  let configurableBindings: boolean
  if (IsEvalCode(code)) {
    configurableBindings = true
  } else {
    configurableBindings = false
  }
}

var IsEvalCode = function(code) {
  return false
}