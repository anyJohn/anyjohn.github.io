---
title: Hermes Agent 接入 Playwright MCP：控制本地 Edge 浏览器
date: 2026-07-20 20:55
author: AnyJohn
tags:
  - Hermes
  - Playwright
  - MCP
  - Edge
  - Linux
---

# Hermes Agent 接入 Playwright MCP：控制本地 Edge 浏览器

Hermes Agent 自带一个 browser 工具，但在 Wayland 环境下，它走的是 Browserbase 云端浏览器或本地 Chromium 实例，反爬网站（如 HackerRank）会直接 403。cua-driver 的 background 模式又依赖 accessibility tree，Edge 在 Wayland 下 AX 树没暴露，也用不了。

最终方案：用 Playwright MCP 通过 CDP（Chrome DevTools Protocol）连接到本地 Edge 浏览器。

## 核心思路

Playwright MCP 是一个 MCP 服务器，提供浏览器自动化能力。它支持多种模式：

| 模式 | 参数 | 特点 |
|:---|:---|:---|
| 独立 Chromium | `--browser chromium` | Playwright 自己启动一个无头浏览器，最简单但会被反爬检测 |
| 独立 Edge | `--browser msedge` | 用 Edge 二进制启动，但仍是自动化实例 |
| CDP 连接 | `--browser cdp --cdp-endpoint http://127.0.0.1:9222` | 连接到本地已运行的 Edge，保留登录状态，不被反爬检测 |

CDP 模式是最终方案：Edge 是你手动启动的真实浏览器，Playwright 通过 DevTools Protocol 连接它，不会触发 `navigator.webdriver` 等自动化标记。

## 踩过的坑

### 坑一：--remote-debugging-port 不生效

直接给 Edge 加 `--remote-debugging-port=9222`，端口不会开。原因：Edge 检测到已有实例在运行，新实例直接复用已有实例的 profile，调试参数被忽略。

### 坑二：--user-data-dir 指向已有 profile

把 `--user-data-dir` 指向 `~/.config/microsoft-edge`（你日常用的 profile），端口还是不开。原因：同一个 profile 目录同一时间只能被一个实例占用，已有实例锁住了它。

### 坑三：Edge 策略限制

Edge 有一个 `RemoteDebuggingAllowed` 策略，默认是允许的，但在某些环境下可能被禁用。需要手动设置策略文件确认允许。

### 坑四：--isolated 和 --user-data-dir 冲突

Playwright MCP 的 `--isolated` 参数会让 profile 保持在内存中，不读磁盘。和 `--user-data-dir` 同时使用会报错：`Browser userDataDir is not supported in isolated mode`。

## 最终方案

### 第一步：安装 Playwright MCP

```bash
npm install -g @playwright/mcp
```

### 第二步：设置 Edge 远程调试策略（可选，确保不被策略拦截）

```bash
sudo mkdir -p /etc/opt/edge/policies/managed
echo '{"RemoteDebuggingAllowed": true}' | sudo tee /etc/opt/edge/policies/managed/RemoteDebuggingAllowed.json
```

### 第三步：用独立 profile 启动 Edge 带调试端口

这是最关键的一步。Edge 150 在 Linux 上有一个坑：直接加 `--remote-debugging-port=9222` 端口不会开。原因是 Edge 检测到已有实例在运行时，会复用已有实例的 profile，调试参数被忽略。即使加了 `--user-data-dir` 指向已有 profile（`~/.config/microsoft-edge`），端口还是不开，因为已有实例锁住了 profile。

解决方案：用一个**独立的目录**作为 user-data-dir，不能指向已有的 profile：

```bash
microsoft-edge-stable --remote-debugging-port=9222 --user-data-dir=$HOME/.config/microsoft-edge-mcp
```

第一次启动是一个干净的 Edge 实例，需要手动登录需要访问的网站（如 HackerRank）。登录状态会保存在 `~/.config/microsoft-edge-mcp` 目录里，下次启动自动恢复。

如果不想弹出浏览器窗口，加 headless：

```bash
microsoft-edge-stable --remote-debugging-port=9222 --user-data-dir=$HOME/.config/microsoft-edge-mcp --headless=new
```

验证端口是否开了：

```bash
curl http://127.0.0.1:9222/json/version
```

如果返回 JSON（包含 Browser 版本和 webSocketDebuggerUrl），说明 CDP 端口已成功暴露。

### 第四步：配置 Hermes MCP

编辑 `~/.hermes/config.yaml`，添加 MCP 服务器配置：

```yaml
mcp_servers:
  playwright:
    command: npx
    args:
      - '-y'
      - '@playwright/mcp'
      - '--browser'
      - 'cdp'
      - '--cdp-endpoint'
      - 'http://127.0.0.1:9222'
    timeout: 180
    connect_timeout: 60
```

### 第五步：重载 MCP

在 Hermes 会话中输入：

```
/reload-mcp
```

Hermes 会重新连接 MCP 服务器，发现 Playwright 的 24 个工具（导航、点击、输入、截图、快照等），并注册为 `mcp__playwright__*` 工具。

### 第六步：测试

```
mcp__playwright__browser_navigate(url='https://example.com')
```

如果返回页面标题和快照，说明整个链路已打通。

## 日常使用

每次重启电脑后，需要先启动带调试端口的 Edge：

```bash
microsoft-edge-stable --remote-debugging-port=9222 --user-data-dir=$HOME/.config/microsoft-edge-mcp &
```

然后 Hermes 的 Playwright MCP 就能直接连接。

如果想让它开机自动启动，可以加到 KDE 的自启动脚本里，或者写一个 systemd user service。

## 关于登录状态

独立 profile 意味着这是一个干净的 Edge 实例，没有你日常浏览器的登录状态。如果需要访问需要登录的网站（如 HackerRank），有两个选择：

1. 在这个独立 Edge 实例里手动登录一次（登录状态会保存在 `~/.config/microsoft-edge-mcp` 目录里）
2. 把独立 profile 目录换成你日常的 profile 目录，但前提是日常 Edge 必须完全关闭

## 总结

| 步骤 | 命令/操作 |
|:---|:---|
| 安装 MCP | `npm install -g @playwright/mcp` |
| 设置策略 | `echo '{"RemoteDebuggingAllowed": true}' \| sudo tee /etc/opt/edge/policies/managed/RemoteDebuggingAllowed.json` |
| 启动 Edge | `microsoft-edge-stable --remote-debugging-port=9222 --user-data-dir=$HOME/.config/microsoft-edge-mcp` |
| 验证端口 | `curl http://127.0.0.1:9222/json/version` |
| 配置 Hermes | 在 `~/.hermes/config.yaml` 添加 `mcp_servers.playwright` |
| 重载 MCP | 在 Hermes 会话中输入 `/reload-mcp` |
