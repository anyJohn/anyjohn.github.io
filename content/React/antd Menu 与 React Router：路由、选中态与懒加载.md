---
title: antd Menu 与 React Router：路由、选中态与懒加载
author: AnyJohn
tags:
  - 前端
  - React
date: 2026-10-27 10:20:00
---

# antd Menu 与 React Router：路由、选中态与懒加载

搜"antd Menu 做路由跳转",会搜出几十篇博客,写法各不相同:有的在 `label` 里放 `Link`,有的用 `onClick` 加 `navigate`;有的用 `useLocation` 算选中态,有的用 `matchRoutes`;懒加载有时用 `React.lazy`,有时用路由表的 `lazy` 字段。

这些写法没有互相抄错,它们是在同一组 API 上做了不同的取舍。这篇文章把取舍拆开,你就能判断每篇博客在选什么,而不是背下来某一种。

## 两边各自管什么

把责任边界说清楚,后面的分歧都好理解:

| | 负责 | 不管 |
|---|---|---|
| **antd Menu** | 渲染、交互、键盘操作、选中态展示 | 路由、导航、页面加载 |
| **React Router** | 路由匹配、导航、数据加载、代码分割 | 菜单长什么样、哪个菜单项高亮 |

两边官方文档都没有合起来讲。查 antd 的 Menu 文档,只有 `items`、`selectedKeys`、`onClick` 这些 API,没有任何 React Router 章节;查 React Router 文档,它不认识 antd。所以"权威方案"不存在,能做的是:用 antd 的两三个 API 把菜单接进路由,再选一套懒加载方式。

## 菜单与路由的连接点

antd Menu 提供了三个和路由相关的接口:

```tsx
<Menu
  items={[
    { key: '/shares', label: <Link to="/shares">文件系统</Link> },
  ]}
  selectedKeys={['/shares']}   // 受控:告诉 Menu 哪个高亮
  onClick={(e) => { /* 点击时拿 e.key,不一定用得上 */ }}
/>
```

- `items[].label` 的类型是 `ReactNode`,所以可以放组件,`Link` 就能进去
- `selectedKeys` 是受控属性,想让它随 URL 变,就得自己算
- `onClick` 能拿到被点击项的 `key`,但如果你在 `label` 里放了 `Link`,点击已经被链接处理了

## 最小可用版本

一共四步:入口挂 router、定义路由表、布局里放 Menu 和 `Outlet`、页面组件。顺序别乱——**漏掉第一步,后面三块写得再对也跑不起来**。

### 第一步:入口挂 RouterProvider

```tsx
// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

`RouterProvider` 必须是渲染树的根级路由容器,自闭合,不接受 children。**只要页面上出现 `<Link>`、`<Outlet>`、`useLocation`,它们就必须活在这个 provider 的子树里**,否则运行时会报错(报错原文见文末排查表第一条)。

### 第二步:定义路由表

```tsx
// router.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/Home')).default }) },
      { path: 'shares', lazy: async () => ({ Component: (await import('./pages/Shares')).default }) },
      { path: 'shares/:name', lazy: async () => ({ Component: (await import('./pages/Detail')).default }) },
    ],
  },
])
```

### 第三步:布局里放 Menu 和 Outlet

`AppLayout` 是被路由表 `element` 引用的组件,所以它渲染时已经在 Router 内部,可以放心用 `useLocation`。

```tsx
// AppLayout.tsx
import { Layout, Menu } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'

const MENU_KEYS = ['/', '/shares']

export function AppLayout() {
  const { pathname } = useLocation()
  // 详情页 /shares/abc 也要点亮「文件系统」:取最长匹配的菜单 key
  const selected = MENU_KEYS
    .filter((key) => pathname === key || pathname.startsWith(key + '/'))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider>
        <Menu
          mode="inline"
          selectedKeys={selected ? [selected] : []}
          items={[
            { key: '/', label: <Link to="/">首页</Link> },
            { key: '/shares', label: <Link to="/shares">文件系统</Link> },
          ]}
        />
      </Layout.Sider>
      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}
```

### 第四步:页面组件

```tsx
// pages/Shares.tsx —— 默认导出,和路由表里 lazy 的 import().default 对上
export default function Shares() {
  return <div>文件系统列表</div>
}
```

四步走完,`npm run dev` 打开 `/`,侧边栏可点、选中态跟随 URL、切页面不整页刷新、每个页面单独一个 chunk。

这套结构覆盖了日常工作里九成的情况。剩下的是边界,就是下面三个取舍。

## 取舍一:导航用 Link 还是 navigate

```tsx
// 写法 A:label 里放 Link
{ key: '/shares', label: <Link to="/shares">文件系统</Link> }

// 写法 B:onClick 里命令式跳转
<Menu
  items={[{ key: '/shares', label: '文件系统' }]}
  onClick={({ key }) => navigate(key)}
/>
```

写法 B 更短,但菜单项从"链接"退化成了"按钮":

- 浏览器中键点击、右键"在新标签页打开"全部失效
- 读屏软件听不到"这是一个链接",键盘体验变差
- 状态栏不显示目标地址

写法 A 里 Menu 渲染的仍然是 `li`,但里面是真正的 `a` 标签,上面这些行为都是浏览器原生给的。除非菜单项会触发非导航动作(比如"退出登录"),否则用 A。

## 取舍二:选中态用 pathname 还是 matchRoutes

简单场景按路径前缀算就够了。嵌套深、菜单项状杂的时候,前缀判断会误伤:比如 `/shares` 和 `/shares-archive` 是两个菜单,`startsWith` 会把后者也算进前者。

想更严谨,可以让路由配置自己回答"当前路径属于哪个菜单":

```tsx
import { matchRoutes, useLocation } from 'react-router-dom'

const MENU_ROUTES = [
  { path: '/', key: '/' },
  { path: '/shares', key: '/shares' },
  { path: '/shares/:name', key: '/shares' },   // 详情页归属「文件系统」
]

function useMenuKey() {
  const location = useLocation()
  const matches = matchRoutes(MENU_ROUTES, location)
  return matches?.at(-1)?.route.key   // 最具体的一条匹配
}
```

好处是归属关系写在路由表里,新增页面时不用再改菜单的高亮逻辑;代价是多一份配置要和菜单 keys 对齐。页面多、层级深时这笔账划算。

## 取舍三:懒加载放在哪一层

两条路线:

|             | 路由级 `lazy`                          | `React.lazy`         |
| ----------- | ----------------------------------- | -------------------- |
| 官方支持        | React Router 6.4+ 的 route object 字段 | React 内置             |
| 能懒加载什么      | 组件、loader、action 一起                 | 只能懒加载组件              |
| 需要 Suspense | 不需要,路由会处理挂起                         | 需要自己包                |
| 适合          | 用 `createBrowserRouter` 的项目         | 用 `<Routes>` 或非路由库场景 |

React Router 的文档对路由级 `lazy` 的说明很直接:"Most properties can be lazily imported to reduce the initial bundle size." 它会把组件和这个路由的数据加载函数一起拉下来,不会出现"组件到了、loader 还没到"的二次等待。

```tsx
{
  path: 'shares/:name',
  lazy: async () => {
    const [page, loader] = await Promise.all([
      import('./pages/Detail'),
      import('./pages/Detail.loader'),
    ])
    return { Component: page.default, loader: loader.detailLoader }
  },
}
```

`React.lazy` 的版本长这样,需要自己在布局里放 `Suspense`:

```tsx
const Detail = lazy(() => import('./pages/Detail'))

function AppLayout() {
  return (
    <Suspense fallback={<Spin />}>
      <Outlet />
    </Suspense>
  )
}
```

两种方式都成立,别在同一个页面上混用,否则一次跳转可能挂起两次,兜底界面闪两下。

## 常见问题排查

上面四步是能跑通的路径。真跑起来遇到问题时,按症状对表:

| 症状 | 原因 | 处理 |
|---|---|---|
| 打开就白屏,控制台报 `Cannot destructure property 'basename' of 'useContext(...)' as it is null` | `<Link>` / `<Outlet>` / `useLocation` 渲染在 `RouterProvider` 外面,通常是入口直接渲染了布局组件 | 回到第一步,入口用 `<RouterProvider router={router} />` |
| 菜单项只剩图标,文字没了 | `label` 写成了空的 `<Link></Link>` | `label: <Link to="/">控制台</Link>`,链接里要有内容 |
| 点有子菜单的父级,页面不跳转 | 子菜单标题的点击被展开/收起接管,里面的 `Link` 不生效 | 父级用纯文字负责展开,跳转放在子项;确实要父级跳转,用 `onTitleClick` 里调 `navigate` |
| 进详情页后菜单高亮丢了 | `/shares/:name` 和菜单 key `/shares` 不相等 | 用前缀匹配或 `matchRoutes` 归一化,见「取舍二」 |
| 选中态不生效,但路径明明对 | `selectedKeys` 传了字符串而不是数组 | 传 `[key]` |
| 打包后详情页没有独立 chunk | 同一个模块既被静态 `import` 又被动态 `import()`,打包器会合并 | 搜一下有没有静态引用;`dist/assets` 里确认 chunk |

还有两条设计上的注意事项,不属于报错,但会影响结构:

- **懒加载边界放路由级,别包住 Menu**。菜单项里只有链接,没有重代码,包进懒加载只会让首屏多一次空白。
- **antd v5 之后 Menu 用 `items` 描述结构**。v4 的 `<Menu.Item>`、`<Menu.SubMenu>` 写法已让位,不要两种混用。

## 菜单由后端下发时

控制台类产品的菜单常常是后端 schema 配置的(功能开关、局点差异、权限过滤都在后端算),前端拿到的是 `{ key, label, icon, children }` 树。这时上面的结论不变,只是 `items` 要动态构建:

```tsx
function toMenuItems(nodes: MenuNode[]): ItemType[] {
  return nodes.map((node) => ({
    key: node.key,
    icon: ICONS[node.icon],          // 字符串到组件需要一张注册表
    label: node.children?.length
      ? node.label                    // 有子菜单时 label 只是文字
      : <Link to={node.key}>{node.label}</Link>,
    children: node.children ? toMenuItems(node.children) : undefined,
  }))
}
```

这里容易踩的一点:图标必须是组件实例,后端只能给字符串,所以一张 `icon 名 → 组件` 的注册表是绕不开的。菜单 key 直接对应路由 path,后端和前端要约定同一份规范,否则路由改了菜单跟着断。

## 结语

这套组合上没有权威方案,因为两个库的边界本来就不重叠。你要做的不是找一篇"标准答案",是三个位置上各做一次选择:导航方式、选中态算法、懒加载层级。每个选择都有代价,写在表格里都不超过一行,但组合起来就是博客之间看起来完全不同的原因。

评审或面试时被问"你为什么这么写",能说出这三层取舍,比复述任何一种实现都更能说明你理解了这套东西。
