---
title: 红色警戒 2 心灵终结在 Linux  的畅玩指南
date: 2026-06-07 12:59
author: AnyJohn
tags:
  - Linux
  - 游戏
  - 红色警戒
---

# 红色警戒 2 心灵终结在 Linux 的畅玩指南

心灵终结（Mental Omega）简称MO，是《红色警戒2：尤里的复仇》最知名的模组之一。但它基于 2000 年的 DirectDraw 2D 引擎，客户端依赖微软 XNA/MonoGame 框架。我尝试使用 Steam 的 Proton 兼容层，在 Linux 下运行，遇到了很多问题：帧率个位数、鼠标划过菜单就闪退、打完一局黑屏卡死等问题。

折腾了一圈，我在 Arch Linux 上把它调到了能正常玩的状态：满帧、Alt+Tab 切屏不崩、结盟菜单正常。记录一下过程供参考。

## 游戏文件安装

在 Linux 下配置模组，按官方覆盖顺序来就行。[心灵终结官网](https://mentalomega.com/ch/) 提供全部所需文件。

1. 准备《红色警戒2：尤里的复仇》本体。
2. 把游戏的关键文件（`BINKW32.dll`、`BLOWFISH.dll`、`gamemd.exe`、`ra2.mix`、`ra2md.mix`、`language.mix`、`langmd.mix`）复制到一个空文件夹。
3. 下载 [心灵终结 3.3.0 完整包](http://www.moddb.com/mods/mental-omega/downloads/mental-omega-330)，解压覆盖到同一文件夹。
4. 下载 [3.3.6 升级补丁](https://www.moddb.com/mods/mental-omega/downloads/mental-omega-336-patch-manual-update)（2021年10月发布，包含 3.3.0 至今所有内容），解压覆盖。
5. 下载 [官方简体中文语言包](http://mentalomega.com/game/lang/MentalOmega336ChineseSimplified.rar)，解压覆盖。
6. 从官网单独下载背景音乐包并解压到同一文件夹（否则游戏没有 BGM）。

> 如果你还想汉化客户端启动器界面（不影响游戏内文本），参考这个 [贴吧教程](https://tieba.baidu.com/p/7593781123)。

## Steam 导入与 Proton 兼容

心灵终结有独立客户端 `MentalOmegaClient.exe`，需要作为非 Steam 游戏导入：

1. Steam 左下角 "添加游戏" → "添加非 Steam 游戏"。
2. 选择游戏目录下的 `MentalOmegaClient.exe`。
3. 右键游戏 → 属性 → 兼容性，勾选"强制使用特定的 Steam Play 兼容性工具"，推荐选 `Proton 9.0`。

## 加载 cnc-ddraw，解决游戏卡顿问题

默认情况下 Wine 会用自己的内置 2D 渲染器，相当于纯 CPU 干活，画面直接变成幻灯片。MO支持社区渲染补丁 `cnc-ddraw`，需要加载它来激活 GPU 硬件加速。

在 Steam 的游戏属性 → "启动选项"中填入：

```shell
WINEDLLOVERRIDES="ddraw=n,b" %command%
```

`ddraw=n,b` 的意思是：加载 ddraw.dll 时**优先用原生（Native）的**（即游戏目录下的 cnc-ddraw），不行再回退到内置的（Builtin）。cnc-ddraw 会把古老的 DirectDraw 指令翻译成 OpenGL 或 Vulkan，让现代显卡真正参与渲染。

## 常见问题

### 鼠标划过菜单闪退

这是 XNA 音频接口的浮点数越界问题。打开 `RA2MO.ini`，找到 `[Audio]` 这一段。你会看到 `ClientVolume=8`——XNA 的 `SoundEffect.MasterVolume` 只接受 0.0 到 1.0 之间的值，`8` 会被当成 800% 音量，在 Wine 下直接引发内存越界。

改成合法的值：

```ini
[Audio]
ClientVolume=0.8
SoundVolume=0.800000
VoiceVolume=0.800000
```

### 打完一局黑屏、退不出游戏

Proton 没法正确映射 Windows 的 Discord 状态管道，导致对局结束时释放内存陷入死循环。同样在 `RA2MO.ini` 中找到或添加，或者在客户端取消勾选 discord 相关开关：

```ini
[XNAUI]
DiscordIntegration=false
```

## 参考

- [心灵终结官网](https://mentalomega.com/ch/) — 3.3.0、3.3.6 补丁、语言包、背景音乐
- [3.3.6 简体中文语言包直链](http://mentalomega.com/game/lang/MentalOmega336ChineseSimplified.rar)
- [客户端界面汉化教程](https://tieba.baidu.com/p/7593781123)
