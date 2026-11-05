---
title: JavaScript 的相等判断
author: AnyJohn
tags:
  - JavaScript
  - 前端
date: 2026-11-05 10:50:00
---

# JavaScript 的相等判断

```js
const a = { x: 1 }
const b = { x: 1 }
a === b   // false
```

这不是边角料。React 的依赖数组、`memo`、`useMemo` 全都建立在这条规则上：每次渲染新建的对象，永远不等于上一次的那个。`useEffect(() => {}, [{ id }])` 每渲染一次就执行一次，原因就在这里。

要搞清楚哪些东西算相等，先要搞清楚两件事：值存在哪里，以及用的是哪种相等算法。

## 值存在哪里

基本类型有七种：`undefined`、`null`、`boolean`、`number`、`bigint`、`string`、`symbol`。变量里直接就是值，复制一份就是两份各自独立的值。

对象、数组、函数、`Date`、`Map` 这些是引用类型。变量里存的是地址，对象本体在堆上：

```
a ──► { x: 1 }     堆上的一个对象
b ──► { x: 1 }     堆上的另一个对象
```

`a === b` 比较的是箭头指向的地址，不是地址里的内容。两个对象长得一样，地址不同，就不相等。

## 四种相等算法

JavaScript 里不是一个“相等”，而是四个：

| 算法 | `NaN` 与 `NaN` | `0` 与 `-0` | 谁在用 |
|---|---|---|---|
| 抽象相等 `==` | false | true | 手写 `==` |
| 严格相等 `===` | false | true | 日常比较、`indexOf` |
| SameValueZero | true | true | `includes`、`Map` / `Set` 的键 |
| SameValue | true | false | `Object.is`、React 的 state 与依赖比较 |

四个算法只在两个地方有分歧：`NaN` 和正负零。其余情况结论相同。

## 宽松相等：==

`==` 在类型不同时会先转换：

1. 类型相同，按 `===` 比
2. `null` 与 `undefined` 互相相等，且不与任何其他值相等
3. `number` 与 `string`：字符串转数字
4. 有 `boolean` 参与：布尔值先转数字
5. 对象与原始值：对象走 `ToPrimitive`（`Symbol.toPrimitive` → `valueOf` → `toString`），再按上面的规则比

实际结果：

| 表达式 | 结果 | 原因 |
|---|---|---|
| `null == undefined` | true | 规则 2 的特例 |
| `null == 0` | false | `null` 不与数字相等 |
| `null == false` | false | 同上 |
| `'' == 0` | true | 空串转成 0 |
| `'0' == false` | true | 两边都转成 0 |
| `[] == false` | true | `[]` 先转成 `''`，再转成 0 |
| `[1] == 1` | true | `[1]` 转成 `'1'`，再转成 1 |
| `{} == '[object Object]'` | true | 对象转成默认字符串 |
| `[] == ![]` | true | 右边是 `false`，回到 `[] == false` |
| `new Date(0) == 0` | false | `Date` 转成日期字符串，转数字是 `NaN` |
| `new Date(0) == String(new Date(0))` | true | 同样是字符串比较 |
| `1n == 1` | true | BigInt 与 number 按数值比 |

`new Date(0) == 0` 为 false，原因在 `Date` 的 `Symbol.toPrimitive`：默认场景下它返回字符串，是规范里唯一这么做的基础对象。其他对象默认走 `valueOf`，数字对象转成数字。

`==` 在实际代码里基本只用在一个地方：

```js
if (value == null) {
  // 同时覆盖 null 和 undefined
}
```

其余场景写 `===`。

## 严格相等：===

`===` 只做两步：类型不同返回 false；类型相同再比值或引用。它没有类型转换，行为可预测。

三个例外：

```js
NaN === NaN          // false
0 === -0             // true
Symbol('a') === Symbol('a')   // false，描述相同也是两个符号
```

`Symbol('a') === Symbol('a')` 为 false，因为每次调用 `Symbol()` 都创建一个新符号。同一个符号变量比较才会是 true。

`1n === 1` 是 false，类型不同。要让 BigInt 和 number 相等，只能显式转换。

`Object.is` 用 SameValue 算法。上面三个例外里，它只在两个上与 `===` 不同：

```js
Object.is(NaN, NaN)   // true
Object.is(0, -0)      // false
```

React 判断 state 有没有变化、比较依赖数组，用的就是这个算法。把 state 从 `0` 设成 `-0` 会被当成变化；连续设两次 `NaN` 则会被当成没变。

## 引用类型的比较

```js
const a = { x: 1 }
const c = a
a === c              // true，同一个地址

[1, 2] === [1, 2]           // false
(() => {}) === (() => {})   // false

new String('x') === 'x'     // false，包装对象和原始字符串
new String('x') == 'x'      // true，== 会拆箱
```

`const c = a` 复制的是地址，`c.x = 2` 之后 `a.x` 也是 2。想要新对象，得显式复制：

```js
const d = { ...a }   // 浅拷贝，新的地址
a === d              // false
```

浅拷贝只复制第一层。嵌套的对象仍然是共享的地址，改内层两边都会变。

这条规则在 React 里反复出现：依赖数组里放内联对象或内联函数，每次渲染都是新地址，比较永远为 false。

## 深比较

内容相等需要自己递归比较。最简版本：

```js
function deepEqual(a, b, seen = new Map()) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  if (seen.get(a) === b) return true          // 循环引用
  seen.set(a, b)

  const keysA = Reflect.ownKeys(a)
  const keysB = Reflect.ownKeys(b)
  if (keysA.length !== keysB.length) return false

  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key], seen),
  )
}
```

它处理了基本类型、`NaN`、`null`、Symbol 键、原型不同和循环引用。处理不了内置对象：`Date`、`Map`、`Set` 没有自有键，两个内容完全不同的日期会被判成相等。

生产环境用现成的实现。

## lodash 的 isEqual

`_.isEqual` 处理了上面所有遗漏。实测行为：

| 比较 | 结果 |
|---|---|
| `{ a: 1 }` 与 `{ a: 1 }` | true |
| `new Date(0)` 与 `new Date(0)` | true |
| `/a/g` 与 `/a/g` | true |
| `new Map([[1, 2]])` 与同样的 Map | true |
| `NaN` 与 `NaN` | true |
| `0` 与 `-0` | true |
| `[1, , 3]` 与 `[1, undefined, 3]` | true |
| `{ a: undefined }` 与 `{}` | false |
| 同一个类的两个实例 | true |
| 类实例与普通对象 | false |
| 循环引用 | 能比 |

内部逻辑在 `_baseIsEqual.js` 里：

```js
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) return true

  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other   // 只有 NaN 会走到 true
  }

  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack)
}
```

1. `===` 快路径，引用相同直接返回
2. 非对象值只处理 `NaN`
3. 对象按 `Object.prototype.toString` 的标签分派：数组、普通对象、Map、Set、Date、RegExp、TypedArray 各有比较函数
4. 普通对象比较自有可枚举键（含 Symbol），键数量不同直接 false，构造函数不同也直接 false；循环引用用栈记录已经比较过的对象对

`0` 与 `-0` 判为相等，是因为走了 `===` 快路径；`NaN` 判为相等，是第二步的特殊处理。

## 用哪个

| 需求 | 写法 |
|---|---|
| 默认比较 | `===` |
| 只判断 null / undefined | `value == null` |
| 判断 NaN | `Number.isNaN(value)` |
| 区分 `0` 和 `-0` | `Object.is(value, 0)` |
| 数组或 Set 是否包含 | `includes`（能找出 `NaN`） |
| 对象内容是否相同 | `_.isEqual` |

`Number.isNaN` 和全局的 `isNaN` 不是一回事：`isNaN('abc')` 是 true，因为参数先被转成了数字；`Number.isNaN('abc')` 是 false，它只对 `NaN` 返回 true。

`JSON.stringify` 不适合做深比较：

```js
JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 })   // false
```

键的顺序不同结果就不同；`undefined`、函数、Symbol 属性会被丢掉；`NaN` 变成 `null`；`Date` 变成字符串；循环引用直接抛错。

深比较有成本。它要遍历整个结构，对象越大越慢。React 的依赖比较用 `Object.is`，只有一层，这也是为什么在依赖数组里应该放原始值，或者用 `useMemo` 稳定住对象引用。

## 结语

相等有三种问法：同一个值、同一个地址、同一份结构。`===` 同时覆盖前两种，基本类型看值，引用类型看地址；`Object.is` 修正了 `NaN` 和正负零；`_.isEqual` 回答第三种。

选哪种，取决于你要回答哪个问题。日常比较用 `===`，判断空用 `== null`，比较结构才请出深比较，并且知道它的代价。
