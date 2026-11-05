---
title: TypeScript 函数重载
author: AnyJohn
tags:
  - TypeScript
  - 前端
date: 2026-11-05 10:33:00
---

# TypeScript 函数重载

一个取数 hook，要同时服务有参数的接口和无参数的接口：

```ts
useResource(instanceApi.metadata, name)   // 有参数
useResource(commonApi.projects)           // 无参数
```

把第二个参数写成可选，这两行都能编译：

```ts
type ResourceResult<T> = { data: T | null; error: Error | null; isLoading: boolean }

function useResource<T, U>(
  fetcher: (params?: U, signal: AbortSignal) => Promise<T>,
  params?: U,
): ResourceResult<T>
```

代价是 `useResource(instanceApi.metadata)` 也能编译。运行时 `name` 是 `undefined`，请求拼成 `/instances/undefined/metadata`。类型没能拦住本来该拦的那个调用。

重载解决的就是这个问题：同一个函数，有几种调用形状，就写几套签名。

## 三段结构

```ts
// 重载签名 1：无参接口
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>): ResourceResult<T>

// 重载签名 2：有参接口
export function useResource<T, U>(
  fetcher: (params: U, signal: AbortSignal) => Promise<T>,
  params: U,
): ResourceResult<T>

// 实现签名：有且只有一个，必须紧跟重载
export function useResource<T, U>(
  fetcher: (params: U | undefined, signal: AbortSignal) => Promise<T>,
  params?: U,
): ResourceResult<T> {
  // 用 params 和 signal 发请求，把结果写进 state
}
```

重载签名不能有函数体，实现签名必须有。实现签名紧跟在最后一个重载后面，中间不能插别的语句，否则报 TS2391。

实现签名对外不可见，调用方只能看到重载签名。只写一条重载时，两个参数的调用会报 `Expected 1 arguments, but got 2`：在调用方眼里这个函数只接受一个参数，实现签名那条不在候选里。

## 调用解析

编译器把重载签名按声明顺序排列，从上往下尝试，第一个参数匹配上的生效，返回值也从它来。

```ts
function parse(input: string): string[]
function parse(input: string[]): string

parse('a,b')   // string[]
parse(['a'])   // string
```

**顺序就是优先级。** 宽泛的签名放在前面会吞掉后面所有调用：

```ts
function f(x: unknown): string    // f([1]) 也会落到这里
function f(x: number[]): string[]
```

**没有“最接近”匹配。** 第一个能匹配的胜出，不比较谁更精确。所有重载都不匹配时，报错通常指向最后一条重载，看起来和实际错误没什么关系。签名越多，调用错误越难读，这是重载的代价。

## 实现签名要比所有重载宽

TypeScript 会检查：按每一条重载的方式调用，实现签名都必须接得住。接不住报 TS2394「此重载签名与其实现签名不兼容」。

下面这个实现签名，第二个参数是必填的：

```ts
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>): ResourceResult<T>

export function useResource<T, U>(
  fetcher: (params: U | undefined, signal: AbortSignal) => Promise<T>,
  params: U,
): ResourceResult<T>
```

重载 1 调用时只传一个参数，实现却要求两个，两边对不上。把实现签名的参数放宽即可：

```ts
params?: U,
```

“宽”体现在三处：参数可选、参数类型带上 `| undefined`、返回类型比重载更粗。实现签名不负责对外表达，只做两件事：检查函数体、兜住所有重载。对外契约由重载签名负责。

## 泛型和重载

类型参数可以写在每一条重载上，各自独立。调用时只有被选中的那条签名参与推断。

```ts
function pick<T>(arr: T[]): T
function pick<T, K extends keyof T>(obj: T, key: K): T[K]
```

ahooks 的 `useRequest` 用两个重载并存两种推断方式：

```ts
// 从 service 函数推断 Data 和 Params，正常调用走这条
function useRequest<TService extends AnyService>(
  service: TService,
  options?: Options<InferData<TService>, InferParams<TService>>,
): Result<InferData<TService>, InferParams<TService>>

// 用户显式指定泛型：useRequest<User, [string]>(fetchUser)
function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
): Result<TData, TParams>
```

库要兼容历史调用方式，旧签名不能删，新签名只能加。重载是同时表达这两种方式的常规写法。

## 什么时候值得写重载

**参数形状不同，返回类型跟着变。** DOM 的 `createElement`：

```ts
createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K]
createElement(tagName: string): HTMLElement
```

传 `'canvas'` 返回 `HTMLCanvasElement`，传任意字符串返回 `HTMLElement`。

**参数个数不同。** 上面的 `useResource`：有参接口传两个，无参接口传一个。

**库需要兼容旧调用方式。** 前面的 `useRequest`。

反过来，一个联合类型签名能表达的，不需要重载：

```ts
function format(value: Date | number, unit?: 'ms' | 's'): string
```

几种常见方案的取舍：

| 方案 | 适合 | 代价 |
|---|---|---|
| 联合类型参数 | 参数形状一致，只是类型不同 | 表达不了形状差异 |
| 泛型默认值 `P = undefined` | 只差一个可省略的参数 | 漏传参数拦不住 |
| 条件 rest 元组 | 参数有无随类型变化，想保持单签名 | 实现里要一次类型断言 |
| 函数重载 | 多种调用形状、返回类型随输入变 | 签名重复，报错难读 |

条件 rest 元组长这样：

```ts
type Args<P> = P extends undefined ? [] | [params: P] : [params: P]

function useResource<T, P = undefined>(
  fetcher: (params: P, signal: AbortSignal) => Promise<T>,
  ...args: Args<P>
)
```

它能做到和重载相同的效果，实现体里要把 `args[0]` 断言成 `P`——编译器不会从“空元组意味着 P 是 undefined”反推。重载没有这份断言，代价是多写几行签名。

## 运行时没有重载

类型重载只在编译期存在。运行时只有一个函数，参数怎么解释由实现体自己判断：

```ts
function parse(input: string | string[]) {
  // 是字符串还是数组，由这个函数自己区分
}
```

箭头函数不能重载，得用函数声明，或者把签名写进接口：

```ts
interface UseResource {
  <T>(fetcher: (signal: AbortSignal) => Promise<T>): ResourceResult<T>
  <T, U>(fetcher: (params: U, signal: AbortSignal) => Promise<T>, params: U): ResourceResult<T>
}

const useResource: UseResource = (fetcher: any, params?: any) => { ... }
```

## 结语

重载是类型层的多套契约，配一个运行时实现。对外给调用方最精确的签名，对内用更宽的签名兜住全部调用。

业务代码里出现第二种调用形状时再引入。只有一种形状时，联合类型、可选参数或者默认泛型通常更短；重载的收益在调用方，签名数量、报错质量这些成本由维护者承担。
