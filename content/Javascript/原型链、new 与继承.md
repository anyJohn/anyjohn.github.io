---
title: 原型链、new 与继承
author: AnyJohn
tags:
  - 前端
date: 2026-10-20 17:40:00
---

# 原型链、new 与继承

> 2022 年写过一篇 [[原型与原型链]],当时记的是结论。这篇把推导过程补齐:三个属性各指哪里、new 到底做了几步、继承方案为什么演化成最后那样。所有结论都可以在浏览器控制台里当场验证。

从一道手写题开始:

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.greet = function () {
  return 'hi ' + this.name
}

function Student(name, grade) {
  Person.call(this, name)
  this.grade = grade
}
Student.prototype = Object.create(Person.prototype, {
  constructor: { value: Student, writable: true, configurable: true }
})
```

这十几行里塞了原型机制的全部考点:`Person.call(this)` 在借什么、`Object.create` 在连什么、`constructor` 为什么要补。如果每一行你都答得出"为什么",这篇文章对你就是复习;如果有一行卡住,往下看。

## 三个属性,三个方向

先纠正一个高频口误。"prototype 指向构造函数"是错的——指向构造函数的是 `constructor`。三个属性方向各不相同:

```text
p.constructor──► Person        谁造了我(回头指)
Person.prototype──► P          我用什么当模板造实例(向前指)
p.__proto__──► P               我继承谁(继承本身)
```

| 属性 | 谁身上有 | 指向什么 | 什么时候用 |
|---|---|---|---|
| `constructor` | 每个对象(通常从原型继承) | 回指构造函数 | 查"谁造的" |
| `prototype` | 只有函数 | 未来实例的原型对象 | 只在 `new` 时用一次 |
| `__proto__` | 每个对象 | 自己的原型 | 每次属性查找都在用 |

`prototype` 和 `__proto__` 的关系,一个准确的比喻:**图纸和借条**。函数的 `prototype` 是图纸,`new` 的瞬间引擎把它复印成借条塞进新对象,借条上写"缺属性去找图纸的主人"。`p.__proto__ === Person.prototype` 就是"借条内容等于图纸"的那次对账。

```javascript
const p = new Person('john')
p.__proto__ === Person.prototype                    // true
Person.prototype.constructor === Person             // true
p.constructor === Person                            // true(从原型继承来的)
```

`p` 自己的属性里根本没有 `constructor` 和 `__proto__`,前者是查找到 `Person.prototype` 时命中的,后者是另一回事,下一节说。

## `__proto__` 不是属性,是访问器

`__proto__` 的身份比另外两个微妙:它不是数据属性,是挂在 `Object.prototype` 上的一个 **getter/setter**:

```javascript
Object.getOwnPropertyDescriptor(Object.prototype, '__proto__')
// { enumerable: false, configurable: true, get: f, set: f }
```

描述符里没有 `value` 和 `writable`,只有 `get` 和 `set`。你每次写 `p.__proto__`,实际是触发这个 getter,读出对象内部的 `[[Prototype]]` 槽。真正的继承状态存在这个内部槽里,`__proto__` 只是一扇窗。

这也是它被标 deprecated 的原因:规范想让 `[[Prototype]]` 保持"内部槽"身份,`__proto__` 把内部实现暴露成了表面语法。标准做法是 `Object.getPrototypeOf(p)` 读、`Object.setPrototypeOf(p, x)` 写、`Object.create(proto)` 出生时定。`__proto__` 太流行,删不掉,被收进规范的 Annex B(浏览器兼容附录),明确说新代码别用。

## new 做了什么

`new Person('john')` 拆开是四步:

```javascript
function myNew(Ctor, ...args) {
  // 1. 造对象,原型指向构造函数的 prototype
  const obj = Object.create(Ctor.prototype)
  // 2. 把 this 绑到新对象上执行构造函数
  const ret = Ctor.call(obj, ...args)
  // 3. 返回值规则:对象/函数 → 用它;原始值 → 忽略
  if (ret !== null && (typeof ret === 'object' || typeof ret === 'function')) {
    return ret
  }
  // 4. 默认返回新对象
  return obj
}
```

第 1 步解释了为什么构造函数里 `this.name = name` 能把属性挂到实例上:`this` 就是那个刚造好的、原型已接好的 `obj`。

第 3 步值得单独记。构造函数显式 `return` 时:

```javascript
function P1(name) {
  this.name = name
  return name            // 原始值,被忽略
}
new P1('joe')            // { name: 'joe' }

function P2(name) {
  this.name = name
  return {}              // 对象,替换掉 this
}
new P2('doe')            // {}
```

注意 `null`:`typeof null === 'object'`,但 `return null` 会被忽略,所以判断条件里要有 `ret !== null`。这是手写 new 最容易被追问的一处。

## 原型链:查找只走一条路

实例找属性时,先看自己,没有就顺着 `__proto__` 往上爬,爬到 `null` 为止:

```text
p ──► Person.prototype ──► Object.prototype ──► null
```

函数也是对象,所以函数身上也存在一条链,而且默认接在 `Function.prototype` 上:

```javascript
Person.__proto__ === Function.prototype   // true
Function.__proto__ === Function.prototype // true(Function 是自己的实例)
Object.prototype.__proto__ === null       // true(链的终点)
```

几个经典结果都能从这张图推出来:

```javascript
const foo = {}
function func() {}
Object.prototype.a = 'value a'
Function.prototype.b = 'value b'

foo.a   // 'value a'  — foo.__proto__ 就是 Object.prototype
foo.b   // undefined   — Object.prototype 上没有 b,链到头了
func.a  // 'value a'   — 函数也是对象,Function.prototype.__proto__ === Object.prototype
func.b  // 'value b'
```

`instanceof` 的原理也在这条链上:`p instanceof Person` 就是检查 `Person.prototype` 是否出现在 `p` 的原型链上。它只看实例链,和静态成员毫无关系。

## 两条继承链

最容易混的一组等式。`class A extends B` 同时连了**两条独立的链**:

```javascript
class B { static tag() {} ; hello() {} }
class A extends B {}

// 实例链:实例方法继承
A.prototype.__proto__ === B.prototype   // true

// 静态链:静态成员继承
A.__proto__ === B                       // true(不是 B.prototype)
```

为什么 `A.__proto__` 是 B 而不是 `B.prototype`?因为函数也是对象,普通函数的原型本来是 `Function.prototype`,`extends` 把它改成了父构造函数。`A.tag()` 找不到时顺着 `A.__proto__` 找到 `B.tag`,静态继承靠的就是这一跳。

统一记法:**`__proto__` 永远指向"我该向谁借属性"**。实例向 `A.prototype` 借,A 作为函数向 `B` 借。借用关系对了,链就对了。

`class extends` 的编译产物(Babel 的 `_inherits`)把两条链写得很直白:

```javascript
function _inherits(subClass, superClass) {
  // 静态链
  Object.setPrototypeOf(subClass, superClass)
  // 实例链 + 修正 constructor
  subClass.prototype = Object.create(superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  })
}
```

## 继承方案的演化

教科书上继承方案的演化顺序,每一步都在修上一步的缺陷。

**原型链继承**:把子类的 prototype 指向父类实例。实例属性全部共享,一个子类实例改了引用类型的属性,所有实例跟着变。

**借用构造函数**:子类里 `Parent.call(this)`。实例属性独立了,但原型方法继承不到,方法没法复用。

**组合继承**:两个都要。`Parent.call(this)` 拿实例属性,原型链拿方法。缺陷是父构造函数被调用两次:一次 `call`,一次 `new Parent()` 塞进原型链,原型上留了一份用不到的属性。

**寄生组合继承**:组合继承的修正版,不再用 `new Parent()` 造原型,改用 `Object.create(Parent.prototype)` 直接连链,父构造函数只调用一次。开头那段手写题就是它,也是 `class extends` 编译产物的手工版。

```javascript
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype, {
    constructor: { value: Child, writable: true, configurable: true }
  })
  Object.setPrototypeOf(Child, Parent)   // class 语义下补静态链
}
```

`constructor` 为什么要补:原型对象被整个换掉了,新对象上没有 `constructor`,顺着链会查到 `Parent.prototype.constructor`,得到一个错误答案。不修的后果是 `new Student().constructor === Person`,靠 constructor 做克隆或类型判断的代码会静默出错。

## class 只是语法糖吗

一半对。`class` 在原型机制上没有引入新东西,上面每个环节都能对应:声明的方法落在 `prototype` 上,`super()` 编译成 `Parent.call(this)`,`extends` 编译成 `_inherits`。

但它比手写多了三件事:

1. **静态继承**:手写组合继承一般不写 `Object.setPrototypeOf(Child, Parent)`,class 写了
2. **强制 new**:class 不能当普通函数调用,内部用 `new.target` 检查,手写版随便你怎么调
3. **描述符细节**:class 声明的方法不可枚举,`Student.prototype.greet = function` 这样挂上去的可以。写遍历代码时行为不同

所以"语法糖"的说法要看跟谁比。跟寄生组合继承比,是糖,还是补了漏的糖;跟"JS 有基于类的继承体系"这个理解比,不是——实例查找从头到尾只有 `[[Prototype]]` 这一条路,没有第二条。

## 为什么说"委托"比"继承"准确

《你不知道的 JavaScript》里有个说法:继承意味着复制,而 JS 不复制任何属性,只是在两个对象之间建一条查找通路。子类实例上没有 `greet`,它只是"知道该去哪问"。

这个视角能解释很多现象:改 `Person.prototype.greet`,所有实例立刻看到新行为,因为没有副本;原型链不会无限长,因为终点是 `null`;`Object.create(null)` 造出的对象连 `toString` 都没有,因为它拒绝了向 `Object.prototype` 借属性。

手写 new、组合继承、`class extends`,全都只是在操作两样东西:借条(`[[Prototype]]`)指向哪,图纸(`prototype`)上放了什么。把这两件事想清楚,原型机制就没有暗处了。
