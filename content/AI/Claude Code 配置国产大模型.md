---
title: Claude Code 配置国产大模型
date: 2026-05-18 22:52
author: AnyJohn
tags:
  - AI
  - 工具
---

# Claude Code 配置国产大模型

当 Anthropic 推出终端 AI 助手 **Claude Code** 时，其深度的本地代码库理解与自动化执行能力，确实惊艳了无数习惯于终端操作的开发者。它不再是单纯的“聊天框”，而是真正坐镇命令行、能帮你重构和排查 Bug 的 AI Agent。

然而，在国内的实际开发环境中，网络延迟、API 访问限制以及高频调用带来的昂贵账单，往往让这件神兵利器在落地时打了折扣。

幸运的是，2026 年的今天，国产大模型在代码生成与逻辑推理能力上已经迎来了爆发式增长。将 **Claude Code 的终端原生体验** 与 **国产大模型（如 DeepSeek、通义千问等）极具性价比的算力** 相结合，便诞生了当前兼顾极客体验与高 ROI 落地的终极生产力组合。

本文将以 DeepSeek 为例，为你打通 Claude Code 的全直连、低延迟、高性价比开发工作流。

## 0x01 获取 Base Url、API Key 和 model ID

在正式调通本地 Agent 之前，我们需要先摸清底层通信所需的核心三要素：

- **Base URL (基础路由地址)**：决定本地 Agent 流量去向的通信中枢。我们将通过修改它，将原本去往 Anthropic 的数据包强行重定向至国内服务节点。
- **API Key (鉴权令牌)**：访问远程接口的专属凭证，只有携带合规的身份凭证，后端云服务才会正确响应请求。
- **Model ID (目标模型标识)**：指定具体的推理大脑。例如若想调用最新的 DeepSeek V4 Pro，查阅官方文档可知其标准 Model ID 为 `deepseek-v4-pro`

### 1. 申请 DeepSeek API Key

1. 登录[DeepSeek 开放平台](https://platform.deepseek.com/api_keys)
2. 进入 API Keys 页面点击创建令牌，妥善记录生成的密钥（该密钥只显示一次）。
	![[Claude Code 配置国产大模型_2026-05-18.png]]

### 2. 核心架构适配数据

DeepSeek API 原生兼容 OpenAI 及 Anthropic 的标准协议规范。通过覆写配置参数，我们可以直接在原本绑定官方生态的软件中，实现底层的“偷天换日”。

具体的适配参数映射表如下：

| PARAM                | VALUE                                                          |
| -------------------- | -------------------------------------------------------------- |
| base_url (OpenAI)    | `https://api.deepseek.com`                                     |
| base_url (Anthropic) | `https://api.deepseek.com/anthropic`                           |
| api_key              | apply for an [API key](https://platform.deepseek.com/api_keys) |
| model*               | `deepseek-v4-flash`  <br>`deepseek-v4-pro`                     |

📌 详情可参阅官方指引：[首次调用 API | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/)

## 0x02 部署本地环境：运行时与 Claude Code 安装

### 1. 安装 Node.js 运行时环境

Claude Code 的底层基于 Node.js 构建。所以我们本地需要具备 NodeJS 运行时环境。

> [!NOTE] 备注
> 如果你极度追求系统纯净度，不想在本地手动配置笨重的 Node.js 环境，可以直接运行官方的独立 Native Binary 引导脚本，它会自动下载独立编译的、不依赖本地 Node 的原生可执行文件：
> 根据操作系统 - 只需要一行安装命令：
>
>| 操作系统                 | 安装命令                                  | Section                                                                                                     |
>| ------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
>| **Windows** (PowerShell)  | `irm https://claude.ai/install.ps1 \| iex`        | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-windows)                     |
>| **Windows** (WinGet)      | `winget install Anthropic.ClaudeCode`             | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-windows)                     |
>| **Windows** (WSL)         | Same as macOS/Linux, inside WSL                   | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-windows-with-wsl)            |
>| **macOS** (native)        | `curl -fsSL https://claude.ai/install.sh \| bash` | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-macos-or-linux)              |
>| **macOS** (Homebrew)      | `brew install --cask claude-code`                 | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-with-homebrew-macos)            |
>| **Linux** (Ubuntu/Debian) | `sudo apt install claude-code` (after repo setup) | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-linux-with-package-managers) |
>| **Linux** (any distro)    | `curl -fsSL https://claude.ai/install.sh \| bash` | [Jump ↓](https://findskill.ai/blog/install-claude-code-setup-guide/#install-on-macos-or-linux)              |

如果你选择走标准前端工具链生态（推荐，AI 时代全栈是一种趋势），请前往[Node.js — 下载 Node.js®](https://nodejs.org/zh-cn/download)安装最新的 LTS 版本

![[Claude Code 配置国产大模型_2026-05-18-1.png]]

安装完成 Node.js 后，在本地命令行环境下，运行

```sh
node -v
```

若正常回显版本号，说明系统运行时环境已就绪。

### 2. 安装 Claude Code

利用 Node.js 原生的包管理器 `npm` 全局安装：

```bash
npm install -g @anthropic-ai/claude-code
```

这行命令的意思是使用 node.js 自带的包管理工具 npm 全局安装（-g） Claude code Cli，并挂载到系统全局环境变量路径中。

等待安装完毕后，执行以下命令

```bash
claude --version
```

如果正常返回版本号，证明 Claude Code 安装完毕。

但此时**切勿直接启动**。因为默认状态下的 Claude Code 在启动时会调取 Anthropic 的官方 OAuth 认证并监测用户地址，在国内无法直接访问。

我们将通过修改环境变量的方式，修改 Claude Code 的上游 API 调用，重定向到我们配置好的 DeepSeek 平台。

## 0x03 接入 DeepSeek：配置环境变量代理

📌 **官方接入文档**：[接入 Claude Code | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)

我们在之前的步骤已经安装了 Claude Code，只需修改以下环境变量，其中 API Key 在 [DeepSeek Platform](https://platform.deepseek.com/api_keys) 获取。根据你的操作系统，复制对应的变量在终端执行。

Linux / Mac 用户，直接在终端中执行：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropicexport ANTHROPIC_AUTH_TOKEN=<你的 DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
```

Windows 用户，在 Powershell 中执行：

```Powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
```

配置完成后，切换进你的任意一个项目目录，即可使用 Claude Code

```bash
cd /path/to/my-project
claude
```

现在你应该可以在项目里使用 Claude Code 了

## 0x04 进阶调优：理解核心环境变量的底层行为

- `ANTHROPIC_BASE_URL`: 访问远程大模型接口的 base url，修改它将连接拦截到国内服务器
- `ANTHROPIC_AUTH_TOKEN`: 传统的 Bearer 鉴权令牌，填入你的 DeepSeek API Key
- `CLAUDE_CODE_SUBAGENT_MODEL`: 子 Agent 的驱动核心。当主模型在分析架构时，Claude 会分化出多个子进程去并发执行文件读取、正则检索等小任务。这里将其指派为高性价比、极速响应的 `deepseek-v4-flash`，可以**提升工具调用速度**，并**节省高频调用下的开销**
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"`: 一次性禁用更新、遥测和错误报告。Claude Code 真的很限制国内的使用，所以我会配置这个变量，保持尽量减少和连接 Anthropic 官方的联系
- `ANTHROPIC_MODEL`: 覆盖默认模型
- `ANTHROPIC_DEFAULT_OPUS_MODEL`: 覆盖默认 OPUS 模型
- `ANTHROPIC_DEFAULT_SONNET_MODEL`: 覆盖默认 SONNET 模型
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`:  覆盖默认 HAIKU 模型

**努力级别控制**：`CLAUDE_CODE_EFFORT_LEVEL`

**从我个人来说，我不喜欢DeepSeek官方文档设置为max，这会导致很简单的问题 Agent 也会长考**

该参数直接干预大模型后台的思考深度与自主规划路由，更高级别将让模型更努力的思考，但是会带来更大的 token 消耗。有 5 个级别控制，可根据任务场景动态调整

1. Low - 极简思维模式。不进行深层发散，响应时效极高，遇到模糊边界会频繁打断并向开发者主动提问
2. Medium - 标准平衡模式。合理的默认设置，具备基础的演进路线规划
3. High - 拓展探索模式。开启深度推理，主动设计更长、更严谨的上下文回溯链条
4. xHigh - 扩展思维、持续推理、主动坚持。具备强烈的反思与纠错本能，会在后台反复验证逻辑，直到推导出坚固的方案
5. Max - 最大深度、多重视角、详尽探索。调动全部可用的算力深度，进行多重视角的沙盘推演。**在处理陈旧历史遗留代码（Legacy Code）重构、或极度晦涩的 Bug 追溯时，直接拉满这一档会产生奇效**（注意：这会带来更大的 Token 上下文消耗）

## 0x05 拓展阅读

- [Claude 代码努力程度：每个编码任务的决策指南 |BSWEN --- Claude Code Effort Levels: A Decision Guide for Every Coding Task | BSWEN](https://docs.bswen.com/blog/2026-04-19-claude-code-effort-level-decision-guide/)
- [Claude Code Settings Reference (Complete Config Guide)](https://claudefa.st/blog/guide/settings-reference)
