# es-executor

## 目的

是为了能更深入理解**ECMAScript**，从代码运行的角度去了解底层原理

规范里有些实在太抽象，并且有些步骤需要不断的跳跃，就像通过以代码的形式将每一个步骤写出来，
最后再通过传入`AST`去运行

## 规范版本

基于`ES5`的规范编写

因为`ES6`、`ESNext`增加了太多知识点了，规范也比`ES5`更加庞大了，也更加难以理解。  

而且`ES6+`都是在`ES5`基础上扩展出来的，所以有些重要的规范点几乎也没多少改动，从`ES5`的规范入手，深入理解之后，
再逐步去阅读`ES6+`的规范就能更清晰了

后续的想法是先理解完`ES5`，然后再去阅读并理解`ES6`规范，最后再跟进`ESNext`

## TypeScript

本项目使用`TS`编写，在规范里面有很多类型描述，`JS`中是没有静态类型系统的，所以呢就采用了`TS`，跟规范描述保持一致，也更方便理解

## 由来

写这个项目是因为在网上看到了一个有趣的面试题，第2、3题是对第一题的微调，但结果确实天差地别呀

```js
// 第1题
var a = 10;
(function a() {
  console.log(a);
  a = 20;
  console.log(a);
})();
console.log(a);

// 第2题
var a = 10;
(function () {
  console.log(a);
  a = 20;
  console.log(a);
})();
console.log(a);

// 第3题
var a = 10;
function a() {
  console.log(a);
  a = 20;
  console.log(a);
}
a();
console.log(a);
```

第1题一开始看到这个我思考的比较久，有点绕想不明白，所以我猜了个答案是 `function`、`20`、 `function`

第2题相对来讲简单点`10`、`20`、 `20`

第3题我的答案是`function`、`20`、 `20`
  

那最后的执行结果是
1. `function` 、`function`、 `10`
2. `10`、`20`、 `20`
3. `TypeError: a is not a function`

那为什么是这个呢？

本着知其然知其所以然的精神，就想着阅读规范，并用代码编写下来，从运行中(主要是看规范不太能理解T T)挖掘本质

### 下面是比较简单的理解

上面的代码完整的执行一遍，需要牵扯到很多知识点(很多都是规范里面的知识)，要创建很多必备设施
，因为才刚开始写，而且规范也很多，一时半会也执行不了，大概写了一部分对规范的理解

- VariableStatement
- AssignmentExpression
- FunctionExpression
- IdentifierResolution
- ExecutionContext
- LexicalEnvironment
- VariableEnvironment
- EnvironmentRecord
- GlobalEnvironment
- GlobalContext
- FunctionContext
- ...

以上知识点太多太抽象，对于上面的代码核心的点就只有几个`FunctionExpression`、`LexicalEnvironment`、`EnvironmentRecord`

1. 在`JS`中表示一个函数可以有两种方式

函数声明(`FunctionDeclaration`)和函数表达式(`FunctionExpression`)

这两个标准的语法表示是这样的`?`代表可选

FunctionDeclaration: function Identifier ( FormalParameterList? ) { FunctionBody }

FunctionExpression:  function Identifier? ( FormalParameterList? ) { FunctionBody }

在实际的代码里就是

函数声明：`function a() {}`

函数表达式：  
`var a = function() {}`  
`var a = function a() {}`

如何确定第1、2题中()里面的是哪个，这里就要提到`PrimaryExpression:( Expression )`，
圆括号里只能是表达式，不能是声明语句，所以第1、2题里的就是`FunctionExpression`，第3题就是
`FunctionDeclaration`

函数本质上是一个可调用的对象，即在对象的内部实现了`[[Call]]`方法

声明一个函数的时候会发生一个绑定实例化的过程，即实例化一个`Function Object`，而函数对象内部有
一个`[[Scope]]`的内部属性，该属性保存着当前`运行的执行上下文(running execution context)`的`LexicalEnvironment`,
所以我们常说的**作用域链**指的就是这个玩意，在规范里面其实就是一个`LexicalEnvironment`引用了`外部的LexicalEnvironment`

先来看一下函数表达式的实例化步骤：
1. 通过`运行的执行上下文(running execution context)`的`LexicalEnvironment`创建一个新的`LexicalEnvironment`
2. 如果有`Identifier(函数名)`就调用CreateImmutableBinding方法，在新的`LexicalEnvironment`里创建一个**不可变**(⚠️注意是不可变)绑定
这个
3. 通过函数的参数和函数体创建`Function Object`，并把新的`LexicalEnvironment`赋值给`[[Scope]]`
4. 初始化上面创建的绑定，使用`Identifier(函数名)`和`Function Object`调用`InitializeImmutableBinding`，这样子就把函数名和函数给关联起来了

回到第1题，函数表达式里`Identifier(函数名)`，即`a`，执行这个函数，会创建一个`函数执行的上下文环境`，并使用`[[Scope]]`
创建新的`LexicalEnvironment`

执行到函数体内的第一行`console.log(a)`，就需要去解析`a`并获取值，在实例化的步骤里就能发现这个`a`是存在于`LexicalEnvironment`内的
即`[[Scope]]`内，这里就会打印`Function Object`，执行第二行`a = 20`，因为`a`是一个`不可变`的绑定，所以此处的赋值没有任何效果，
执行第三行同第一行一样打印`Function Object`，最后执行最后一行`console.log(a);`，函数表达式是要通过赋值语句赋给一个变量的，而此处是
用`PrimaryExpression:( Expression )`，这里并没有把值赋给任何一个变量，所以并不会存在于外面的`LexicalEnvironment`中，所以就会找到
当前上下文环境内的`a = 10`，打印`10`

第2题因为函数表达式并没有提供`Identifier(函数名)`，所以就不会创建和初始化不可变绑定，就会去外面的`LexicalEnvironment`中寻找`a`，找到
了这个`Identifier`，解析`Identifier`并获取值，打印`10`，`a = 20`修改外面环境中a的值，第3行打印`20`，最后一行也打印了`20`

第3题要说到一个预处理的过程，JS脚本执行的时候，会寻找所有的`VariableStatement`、`FunctionDeclaration`，并将它们提升到当前作用域的顶部
，注意这里只是提升了声明并没有提升赋值运算符，所以第三题的代码就变成了下面这样

```js
var a;
function a() { // a变成了函数
  console.log(a);
  a = 20;
  console.log(a);
}
a = 10; // a又被10覆盖了
a();
console.log(a);
```

1. var和函数声明都提升到了顶部
2. 执行第一句`var a`，会在`GlobalContext`的`LexicalEnvironment`的`EnvironmentRecord`下创建一个`Identifier a`可变的绑定，
并赋予初始值`undefined`
3. 执行第二句时，先通过`Identifier(函数名)`a去`EnvironmentRecord`中判断是否存在该绑定，上一步已经创建了(如果不存在，跟上一步一样的操作)
进入下一步
4. 创建一个`Function Object`，再将`Identifier(函数名)`、`Function Object`在`EnvironmentRecord`中设置绑定，即`a = Function Object`
5. 执行`a = 10`，同理在`EnvironmentRecord`中设置绑定，即`a = 10`
6. 所以最后执行到`a()`时，`a`的值是`10`，就会报错了
