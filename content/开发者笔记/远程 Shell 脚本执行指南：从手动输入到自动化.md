---
title: 远程 Shell 脚本执行指南：从手动输入到自动化
date: 2026-05-13 11:36
author: AnyJohn
tags:
---

# 远程 Shell 脚本执行指南：从手动输入到自动化

在日常开发、部署时，我们经常需要自动化处理远程服务器或家里的 NAS 任务。本文汇总了从基础执行到解决 Obsidian 自动化部署 Quartz 博客报错的进阶技巧。

## 1. 基础篇：如何在本地触发远程脚本？

运行远程脚本主要取决于你的脚本文件存放位置：

* **脚本已在远程服务器上**：
    直接通过 SSH 调用绝对路径。

```bash
ssh user@remote_ip '/path/to/remote_script.sh'
```

* **脚本在本地（无需上传直接运行）**：
    这是最灵活的方法，通过标准输入重定向将本地代码“喂”给远程环境。

```bash
ssh user@remote_ip 'bash -s' < ./local_script.sh
```

## 2. 进阶篇：摆脱密码输入的束缚

在自动化工作流（如使用 Obsidian 的 **Shell Commands** 插件）中，由于缺乏交互终端，SSH 经常会抛出 `ssh_askpass` 错误。

### 方案 A：使用 sshpass（快速但不推荐）

如果你暂时不想配置 SSH Key，可以使用 `sshpass` 强制提供密码。

* **安装**：`sudo pacman -S sshpass` (Arch/CachyOS)
* **用法**：

```bash
export SSHPASS='your_password'
sshpass -e ssh -o StrictHostKeyChecking=no user@remote_ip 'sh /path/to/script.sh'
```

> **注意**：这种方式会在环境变量中暴露明文密码，存在安全风险。

### 方案 B：建立“身份契约”（SSH Key 认证 - 推荐）

这是最稳健的做法。通过交换公钥，让服务器彻底信任你的本地设备。

[[Linux 本地生成公钥访问远程服务器]]

**核心命令：**

```bash
ssh-copy-id user@remote_ip
```

**这一行命令做了什么？**

1. **寻证**：在本地 `~/.ssh/` 寻找你的公钥（`id_ed25519.pub` 等）。
2. **验证**：通过一次密码登录证明你对远程账号的拥有权。
3. **写入**：将公钥追加到远程服务器的 `authorized_keys` 文件中。
4. **赋权**：自动修复远程目录权限（700/600），确保 SSH 安全策略允许免密登录。

## 3. 实战：在 Obsidian 中一键发布

如果你在 Obsidian 中配置自动发布脚本，建议采用 **方案 B**。配置完成后，你的脚本将变得极其简洁：

```bash
#!/bin/bash
# 目标：触发服务器上的发布脚本
# 前提：已执行过 ssh-copy-id 免密配置
ssh admin@x.x.x.x '~/publish.sh'
```

## 4. 深度思考：为什么 SSH 不内置自动输入密码？

作为开发者，理解工具的设计哲学非常重要。SSH 官方拒绝内置 `ssh -p password` 功能，主要是为了：

- **防止密码泄露**：避免密码出现在 `ps` 进程列表或 `shell_history` 中。
- **强制安全习惯**：推崇基于非对称加密的 **Key 认证**，从根源上杜绝暴力破解。
- **责任分离**：SSH 只负责构建安全隧道，交互逻辑交由 `expect` 或 `sshpass` 等工具处理。
