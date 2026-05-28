---
title: Git 配置 SSH 密钥
date: 2026-05-12 17:20
author: AnyJohn
tags:
  - Git
  - 工具
---

# Git 配置 SSH 密钥

配置 SSH 密钥可以让你在使用 Git 操作远程仓库时免去输入用户名和密码的麻烦，同时提升安全性。以下是详细步骤：

## 1. 检查是否已有 SSH 密钥

在终端运行以下命令，查看是否已有密钥：

```shell
ls -al ~/.ssh
```

如果看到 _id_rsa_（私钥）和 _id_rsa.pub_（公钥），说明已存在密钥，可直接跳到 **第 4 步**。

## 2. 生成新的 SSH 密钥

```shell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

- 按提示选择保存路径（默认 `~/.ssh/id_rsa`）。
- 可选：设置密码短语以保护私钥，或直接回车跳过。

生成后，密钥存储在以下位置：

- 私钥：`~/.ssh/id_rsa`（请勿分享）
- 公钥：`~/.ssh/id_rsa.pub`

## 3. 启动 SSH Agent 并添加密钥

启动 SSH Agent：

```shell
eval "$(ssh-agent -s)"
```

添加私钥到代理：

```shell
ssh-add ~/.ssh/id_rsa
```

##  4. 将公钥添加到 Git 平台

查看公钥内容：

```shell
cat ~/.ssh/id_rsa.pub
```

复制输出内容，然后登录你的 Git 平台（如 GitHub、GitLab 或 Gitee）：

1. 打开 **Settings -> SSH and GPG keys**。
2. 点击 **New SSH Key**。
3. 粘贴公钥内容，填写标题后保存。

## 5. 测试 SSH 连接

运行以下命令测试连接（以 GitHub 为例）：

```shell
ssh -T git@github.com
```

成功时会显示：

```shell
Hi username! You've successfully authenticated, but GitHub does not provide shell access
```
