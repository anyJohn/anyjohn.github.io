---
title: React 的样式方案
author: AnyJohn
tags:
  - React
  - CSS
  - 前端
date: 2026-11-05 19:50:00
---

# React 的样式方案

```tsx
const containerStyle: CSSProperties = {
  margin: '32px',
  background: '#fff',
}

const Container = ({ children }: { children: ReactNode }) => (
  <div style={containerStyle}>{children}</div>
)
```

这是 React 里最直接的写法：CSS 写成对象，交给 `style` prop。它叫内联样式（inline style），不是 CSS-in-JS。CSS-in-JS 特指 styled-components、emotion 这类在运行时生成 class 的库。

React 没有规定样式该怎么写，所以同一个项目里经常同时出现内联对象、全局 CSS、CSS Modules 和组件库 token。这几种方案各有覆盖不到的地方。

## 内联样式：style 对象

`style` 只接受对象，不接受字符串。键名用 camelCase，数字值大多数会自动加 `px`：

```tsx
<div style={{ marginTop: 32, backgroundColor: '#fff' }} />
// 渲染结果：margin-top: 32px; background-color: #fff
```

`flex`、`zIndex`、`opacity`、`lineHeight` 这些属性不加单位，React 内部有一份 unitless 属性表。

CSS 变量不在 `CSSProperties` 的类型里，要断言：

```tsx
<div style={{ '--gap': '8px' } as CSSProperties} />
```

它做不到的事情：

- 不能写 `:hover`、`:focus`、`::before`，也不能写媒体查询
- 内联样式优先级高于普通 class，想覆盖只能再加 `!important`
- 每次渲染新建的对象引用不同，如果组件被 `memo` 包着，比较会失败

适合它的场景只有一个：值要在运行时算出来。

```tsx
function Progress({ percent }: { percent: number }) {
  return (
    <div
      style={{
        width: `${percent}%`,
        background: percent > 90 ? '#cf1322' : '#1677ff',
      }}
    />
  )
}
```

静态的 `margin`、`background` 放进 CSS 文件更合适。

## 全局 CSS

```tsx
import './index.css'
```

不带 `.module` 的 CSS 文件是全局的，类名直接写字符串：

```css
/* index.css */
:root {
  --color-bg-container: #fff;
}

.card {
  margin: 32px;
  background: var(--color-bg-container);
}
```

```tsx
<div className="card" />
```

全局 CSS 适合放 reset、字体、CSS 变量这类整个应用共享的东西。组件样式放进去迟早会撞名，`.container`、`.title` 这种类名在十个文件里各写一遍时，样式互相覆盖只是时间问题。

## CSS Modules

文件名带 `.module.css`，导入后得到类名映射：

```css
/* container.module.css */
.container {
  margin: 32px;
  background: var(--color-bg-container);
}

.title {
  font-size: 16px;
  font-weight: 500;
}
```

```tsx
import styles from './container.module.css'

export function Container({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  )
}
```

构建时类名会变成带哈希的局部名字，组件之间天然隔离。Vite 开箱支持，不需要装插件。

`composes` 用来复用另一个文件的类，`:global` 用来命中第三方组件的类名：

```css
/* 影响子组件里的类名 */
.container :global(.ant-table) {
  background: transparent;
}

/* 复用另一个文件的样式 */
.title {
  composes: heading from './typography.module.css';
  font-size: 16px;
}
```

条件类名用 `clsx`，比自己拼字符串干净：

```tsx
import clsx from 'clsx'

<button className={clsx(styles.button, active && styles.active)} />
```

静态组件样式用这一套就够了，也是大部分 Vite + React 项目的默认选择。

## CSS-in-JS

styled-components 和 emotion 把样式写成 JavaScript，运行时生成 class：

```tsx
import styled from 'styled-components'

const Button = styled.button<{ $primary?: boolean }>`
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: ${(p) => (p.$primary ? '#1677ff' : '#fff')};
  color: ${(p) => (p.$primary ? '#fff' : '#000')};
`

<Button $primary>提交</Button>
```

`$` 开头的 transient prop 只给样式用，不会传给 DOM。样式跟着 props 走，是它相对 CSS Modules 的优势。

代价是运行时要把样式注入 `<style>`，组件多时有额外开销。在 Server Components 里它还需要标 `'use client'`，首屏可能出现样式闪烁。

antd 从 v5 开始用的也是 CSS-in-JS，只是包了一层 design token：

```tsx
import { theme } from 'antd'

function Panel({ children }: { children: ReactNode }) {
  const { token } = theme.useToken()
  return (
    <div
      style={{
        padding: token.padding,
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
      }}
    >
      {children}
    </div>
  )
}
```

颜色、间距、圆角都从 token 取，暗色主题切换时跟着变。项目里已经在用 antd，就没必要再引入一套 styled-components。

不想承担运行时开销的话，vanilla-extract 和 Linaria 在构建期把样式编译成静态 CSS：

```ts
// container.css.ts
import { style } from '@vanilla-extract/css'

export const container = style({
  margin: 32,
  background: '#fff',
})
```

```tsx
import { container } from './container.css'

<div className={container} />
```

写法接近 CSS-in-JS，产物是普通 CSS 文件。

## 原子化 CSS

Tailwind 把样式拆成一个个类名：

```tsx
<div className="mt-8 rounded-lg bg-white p-6 shadow-sm">...</div>
```

构建时扫描源码，只保留用到的类。开发时不用在 HTML 和 CSS 文件之间来回切，代价是 JSX 变长，复杂样式要靠 `@apply` 或组件封装收敛。

Tailwind 是一套完整的约定，团队要统一用才有收益。半套 Tailwind 加半套 CSS Modules，维护成本比只用一种高。

## 预处理器

Sass 和 Less 解决的是变量、嵌套、mixin 这些 CSS 本身缺的东西。和 Modules 组合使用：

```scss
// container.module.scss
@use '../styles/tokens' as t;

.container {
  margin: t.$space-8;

  .title {
    font-weight: 500;
  }
}
```

Vite 里需要先装 `sass`，然后 `import styles from './container.module.scss'`，用法和 CSS Modules 一样。

CSS 变量普及之后，预处理器里“变量”这部分需求弱了很多。嵌套写太深会带来选择器权重问题，用之前先确认团队规范。

## 运行时之外的新选择

React 19 支持在组件里渲染 `<style>` 和 `<link rel="stylesheet">`，带 `href` 和 `precedence` 时会被提升到 head、去重，并按优先级排序：

```tsx
function Theme() {
  return (
    <style href="theme" precedence="default">{`
      .card { margin: 32px; }
    `}</style>
  )
}
```

适合组件库把样式和组件放在一起发布，又不想引入运行时 CSS-in-JS 的场景。`href` 和 `precedence` 是 React 19 的属性，React 18 及更早版本会忽略它们，用之前确认版本。

## 怎么选

| 需求 | 方案 |
|---|---|
| 组件静态样式 | CSS Modules |
| 运行时计算的值 | `style` 对象 |
| 主题、暗色模式 | antd token 或 CSS 变量 |
| 全局 reset、字体 | 全局 CSS |
| 基于 props 生成大量样式 | CSS-in-JS |
| 团队统一原子类 | Tailwind |
| 零运行时 + 组件级作用域 | vanilla-extract / Linaria |

一个项目的组合通常是这样：

```
src/
├── styles/
│   ├── global.css          reset、字体、CSS 变量
│   └── tokens.ts           token 或变量导出
├── components/
│   └── container/
│       ├── container.tsx
│       └── container.module.css
```

静态样式进 `*.module.css`。运行时计算的值走 `style`。颜色和间距从 token 或 CSS 变量取，不写死。一个项目最多两种方案，混到三种以上时先统一再开发。

## 和 Angular 对照

| Angular | React |
|---|---|
| `[ngStyle]`、`[style.margin.px]` | `style` 对象 |
| `styleUrls` + `ViewEncapsulation.Emulated` | CSS Modules |
| 全局 `styles.css` | 全局 CSS import |
| `::ng-deep` | CSS Modules 的 `:global()` |
| Material 主题 | antd token |

## 排查表

| 症状 | 原因 | 处理 |
|---|---|---|
| `className` 是 `undefined` | `import './x.module.css'` 少了默认导入 | 写成 `import styles from './x.module.css'` |
| 类名写了但没样式 | 类名和 CSS 文件里不一致，或 CSS 没被引入 | 在 DevTools 里看元素 class 和样式来源 |
| 样式覆盖不了 | 内联样式优先级高于 class | 把动态部分收窄，静态部分放回 CSS |
| `hover` 不生效 | 内联样式不支持伪类 | 改用 class |
| 暗色主题切换后不变 | 颜色硬编码在组件里 | 换成 token 或 CSS 变量 |
| 子组件 `memo` 失效 | `style` 对象每次渲染都新建 | 静态对象提到组件外，动态对象用 `useMemo` |
| CSS 变量类型报错 | `CSSProperties` 里没有 `--*` | `as CSSProperties` |
| 首屏样式闪一下 | 运行时 CSS-in-JS 注入晚于渲染 | 换 CSS Modules，或把关键样式提前注入 |

## 结语

样式方案没有官方答案。决定用哪种，看三件事：作用域怎么隔离、样式要不要跟着运行时数据变、愿不愿意承担运行时成本。

CSS Modules 覆盖大多数组件样式，`style` 对象留给运行时计算，主题交给 token 或 CSS 变量。先把这三种定下来，再考虑要不要引入 CSS-in-JS 或 Tailwind。
