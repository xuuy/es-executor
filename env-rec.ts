export class DeclarativeEnvironmentRecordsConstructor implements DeclarativeEnvironmentRecords {
  EnvRec: Record<string, {
    value: LanguageType
    delete: boolean
    immutable: boolean
    /** 是否已初始化，仅用于创建immutable */
    initialised: boolean
  }> = {}

  HasBinding(N: string) {
    return !!this.EnvRec[N]
  }
  /** 在Environment Record中创建一个新的Mutable绑定。字符串值N是绑定名称。如果可选的布尔参数D为true，则可以随后删除该绑定 */
  CreateMutableBinding(N: string, D?: boolean) {
    let envRec = this.EnvRec[N]
    if (envRec) {
      // do nothing
    } else {
      envRec.value = undefined
      envRec.delete = !!D
      envRec.immutable = false
    }
  }
  /** 设置Environment Record中已经存在的Mutable绑定的值，字符串N是绑定名称，S是strict mode reference，如果为true且无法绑定则抛出TypeError异常 */
  SetMutableBinding(N: string, V: LanguageType, S: boolean) {
    let envRec = this.EnvRec[N]
    if (envRec) {
      if (!envRec.immutable) {
        envRec.value = V
      }
      if (envRec.immutable && S) {
        throw new TypeError('its Reference is immutable binding')
      }
    } else {}
  }
  /** 返回Environment Record已经存在的绑定的值，如果S为true并且绑定不存在或未初始化，则抛出ReferenceError异常 */
  GetBindingValue(N: string, S: boolean) {
    let envRec = this.EnvRec[N]
    if (envRec) {
      if (envRec.immutable && !envRec.initialised) {
        if (S) {
          throw new ReferenceError('N is immutable binding and value uninitialised')
        } else {
          return envRec.value
        }
      }
      return envRec.value
    } else {
      if (S) {
        throw new ReferenceError('N不存在Environment Record中')
      } else {
        return undefined
      }
    }
  }
  /** 从Environment Record中删除绑定。字符串值N是绑定名称的文本。如果存在N的绑定，请删除该绑定并返回true，
   * 如果绑定存在但无法删除，则返回false。如果绑定不存在，则返回true */
  DeleteBinding(N: string) {
    let envRec = this.EnvRec[N]
    if (envRec) {
      if (envRec.delete) {
        delete this.EnvRec[N]
        return true
      }
      return false
    }
    return true
  }
  /** 返回从此Environment Record作为绑定值获得的函数对象调用上用作this的值 */
  ImplicitThisValue(): undefined {
    return undefined
  }
  CreateImmutableBinding(N: string) {
    let envRec = this.EnvRec[N]
    if (!envRec) {
      envRec.value = undefined
      envRec.immutable = true
      envRec.initialised = false
    }
  }
  InitializeImmutableBinding(N: string, V: LanguageType) {
    let envRec = this.EnvRec[N]
    if (envRec && !envRec.initialised) {
      envRec.value = V
      envRec.initialised = true
    }
  }
}


export class ObjectEnvironmentRecordsConstructor implements ObjectEnvironmentRecords {
  EnvRec: {
    /** 对象环境记录绑定的对象 */
    binding: object
    provideThis: boolean
  }

  constructor(O: object) {
    this.EnvRec.binding = O
  }

  HasBinding(N: string): boolean {
    let envRec = this.EnvRec
    let bindings = envRec.binding
    return bindings['[[HasProperty]]'](N)
  }

  CreateMutableBinding(N: string, D?: boolean): void {
    let envRec = this.EnvRec
    let bindings = envRec.binding
    // step 3: Assert: The result of calling the [[HasProperty]] internal method of bindings, passing N as the property name, is false
    if (bindings['[[HasProperty]]'](N)) {
      // 
    }
    let configValue = !!D
    // step 5: Call the [[DefineOwnProperty]] internal method of bindings, passing N, Property Descriptor {[[Value]]:undefined, [[Writable]]: true, [[Enumerable]]: true , [[Configurable]]: configValue}, and true as arguments.
    bindings['[[DefineOwnProperty]]'](N, {
      '[[Value]]':undefined,
      '[[Writable]]': true,
      '[[Enumerable]]': true,
      '[[Configurable]]': configValue
    }, true)
  }
  
  SetMutableBinding(N: string, V: LanguageType, S: boolean): void {
    let envRec = this.EnvRec
    let bindings = envRec.binding
    bindings['[[Put]]'](N, V, S)
  }
  
  GetBindingValue(N: string, S: boolean): LanguageType {
    let envRec = this.EnvRec
    let bindings = envRec.binding
    let value = bindings['[[HasProperty]]'](N)
    if (value === undefined) {
      if (S) {
        throw new ReferenceError('')
      }
      return undefined
    }
    return bindings['[[Get]]'](N)
  }
  /** 从Environment Record中删除绑定。字符串值N是绑定名称的文本。如果存在N的绑定，请删除该绑定并返回true，
   * 如果绑定存在但无法删除，则返回false。如果绑定不存在，则返回true */
  DeleteBinding(N: string): boolean {
    let envRec = this.EnvRec
    let bindings = envRec.binding
    return bindings['[[Delete]]']
  }
  /** 如果provideThis为true，则返回object-environment-record的绑定对象，否则返回undefined
   */
  ImplicitThisValue(): undefined | object {
    let envRec = this.EnvRec
    if (envRec.provideThis) {
      return envRec.binding
    }
    return undefined
  }
}

export const GetIdentifierReference = function(lex: LexicalEnvironment, name: string, strict: boolean): Reference {
  if (lex === null) {
    return Reference(undefined, name, strict)
  }
  let envRec = lex.EnvironmentRecord
  let exists = envRec.HasBinding(name)
  if (exists) {
    return Reference(envRec, name, strict)
  } else {
    let outer = lex.outer
    return GetIdentifierReference(outer, name, strict)
  }
}

export const NewLexicalEnvironment = function<E extends EnvironmentRecord, O extends LexicalEnvironment | null>(): {
  EnvironmentRecord: E
  outer: O
} {
  return {
    EnvironmentRecord: null,
    outer: null
  }
}

export const NewDeclarativeEnvironment = function<T extends LexicalEnvironment>(E: T) {
  let env = NewLexicalEnvironment<DeclarativeEnvironmentRecords, T>()
  env.EnvironmentRecord = new DeclarativeEnvironmentRecordsConstructor()
  env.outer = E
  return env
}

export const NewObjectEnvironment = function<T extends LexicalEnvironment>(O: object, E: T) {
  let env = NewLexicalEnvironment<ObjectEnvironmentRecords, T>()
  env.EnvironmentRecord = new ObjectEnvironmentRecordsConstructor(O)
  env.outer = E
  return env
}

/** 全局环境是唯一的词法环境，它是在执行任何ECMAScript代码之前创建的 */
export const initialGlobalEnvironment = function(): GlobalEnvironment {
  return NewObjectEnvironment<null>(Window, null)
}