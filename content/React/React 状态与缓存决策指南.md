---
title: React 状态与缓存决策指南
date: 2026-10-28 18:20
author: AnyJohn
tags:
  - React
  - Hooks
---

# React 状态与缓存决策指南

> **useState / 普通变量 / useMemo / useCallback / memo / useEffect,分别在什么时候用?**
> useMemo 和 useCallback 优化的是引用稳定性;useEffect 负责和外部系统同步,不承担生命周期回调的角色。

## 一、先建立模型:渲染 = 函数执行

React 组件本质上是一个函数。**每次渲染,函数体会完整重跑一遍**:

```tsx
function ShareList({ rows }: { rows: Share[] }) {
  const total = rows.reduce((sum, r) => sum + r.size, 0)   // 每次渲染都重算
  const sorted = [...rows].sort(byName)                    // 每次渲染都新建数组
  console.log('render')                                    // 每次渲染都执行
  return <div>{total}</div>
}
```

从这里能推出所有判断:

- **普通变量**:每次渲染重新计算。便宜的计算无所谓,昂贵的计算浪费。
- **`useState`**:值跨渲染保留,且变化会触发重渲染。
- **`useMemo`**:把计算结果缓存到下次渲染,依赖不变就复用。
- **`useCallback`**:本质是 `useMemo(() => fn, deps)`,缓存的是函数**引用**。
- **`memo`**:缓存整个组件的渲染结果,props 浅比较不变就跳过渲染。

## 二、useState 还是普通变量

**唯一判据:这个值变化时,界面需要跟着变吗?**

| 类型 | 例子 | 用什么 |
|---|---|---|
| 用户交互产生、需要驱动 UI | 搜索词 `searchTerm`、分页游标 `nextMarker`、loading 标志 | `useState` |
| 由已有 state/props **算出来** | 菜单高亮项、过滤后的列表、总数、格式化后的时间 | **普通变量**(或 useMemo) |
| 不驱动 UI、但要跨渲染保留 | 定时器 id、上一次的值、ECharts 实例 | `useRef` |
| 跨页面/跨组件共享 | 列表数据、特性开关、用户信息 | 状态管理(zustand/store) |

### 真实场景 1:菜单高亮

```tsx
const { pathname } = useLocation()
const selected = MENU_KEYS
  .filter((key) => pathname === key || pathname.startsWith(key + '/'))
  .sort((a, b) => b.length - a.length)[0]
```

`selected` 是**从 pathname 算出来的**,而 pathname 本身来自路由,已经是“状态”了。所以:

- ❌ 不该用 `useState`:那会变成两个数据源,路由变了还要手动同步,一漏就出 bug
- ✅ 普通变量就够:数组只有两三个元素,每次渲染重算的开销可以忽略
- `useMemo` 也没必要:这里没有“昂贵计算”,也没有“引用要稳定”的下游

**这条规则的通用形式:能推导出来的,不要存起来。** 派生值一旦进了 state,就多了一份需要维护的数据。

### 真实场景 2:搜索过滤

```tsx
const [searchTerm, setSearchTerm] = useState('')
const debouncedTerm = useDebouncedValue(searchTerm, 300)
const filtered = rows.filter((r) => r.name.includes(debouncedTerm))   // 派生
```

`searchTerm` 必须 state(用户输入要驱动 UI)。`filtered` 是派生值——过滤 1000 条大约 1 毫秒,普通变量完全够。**这里真正需要优化的是输入频率(防抖),不是过滤本身**。

## 三、useMemo:什么时候真的值得

`useMemo` 缓存一个值。值得用的场景只有两类:

### 类型 A:计算确实昂贵

判断标准是量级,不是感觉:

```tsx
// ✅ 值得:1000 行 × 每行合并 4 个接口的详情、格式化容量、生成标签数组
const rows = useMemo(
  () => baseRows.map((row) => ({ ...row, ...detailMap[row.name], sizeText: formatSize(row.size) })),
  [baseRows, detailMap],
)

// ❌ 不值得:两三个元素的字符串拼接
const title = useMemo(() => `${name} - ${region}`, [name, region])
```

经验阈值:**单次计算超过 1ms、或者数据量超过几千条**,才值得考虑。否则缓存的记账成本(依赖数组维护、内存占用)可能比省下的还多。

### 类型 B:需要引用稳定

这是更常见、也更容易被忽略的一类。某些下游会**比较引用**:

```tsx
// ✅ antd Table 的 columns:每次渲染新建数组,Table 内部会认为列定义变了
const columns = useMemo(() => [
  { title: '名称', dataIndex: 'name' },
  { title: '区域', dataIndex: 'location' },
], [])

// ✅ 作为 useEffect 的依赖:对象字面量每次都是新引用,effect 会无限触发
const query = useMemo(() => ({ limit: 50, marker }), [marker])
useEffect(() => { fetchShares(query) }, [query])
```

凡是「对象/数组/函数要传给 `memo` 组件、或放进依赖数组」的地方,引用稳定就是刚需。

### 反例:所有东西都包 useMemo

```tsx
// ❌ 典型的过度优化
const user = useMemo(() => props.user, [props.user])       // 直接传就行
const isEven = useMemo(() => count % 2 === 0, [count])     // 取模也要缓存?
const name = useMemo(() => `${user.first} ${user.last}`, [user])
```

后果是代码噪声、依赖数组写错的风险、以及并没有变快。

## 四、useCallback:只在“函数身份”被比较时才有意义

`useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`,缓存的是函数**引用**。所以判断标准只有一个:**有没有东西在比较这个函数的引用?**

### 值得用的情况

```tsx
// 场景 1:传给 memo 的子组件(否则子组件的 memo 永远失效)
const handleRowClick = useCallback((name: string) => navigate(`/shares/${name}`), [navigate])
<ShareRow onClick={handleRowClick} />

// 场景 2:作为其他 hook 的依赖
const load = useCallback(async () => { /* 依赖 marker */ }, [marker])
useEffect(() => { load() }, [load])

// 场景 3:防抖/节流要拿到“最新的函数”——配合 ref,而不是每帧新建
const onSearch = useCallback((term: string) => { /* ... */ }, [])
```

### 不值得用的情况

```tsx
// ❌ 传给原生 DOM 元素:每次渲染重新绑定一个 onClick 没有本质开销
<button onClick={useCallback(() => setOpen(true), [])}>打开</button>

// ❌ 组件内部调用、没有任何地方比较它的引用
const handleReset = useCallback(() => setRows([]), [])   // 等同于普通函数
```

**入参是内联箭头函数的地方,useCallback 反而可能更贵**(多一次 hook 调用和依赖比较)。它只在“identity 参与比较”时才有收益。

## 五、memo:什么时候包

`memo` 做 props 的**浅比较**。值得包的条件三条同时成立:

1. 组件渲染确实昂贵(大列表行、图表卡片、复杂表单)
2. props 引用稳定(对象来自 state/store、函数用 useCallback、数组用 useMemo)
3. 父组件会**频繁**重渲染,而子组件大部分时候没变

### 真实场景 3:大屏上的图表卡片

大屏有十几个图表卡片,数据每秒推送一次,但只有部分卡片的数据变化:

```tsx
const ChartCard = memo(function ChartCard({ title, series }: Props) {
  return <ReactECharts option={useMemo(() => buildOption(series), [series])} />
})
```

- `memo` 挡住“父组件重渲染导致的无关卡片重渲染”
- `series` 来自 zustand 的 selector,**引用稳定**(没变就是同一个对象)
- 三个条件都满足,memo 才有真实收益

反过来说,如果 `series` 是 `data.map(...)` 每次新建的,memo 就是白包——**浅比较永远不相等**。

### 反例:包了 memo 但 props 一直在变

```tsx
// ❌ style 是内联对象,每次都新引用 → memo 永远失效
const Row = memo(({ item }) => <div style={{ padding: 8 }}>{item.name}</div>)

// ✅ 样式提到外面(常量)或改 CSS 类名
const rowStyle = { padding: 8 }
const Row = memo(({ item }) => <div style={rowStyle}>{item.name}</div>)
```

### antd Table 的实际情况

antd Table 内部自己控制了行渲染,行级 `memo` 收益有限。对它影响最大的是:

- `columns` 的引用(上面说的 useMemo)
- `dataSource` 的引用
- 数据量和是否虚拟滚动

所以在 SFS 列表页里,比“给行包 memo”更有效的是:分批渲染(bufferCount 的思路)、减少请求数(并发池)、必要时虚拟滚动。**优化要打在大头上。**

## 六、useEffect：只用来同步外部系统

**React 官方把 useEffect 定义为"与外部系统同步",不是组件生命周期钩子。**渲染函数必须是纯的,所有"和 React 之外的世界打交道"的事才放进 effect。

### 什么时候必须写

| 场景 | 例子 |
|---|---|
| 数据请求 | 列表按游标拉数据;详情页按 name 拉 4 个接口 |
| 订阅外部事件 | WebSocket、`window.addEventListener('resize')`、RxJS Observable |
| 定时器/防抖 | `setInterval` 轮询、`useDebouncedValue` 里的 `setTimeout` |
| 命令式库 | ECharts 的 `init` / `resize` / `dispose` |
| 浏览器 API | `document.title`、`localStorage` |

### 什么时候不写(比"什么时候写"更重要)

**① 派生值不要靠 effect 算**

```tsx
// ❌ searchTerm 变 → effect 里 setFiltered → 再渲染一次
const [filtered, setFiltered] = useState([])
useEffect(() => {
  setFiltered(users.filter((u) => u.name.includes(searchTerm)))
}, [users, searchTerm])

// ✅ 直接算
const filtered = users.filter((u) => u.name.includes(searchTerm))
```

effect 里 setState 做派生,等于把同步计算变成"渲染后再异步渲染一次",多一帧、多一条状态同步路径。搜索框这类场景如果这么写,比直接写 useState 更糟。

**② 事件处理里的逻辑不要搬到 effect**

```tsx
// ❌ "状态变了再响应":中间状态会被其他渲染看到
useEffect(() => {
  if (submitted) { save(form); setSubmitted(false) }
}, [submitted])

// ✅ 在事件里一次做完
const onSubmit = () => save(form)
```

**③ props 变化要"重置 state",别用 effect**

```tsx
// ❌
useEffect(() => { setComment('') }, [userId])

// ✅ 用 key 强制重建,userId 变了组件直接重挂载
<CommentEditor key={userId} userId={userId} />
```

### 三个细节

**依赖数组的三种写法**

| 写法 | 行为 |
|---|---|
| `useEffect(fn)` | 每次渲染后都跑,几乎总是错的 |
| `useEffect(fn, [])` | 只在挂载后跑一次(开发环境 StrictMode 会跑两次) |
| `useEffect(fn, [a, b])` | a 或 b 变化时跑 |

依赖不要漏填。漏填会让回调读到旧值;想避免重复执行,把值放进 ref,并在注释里说明理由。

**清理函数在两个时机执行:下次 effect 之前,以及组件卸载时。**

```tsx
useEffect(() => {
  const sub = source$.subscribe(setData)
  return () => sub.unsubscribe()   // 依赖变化先清理再重跑,卸载时也清理
}, [source$])
```

防抖正是靠这个机制实现的:每次输入 effect 重跑,先清掉上一个定时器,再起新的。

**竞态:慢请求覆盖快请求**

```tsx
useEffect(() => {
  let cancelled = false
  fetchDetail(name).then((d) => { if (!cancelled) setDetail(d) })
  return () => { cancelled = true }
}, [name])
```

或者在 cleanup 里 `controller.abort()`。这套机制和并发池是两回事:并发池控制"同时有几个请求在飞",cancelled/abort 控制"旧响应不许覆盖新结果",两者要一起用。

### useEffect vs useLayoutEffect

| | useEffect | useLayoutEffect |
|---|---|---|
| 时机 | 浏览器绘制之后(异步) | 绘制之前(同步) |
| 用途 | 绝大多数副作用 | 需要测量 DOM 尺寸/位置、避免闪烁 |
| 风险 | 无 | 阻塞绘制,不要滥用 |

典型场景:tooltip 要先读目标元素尺寸再定位,用 useLayoutEffect 不会闪;用 useEffect 会先画到错误位置再跳过去。

### 决策树

```text
这段逻辑是"响应某个事件/用户操作"吗?
├─ 是 → 放进事件处理函数(不是 effect)
└─ 否 → 它在计算一个能从 state/props 推导出来的值吗?
        ├─ 是 → 直接算(useMemo 可选)
        └─ 否 → 它在和 React 之外的系统打交道吗(网络/订阅/定时器/DOM)?
                ├─ 是 → useEffect,并且写清理函数
                └─ 否 → 你大概率不需要 effect
```

## 七、决策树

```text
这个值会变化,并且界面要跟着变吗?
├─ 是 → 它能不能由现有 state/props 算出来?
│       ├─ 不能 → useState
│       └─ 能 → 不要存,直接用普通变量
│               └─ 计算昂贵 或 引用要稳定 → useMemo
└─ 否 → 它需要跨渲染保留吗?
        ├─ 需要 → useRef
        └─ 不需要 → 普通变量

这个函数会传给 memo 组件 / 作为 hook 依赖 / 进依赖数组吗?
├─ 会 → useCallback
└─ 不会 → 普通函数

这个组件渲染昂贵,且 props 引用稳定,且父组件频繁重渲染吗?
├─ 三条都满足 → memo
└─ 否则 → 不包
```

## 八、怎么验证优化真的有效

不要凭感觉。两种手段:

**① 渲染计数器**(我练手时用过)

```tsx
let renderCount = 0
const Row = memo(function Row({ item }: { item: Share }) {
  renderCount++
  return <tr><td>{item.name}</td></tr>
})
// 操作后打印 renderCount,对比优化前后
```

**② React DevTools Profiler**:录制一段操作,看哪些组件渲染了、为什么渲染(打开 "Why did this render?"),直接看 props 是不是每次都是新引用。

⚠️ 测量要在**生产构建**里做。开发环境的 StrictMode 会故意双调用 effect、双渲染,数字不能当基准。

## 九、常见反模式清单(自查)

- [ ] 派生值放进了 `useState`,导致两个数据源
- [ ] 所有变量都包 `useMemo`,依赖数组还写错
- [ ] 给原生 DOM 的 `onClick` 包 `useCallback`
- [ ] `memo` 组件的 props 里有内联对象/函数,导致永远失效
- [ ] 用 `useMemo` 缓存有副作用的操作(应该用 `useEffect`)
- [ ] 依赖数组缺项,用 `useMemo` 掩盖闭包过期问题
- [ ] 用 effect 里 setState 来做派生计算
- [ ] 用 effect 响应 props 变化去重置 state(应该用 `key`)
- [ ] 订阅/定时器/请求没有清理函数
- [ ] "用户操作之后要做的事"写成"state 变了再 effect"
- [ ] 优化没有测量,不知道到底快了多少

## 关联

- [[原型链、new 与继承]] —— 同主题的另一篇:JS 原型、new 与继承
- 业务场景来源:存储控制台列表页(320 条分页 + 逐行详情)、攻防大屏(React + ECharts + Zustand)
