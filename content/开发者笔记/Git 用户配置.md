---
title: Git 用户配置
date: 2026-05-12 17:13
author: AnyJohn
tags:
  - Git
  - 工具
---

# Git 用户配置

在使用 Git 进行版本控制时，正确配置用户名和邮箱是确保提交记录清晰、可追溯的关键步骤。以下是配置 Git 用户信息的详细方法。

## **全局配置（适用于所有仓库）**

全局配置会影响当前用户在本机上的所有 Git 仓库，适合个人开发者或统一身份场景。

- **设置用户名和邮箱** 在终端中运行以下命令：

```shell
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱地址"
```

- **验证配置是否成功** 使用以下命令查看当前全局配置：

```shell
git config --list
```

## **本地配置（针对特定仓库）**

如果需要为某个项目单独设置用户名和邮箱，可以使用本地配置。

- **设置用户名和邮箱** 在项目目录下运行以下命令：

```shell
git config user.name "项目用户名"
git config user.email "项目邮箱地址"
```

- **验证本地配置** 查看当前仓库的配置信息：

```shell
git config user.name
git config user.email
```

## 最佳实践

- **首次安装后立即配置全局用户名和邮箱**：确保提交记录清晰。
- **保持邮箱一致性**：建议使用与 GitHub/GitLab 等平台关联的邮箱。
- **检查配置**：在新设备或环境中，使用 _git config --list_ 确认信息正确。
