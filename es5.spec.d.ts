/** ECMAScript Language Type */ 
type LanguageType = string | number | boolean | null | undefined | object
/** Specification Type */
type SpecificationType = Reference | List | Completion | PropertyDescriptors | PropertyIdentifier | LexicalEnvironment | EnvironmentRecord
/** ECMAScript Language Type And Specification Type */
type Type = LanguageType & SpecificationType

type Reference = {
  /** A base value of undefined indicates that the reference could not be resolved to a binding */
  base: undefined | string | number | boolean | object | EnvironmentRecord
  /** referenced name */
  name: string
  /** strict reference flag */
  strict: boolean
}

/** Returns the base value component of the reference V. */
type GetBase = (V: Reference) => Reference['base']
/** Returns the referenced name component of the reference V. */
type GetReferencedName = (V: Reference) => Reference['name']
/** Returns the strict referenced flag component of the reference V. */
type IsStrictReference = (V: Reference) => Reference['strict']
/** Returns true if the base value is a Boolean, String, or Number. */
type HasPrimitiveBase = (V: Reference) => boolean
/** Returns true if either base value is an object or HasPrimitiveBase(V) is true, otherwise returns false */
type IsPropertyReference = (V: Reference) => boolean
/**  Returns true if the base value is undefined and false otherwise. */
type IsUnresolvableReference = (V: Reference) => boolean

/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.8 */
type List = LanguageType[]

/**
 * http://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.9
 * Completion类型用于解释执行非本地控制权转移的语句（break，continue，return和throw）的行为
 * The term “abrupt completion” refers to any completion with a type other than normal.
 */
type Completion = {
  type: 'normal' | 'break' | 'continue' | 'return' | 'throw'
  value: LanguageType | 'empty'
  /** any ECMAScript identifier or empty. */
  target: 'empty'
}

type PropertyDescriptors = AccessorDescriptor | DataDescriptor
type AccessorDescriptor = {
  '[[Get]]'?: () => any
  '[[Set]]'?: (arg: any) => void
  '[[Enumerable]]'?: boolean
  '[[Configurable]]'?: boolean
}
type DataDescriptor = {
  '[[Value]]'?: LanguageType
  '[[Writable]]'?: boolean
  '[[Enumerable]]'?: boolean
  '[[Configurable]]'?: boolean
}
type PropertyIdentifier = Record<string, PropertyDescriptors>

/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-10.2
 * 词法环境是一种规范类型，用于根据ECMAScript代码的词法嵌套结构来定义标识符与[特定变量和函数](我的理解是根据作用域链所能访问到的一些变量和函数)的关联
 * 当执行FunctionDeclaration, a WithStatement, or a Catch clause of a TryStatement会创建一个新的Lexical Environment */
type LexicalEnvironment = {
  EnvironmentRecord: EnvironmentRecord
  outer: LexicalEnvironment | null
}

/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-10.2.1
 * EnvironmentRecord记录在其关联LexicalEnvironment范围内创建的标识符绑定
 * 意思是通过Function、With、Catch所创建的LexicalEnvironment，创建的标识符绑定只能绑定该范围内的标识符 */
interface EnvironmentRecord {
  /** 确定Environment Record是否具有Identifier的绑定，如果是，则返回true，否则返回false */
  HasBinding(N: string): boolean
  /** 在Environment Record中创建一个新的Mutable绑定。字符串值N是绑定名称。如果可选的布尔参数D为true，则可以随后删除该绑定 */
  CreateMutableBinding(N: string, D?: boolean): void
  /** 设置Environment Record中已经存在的Mutable绑定的值，字符串N是绑定名称，S是strict mode reference，如果为true且无法绑定则抛出TypeError异常 */
  SetMutableBinding(N: string, V: LanguageType, S: boolean): void
  /** 返回Environment Record已经存在的绑定的值，如果S为true并且绑定不存在或未初始化，则抛出ReferenceError异常 */
  GetBindingValue(N: string, S: boolean): LanguageType
  /** 从Environment Record中删除绑定。字符串值N是绑定名称的文本。如果存在N的绑定，请删除该绑定并返回true，
   * 如果绑定存在但无法删除，则返回false。如果绑定不存在，则返回true */
  DeleteBinding(N: string): boolean
  /** 返回从此Environment Record作为绑定值获得的函数对象调用上用作this的值 */
  ImplicitThisValue(): undefined | object
}

/** 声明性EnvironmentRecord与Variable、Function声明以及Catch产生的error相关联, 声明性环境记录由其范围内包含的所有声明所定义的标识符集
 * 创建和初始化是分开来的，所以会存在初始化状态和未初始化状态
 */
interface DeclarativeEnvironmentRecords extends EnvironmentRecord {
  /** 在环境记录中创建一个新的但未初始化的不可变绑定 */
  CreateImmutableBinding(N: string): void
  /** 设置环境记录中已经存在但未初始化的不可变绑定的值 */
  InitializeImmutableBinding(N: string, V: LanguageType): void
}

/** 执行Program（执行一段JS脚本文件）、WithStatement */
interface ObjectEnvironmentRecords extends EnvironmentRecord {}

/** 全局环境 是一个唯一的 词法环境 ，它在任何 ECMA 脚本的代码执行前创建。
 * 全局环境的 环境数据 是一个 #object-environment-record 对象环境数据，该环境数据使用 全局对象 作为 绑定对象 。
 * 全局环境的 外部环境引用 为 null */
type GlobalEnvironment = {
  EnvironmentRecord: ObjectEnvironmentRecords
  outer: null
}

/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-10.3
 * 执行环境包含所有用于追踪与其相关的代码的执行进度的状态 */
type ExecutionContext = {
  /** 指定一个词法环境对象，用于解析该执行环境内的代码创建的标识符引用 */
  VariableEnvironment: LexicalEnvironment
  /** 指定一个词法环境对象，其环境数据用于保存由该执行环境内的代码通过 变量表达式 和 函数表达式 创建的绑定 */
  LexicalEnvironment: LexicalEnvironment
  /** 指定该执行环境内的 ECMA 脚本代码中 this 关键字所关联的值 */
  ThisBinding: object | undefined
}

/** 保存着ExecutionContext的数据结构称为 执行栈 */
type ExecutionContextStack = ExecutionContext[]

/** 最顶层的执行环境称为当前运行的执行环境 */
type RunningExecutionContext = ExecutionContext

type FunctionObject = {
  '[[Call]]': Function
  '[[Construtor]]': Function
}