---
title: 在 React 中使用 axios
author: AnyJohn
tags:
  - React
  - 前端
date: 2026-10-28 15:40:00
---

# 在 React 中使用 axios

## 为什么不在组件里直接 fetch

有四个理由，按重要性排：

1. **鉴权、trace id、错误处理要写一遍还是写一百遍**。拦截器让你写一遍。
2. **错误形态不统一**。网络错误、401、业务码是三种完全不同的东西，组件里判断会散落各处。
3. **测试麻烦**。请求逻辑焊在组件里，测组件就得连网络。
4. **换库成本**。真到要换的那天，你希望只改一个文件。

axios 的价值不在"能发请求"，在于**它给了你一个统一的横切层**。

## 第一步：安装

```bash
npm i axios
```

## 第二步：建实例

```ts
// src/api/client.ts
import axios, { type AxiosRequestConfig } from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api',
  timeout: 15_000,
  withCredentials: true,   // 让浏览器带上 httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
})

// access token 只放内存,不放 localStorage(原因见下一节)
let accessToken: string | null = null
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`)
  config.headers.set('X-Trace-Id', crypto.randomUUID())
  return config
})

// 统一出口:返回 data 本身,类型由泛型决定
export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    http.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(url, body, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(url, config).then((res) => res.data),
}
```

**为什么不直接在响应拦截器里 `return res.data`？** 因为那样类型还是 `AxiosResponse<T>`,和运行时对不上，每个调用点都得 `as`。上面这个 `request` 包装层用 `.then(res => res.data)` 剥壳，泛型从头到尾是准的。

## Token 放哪儿

这不是小事。**localStorage 和 sessionStorage 里的任何内容，页面上的脚本都能读**。一次 XSS（第三方脚本被投毒、富文本注入、依赖供应链）就足以把 token 拿走，而 token 的有效期通常比"发现泄露"的时间长得多。

| 位置 | XSS 能读吗 | 刷新页面还在吗 | 结论 |
|---|---|---|---|
| **httpOnly cookie** | ❌ 读不到 | ✅ | **推荐**:会话或 refresh token 放这里 |
| **内存变量** | 需要先执行代码，拿不到持久副本 | ❌ 刷新丢失 | **推荐**:access token 放这里 |
| localStorage | ❌ 能读 | ✅ | 不建议存 token |
| sessionStorage | ❌ 能读 | 仅当前标签页 | 同上 |
| URL 参数 | ❌ 能读，还会进日志和 Referer | — | 绝对不要 |

两种主流方案：

**方案 A：httpOnly cookie 存会话**（企业内网、同域部署最常见）

后端 `Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax`，前端什么都不用存，只配 `withCredentials: true`。代价是需要防 CSRF：`SameSite` 是第一道，跨站的写操作再加 CSRF token 或双重提交 cookie。

**方案 B：内存 access token + httpOnly refresh token**（前后端分离、多域部署常见）

refresh token 放 httpOnly cookie，access token 只活在内存里（上面的 `setAccessToken`）。刷新页面时用一个静默刷新接口换新的 access token，用户无感。

**localStorage 只在一种情况下可接受**：内容不是凭证，或者有严格 CSP + 全部第三方脚本白名单 + 短有效期。即便如此，它也是最后的选择。

## 第三步：写领域接口

```ts
// src/api/shares.ts
import { request } from './client'

export interface SharePage {
  data: Array<{ name: string; location: string; created: string }>
  nextMarker: string | null
  total: number
}

export const sharesApi = {
  list: (limit: number, marker = '') =>
    request.get<SharePage>('/sfs/shares', { params: { limit, marker } }),

  metadata: (name: string) =>
    request.get<{ cluster: string; storageClass: string }>(
      `/sfs/shares/${encodeURIComponent(name)}/metadata`,
    ),
}
```

这一层没有任何 React 代码。组件不该知道 URL 长什么样，就像组件不该知道 SQL。

## 第四步：在组件里用

```tsx
// src/hooks/useShares.ts
import { useEffect, useState } from 'react'
import { sharesApi, type SharePage } from '../api/shares'

export function useShares(marker: string) {
  const [page, setPage] = useState<SharePage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()      // 取消句柄
    setLoading(true)
    setError(null)

    sharesApi
      .list(50, marker, controller.signal)        // 传进 axios
      .then(setPage)
      .catch((e) => {
        if (e.name !== 'CanceledError') setError(e)   // 主动取消不算错误
      })
      .finally(() => setLoading(false))

    return () => controller.abort()               // 卸载或依赖变化时取消
  }, [marker])

  return { page, loading, error }
}
```

配套把 `list` 的签名改成接收 `signal`:

```ts
list: (limit: number, marker = '', signal?: AbortSignal) =>
  request.get<SharePage>('/sfs/shares', { params: { limit, marker }, signal }),
```

## 第五步：跑起来

开发环境需要解决跨域。Vite 配置代理：

```ts
// vite.config.ts
export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:3001' } },   // mock 服务
})
```

然后组件里直接 `useShares('')` 就能拿到数据。

---

## 错误归一化

axios 的 `AxiosError` 有三种形态，组件里不应该逐个判断：

```ts
// src/api/errors.ts
export type AppError = {
  kind: 'network' | 'timeout' | 'http' | 'business' | 'canceled'
  status?: number
  code?: string
  message: string
}

export function toAppError(raw: unknown): AppError {
  const err = raw as any
  if (err?.name === 'CanceledError') return { kind: 'canceled', message: '请求已取消' }
  if (err?.code === 'ECONNABORTED') return { kind: 'timeout', message: '请求超时' }
  if (!err?.response) return { kind: 'network', message: '网络异常' }

  const { status, data } = err.response
  if (data?.code && data.code !== '0') {
    return { kind: 'business', status, code: data.code, message: data.message ?? '业务失败' }
  }
  return { kind: 'http', status, message: `HTTP ${status}` }
}
```

把它挂在响应拦截器的错误分支里，**所有上层拿到的都是 `AppError`**。组件根据 `kind` 决定是弹 toast、跳登录、还是显示重试按钮。

## 竞态：慢请求覆盖快请求

同一个 effect 依赖变化时，两个请求可能同时在飞，慢的那个后回来会把新数据覆盖掉。`controller.abort()` 解决一半，另一半靠 axios 的取消语义：被 abort 的请求不会 resolve。

搜索框场景更明显：

```tsx
useEffect(() => {
  const controller = new AbortController()
  searchUsers(term, controller.signal).then(setResults)
  return () => controller.abort()
}, [term])
```

用户连敲五个字，前四个请求全部取消，只有最后一个能更新界面。

## 401 刷新 token：单飞

最容易写错的场景。每个请求各自刷新 token → 刷新接口被刷爆 → 无限循环。正确做法是**第一个 401 触发刷新，其余请求排队等新 token**:

```ts
let refreshing: Promise<string> | null = null

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error
    if (response?.status !== 401 || config.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }
    refreshing ??= refreshToken().finally(() => (refreshing = null))
    const token = await refreshing          // refresh 接口用 httpOnly cookie,返回新的 access token
    setAccessToken(token)                   // 只写内存
    config.headers.set('Authorization', `Bearer ${token}`)
    if ((config as any)._retried) return Promise.reject(error)   // 防止无限重试
    ;(config as any)._retried = true
    return http(config)                     // 原请求重发一次
  },
)
```

两个要点：**刷新接口本身要排除在拦截器之外**（否则无限递归）；**重发要防止重复重试**（`config._retried` 之类的标记）。

## 并发控制

axios 本身不限并发。首屏一次发几百个请求时（列表页逐行拉详情这种），需要自己在调用侧限流：

```ts
// 极简并发池:上限 6,完成一个补一个
export function createPool(limit: number) {
  let active = 0
  const queue: Array<() => void> = []

  const next = () => {
    if (active >= limit || queue.length === 0) return
    active++
    queue.shift()!()
  }

  return <T>(task: () => Promise<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      queue.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--
            next()
          })
      })
      next()
    })
}
```

`axios.all` / `Promise.all` 是全量并发，不解决这个问题。

## 超时与上传进度

```ts
// 单次请求覆盖全局超时
request.get<Blob>('/export', { timeout: 60_000, responseType: 'blob' })

// 上传进度
http.post('/upload', formData, {
  onUploadProgress: (e) => {
    if (e.total) setPercent(Math.round((e.loaded / e.total) * 100))
  },
})
```

下载进度用 `onDownloadProgress`,注意部分浏览器只在 `responseType: 'stream'` 或 XHR 下可用。

## 测试：MSW 而不是 mock axios

在测试里 mock axios 模块，等于把"请求长什么样"也 mock 掉了。用 MSW 在网络层拦截，组件、axios、拦截器都是真的：

```ts
// test/msw.ts
import { setupServer } from 'msw/node'
import { http as mswHttp, HttpResponse } from 'msw'

export const server = setupServer(
  mswHttp.get('/api/sfs/shares', () =>
    HttpResponse.json({ data: [], nextMarker: null, total: 0 }),
  ),
)
```

在 `vitest` 的 `beforeAll` 里 `server.listen()`,`afterEach` 里 `server.resetHandlers()`。

---

## 排查表

跑起来遇到问题时按症状查:

| 症状 | 原因 | 处理 |
|---|---|---|
| 接口 200 但拿到 `undefined` | 在响应拦截器里剥了 data,类型却还是 `AxiosResponse` | 用 `request.get<T>()` 包装层，不要用拦截器剥壳 |
| 组件卸载后报 "state update on unmounted" | 没有取消请求 | effect 的 cleanup 里 `controller.abort()` |
| 同一个请求发了两次 | 开发环境 StrictMode 故意双跑 effect | 正常现象；生产环境不会。想彻底防重复，在请求层做 in-flight 去重 |
| 401 之后无限刷新 | 刷新接口本身也被 401 拦截器拦住了 | 判断 `config.url` 排除刷新接口 |
| 请求路径变成 `/api/api/xxx` | baseURL 带了 `/api`,接口路径又写了一遍 | 二选一，保持约定 |
| 跨域报 CORS | 开发环境直接打后端域名 | 用 Vite 代理，或后端开 CORS |
| 取消后控制台一片红 | 把 `CanceledError` 当异常处理了 | `catch` 里先判断 `e.name === 'CanceledError'` |
| 上传进度不动 | 没配 `onUploadProgress`,或服务端不支持分块 | 检查配置与后端 |
| 跨域请求不携带 cookie | 缺 `withCredentials`,或后端 `Access-Control-Allow-Origin` 写了 `*` | 两边都开凭据模式；带凭据时 Origin 不能是通配符 |

## 结语

axios 在 React 里的定位是**传输层**:它负责怎么发、怎么带凭证、怎么把各种失败归一成一种形状。它不负责缓存、不去重、不管翻页，那些是数据层的事。

先把这条最小路径跑通，再按需往上加拦截器和并发池。**每加一层，都要能回答"这一层解决了哪个具体问题"**——加不出来的层，就是过度设计。
