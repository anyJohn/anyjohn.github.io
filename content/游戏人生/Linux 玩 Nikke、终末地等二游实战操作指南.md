---
title: Linux 玩 Nikke 实战操作指南
date: 2026-05-11 20:01
author: AnyJohn
tags:
  - 游戏人生
---

在 Linux 上游玩《胜利女神：妮姬》（NIKKE）的步骤已经大大简化，核心逻辑是绕过反作弊（ACE）的初始化卡死。本文使用的Linux发行版是CachyOS。

---

# Linux 玩 Nikke、终末地等二游实战操作指南

## 🛠️ 第一步：环境准备

1.  **安装 Steam：** 确保你已经安装了原生 Steam 客户端。
2.  **准备 dwproton：** 安装 `protonplus` (Pacman 和 Flatpak 版本都可以)。在 `protonplus` 中选择`DW-Proton`，找到并安装 **dw-proton** 的最新版本，并点击安装。

---

## 🚀 第二步：安装与配置游戏兼容

1.  **下载 PC 版安装包：**
    去官方下载 NIKKE 的 PC 客户端安装程序（`NikkeMiniloader.0.0.x.xxx.exe`）。
2.  **通过 Steam 添加：**
    *   打开 Steam，点击左下角 `添加游戏` -> `添加非 Steam 游戏`。
    *   浏览并选择你下载的安装程序（`.exe`）。
3.  **强制兼容性设置：**
    *   右键点击 Steam 库里的这个安装程序 -> `属性` -> `兼容性`。
    *   勾选“强制使用特定的 Steam Play 兼容性工具”，在下拉菜单中选择 **dw-proton**。
4.  **运行安装器：**
    点击运行，完成游戏的安装。

---

## 🔧 第三步：修改启动路径为游戏本体

安装完成后，Steam 库里的路径依然指向安装器。我们需要把它修改为游戏本体

1. 打开 Steam 的仓库目录下的compatdata，通常为 `~/.steam/steam/steamapps/compatdata/`
2. 找到最近日期的文件夹并打开，比如`3788235738`，这个是 Steam 给游戏的生成的 id
3. 在该文件夹下找到`pfx/drive_c/NIKKE/Launcher/nikke_launcher.exe`，右键这个exe文件，复制完整路径。
4. 在 Steam 属性中，将“目标”修改为复制的完整路径。

---

## 💡 为什么使用 dwproton？

[dwproton Project](https://dawn.wine/dawn-winery/dwproton)

以前在 Linux 上玩 NIKKE，反作弊系统比如 ACE 会在启动时阻止程序启动。根据[Github NikkeLinux](https://github.com/KoleckOLP/NikkeLinux)项目，[koleq](https://github.com/KoleckOLP)用了一种类似于抽奖的方式启动，通过脚本反复启动程序，以“抽奖”出来ACE没有检测的一次机会。

使用**dwproton**，终结了需要反复“摇奖”才能进入游戏的痛苦。

以下是dwproton的特性：

- **基于 Proton-CachyOS**：拥有 CachyOS 针对性能的极致优化。
- **二次元游戏特攻**：包含 Dawn Winery 团队 🍷 为二次元游戏提供的最新修复补丁。
- **兼容性增强**：集成了来自 Proton-EM 的游戏兼容性修复。
- **质量 (QoL) 改进**：很多质量改进的插件，比如 [dxvk-gplasync](https://gitlab.com/Ph42oN/dxvk-gplasync) 和一些实用的环境变量。

##  🎲可以使用的游戏

- 胜利女神：Nikke
- 明日方舟：终末地
- 无限暖暖

## ⚠️ 注意事项

*   **账号安全：** 虽然 dwproton 绕过了反作弊检测让你能进游戏，但本质上这属于“非官方环境”。虽然目前社区反馈良好，但仍需知晓存在理论上的封号风险。**请自行承担使用风险**。
