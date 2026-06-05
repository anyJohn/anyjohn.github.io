---
title: Arch Linux 安装 Nodejs
date: 2026-06-05 19:58
author: AnyJohn
tags:
  - 工具
  - Linux
---

# Arch Linux 安装 Nodejs

[Node.js](https://en.wikipedia.org/wiki/Node.js "wikipedia:Node.js") 是一个 [JavaScript](https://en.wikipedia.org/wiki/JavaScript "wikipedia:JavaScript") [运行时环境](https://en.wikipedia.org/wiki/Runtime_system "wikipedia:Runtime system")，并附带实用的 [库](https://node.org.cn/docs/latest/api/)。 [Node.js](https://node.org.cn/) 使用 [Google](https://en.wikipedia.org/wiki/Google "wikipedia:Google") 的 [V8 引擎](https://v8.node.org.cn/) 在 [浏览器](https://wiki.archlinux.org.cn/title/Web_browser "Web browser") 之外执行代码。由于其事件驱动、非阻塞 I/O 模型，它非常适合实时 Web 应用程序。

## 1. 安装

安装 [nodejs](https://archlinux.org.cn/packages/?name=nodejs) 包。也有 [长期支持](https://en.wikipedia.org/wiki/Long-term_support#Software_with_separate_LTS_versions "wikipedia:Long-term support") (LTS) 版本。

- [nodejs-lts-jod](https://archlinux.org.cn/packages/?name=nodejs-lts-jod) — 版本 22.x
- [nodejs-lts-iron](https://archlinux.org.cn/packages/?name=nodejs-lts-iron) — 版本 20.x
- [nodejs-lts-krypton](https://archlinux.org/packages/?name=nodejs-lts-krypton) — 版本 24.x

或者使用别名 `nodejs-lts` 这将安装最新的 lts 版本

```shell
sudo pacman -S nodejs
sudo pacman -S nodejs-lts
sudo pacman -S nodejs-lts-jod
sudo pacman -S nodejs-lts-iron
sudo pacman -S nodejs-lts-krypton
```

## 2. 安装 npm 包管理工具

[npm](https://npmjs.net.cn/) 是 Node.js 的官方包管理器。可以通过 [npm](https://archlinux.org.cn/packages/?name=npm) 包进行 [安装](https://wiki.archlinux.org.cn/title/Install "Install")。

```shell
sudo pacman -S npm
```

### 允许用户级别的全局安装

在安装完成 npm 时，如果直接使用 `-g` 进行全局包安装，你将可能会遇到`npm error code EACCES`的报错，因为默认情况下，`npm` 试图把全局包塞进 `/usr/lib/node_modules/` 目录。这是一个**系统级目录**，普通用户没有写入权限（所以报了 `EACCES` 拒绝访问）。

遇到这种情况，千万不要图省事执行 `sudo npm install -g`。用 root 权限跑 npm 会污染你的系统根目录，导致以后普通用户连本地项目的 `node_modules` 都删不掉，甚至可能和系统的包管理器（pacman）发生冲突。

要为当前 [用户](https://wiki.archlinux.org.cn/title/User "User") 启用 *全局* 包安装，请设置 `npm_config_prefix` [环境变量](https://wiki.archlinux.org.cn/title/Environment_variables#Per_user "Environment variables")。npm 和 [yarn](https://yarn.npmjs.net.cn/en/) 都会使用它。

```shell
npm set prefix="$HOME/.local"
```
