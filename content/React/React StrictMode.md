---
title: React StrictMode
author: AnyJohn
tags:
  - React
  - 前端
date: 2026-11-06 17:00:00
---

# React StrictMode

```tsx
useEffect(() => {
  fetch('/api/instances')
    .then((res) => res.json())
    .then(setData)
}, [])
```

开发环境跑起来，Network 面板里这个请求出现了两次，`console.log` 也打了两遍。删掉入口处的 `<StrictMode>`，一切恢复正常。

这不是 bug，是 StrictMode 的检查。

## StrictMode 是什么

`<StrictMode>` 是 React 提供的开发期组件，写在入口：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

它不渲染任何 DOM，只在开发模式下开启一组额外检查。生产构建里这些检查全部关闭，行为和不写它一样。

React 18 起，这些检查里最显眼的一条是：部分代码会被执行两遍。

## 哪些东西会跑两遍

开发模式下，StrictMode 会：

| 对象 | 行为 |
|---|---|
| 组件函数体 | 渲染两次 |
| `useState` 的初始化函数 | 调用两次 |
| `useState` 的 updater、`useReducer` 的 reducer | 调用两次 |
| `useMemo` 的计算函数 | 调用两次 |
| effect 的 setup | 首次挂载后执行，模拟卸载执行 cleanup，再执行一次 setup |
| 类组件的 constructor、render、生命周期 | 对应双跑 |

effect 的双跑只发生在首次挂载，依赖变化触发的后续执行不会重复。组件 state 在模拟卸载时保留，不是真的销毁重建。

开发环境双跑，生产环境单跑；首次挂载双跑，更新单跑。

## 为什么双跑

React 18 引入了一套能力：组件可以被卸载、保留状态、再挂回来。

- Offscreen / Activity：页面切到后台时卸载，切回来时恢复
- 并发渲染：渲染可能被中断、丢弃、重来
- 快速路由切换：组件挂载后立刻卸载

这些场景要求组件在“挂载 → 卸载 → 挂载”之间不留下垃圾：定时器没清、订阅没退、监听器叠了两层、请求回来往已卸载的组件里 `setState`。

开发环境直接把这段流程演练一遍，问题当场暴露，而不是等用户切了十次路由、内存涨起来之后才发现。

另一个检查目标是纯函数。渲染、state updater、初始化函数都应该是纯的：同样的输入给出同样的输出，不改外部变量。跑两遍，第一次和第二次结果不一致的代码会自己现形。

## 正确的应对：写 cleanup

effect 的规则是：setup 做的事，cleanup 要能撤销。

```tsx
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/instances', { signal: controller.signal })
    .then((res) => res.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== 'AbortError') setError(e)
    })

  return () => controller.abort()
}, [])
```

第一次挂载发请求，模拟卸载时 `abort()`，第二次挂载重新发。Network 面板里两条记录，第一条状态是 canceled。这是预期行为。

其他常见组合：

| setup | cleanup |
|---|---|
| `addEventListener` | `removeEventListener` |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| `store.subscribe` | 返回的 unsubscribe |
| WebSocket / EventSource | `close()` |
| 请求 | `AbortController.abort()` 或 ignore 标志 |

updater 要写成纯函数：

```tsx
setItems((items) => [...items, item])                    // 纯函数，跑两遍结果一样
setItems((items) => { items.push(item); return items })  // 改原数组，跑两遍加两次
```

## 不要做的两件事

**为了消除双跑删掉 StrictMode。** 删掉之后，缺失的 cleanup 不会消失，只是把问题推到卸载、切路由、Offscreen 这些场景里。生产环境不双跑，不代表组件不需要清理。

**用 ref 跳过第二次执行：**

```tsx
const ran = useRef(false)

useEffect(() => {
  if (ran.current) return
  ran.current = true
  // ...
}, [])
```

这等于把检查关掉。StrictMode 检查的是“effect 能不能安全地重跑”，跳过第二次不是修复，是绕过。

## 请求为什么会到服务端两次

cleanup 里的 `abort()` 只取消浏览器这一端的等待，请求可能已经到达服务端。第一次挂载发出的请求，在 abort 之前就到了服务器，所以服务端的访问日志、mock 的计数里会看到两次。

用 Network 面板对比开发和生产：开发环境每个请求两条记录，第一条 canceled；`npm run build && npm run preview` 之后只有一条。性能数据、请求次数都应以生产构建为准。

## StrictMode 还检查什么

除了双跑，开发模式下它还会提示：

- 使用了废弃的生命周期：`componentWillMount`、`componentWillReceiveProps`、`componentWillUpdate`
- 使用了 `findDOMNode`、字符串 ref、旧版 context
- 在渲染期间修改 props 或 state
- 不在 React 支持范围内的副作用写法

这些检查只在开发环境输出警告，不影响生产。

## 和 React 19 的关系

StrictMode 的行为在 React 18 定下来，React 19 沿用：开发环境双跑，生产不跑。它不是过渡特性，而是配合 Offscreen 和并发渲染长期存在的检查机制。React 官方文档把它列为“确保组件可复用”的推荐做法。

## 结语

StrictMode 在开发环境把渲染、effect 和 state updater 跑两遍，模拟组件的卸载与重挂载，用来暴露不纯的渲染和缺失的 cleanup。

看到 effect 执行两次，先检查 cleanup 写没写，而不是先删掉 `<StrictMode>`。生产构建不会双跑，但组件该清理的东西一样不能少。
