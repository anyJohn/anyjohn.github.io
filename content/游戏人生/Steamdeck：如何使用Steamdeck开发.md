---
title: Steamdeck：如何使用Steamdeck开发
date: 2025-04-18 09:18:00
author: AnyJohn
tags:
  - 游戏人生
---

# 前言

Steamdeck作为一台掌机，搭载了SteamOS系统，其桌面模式支持使用 flatpak 安装应用或者 appimages，来做轻度办公场景，但是这两种安装方式无法满足我们编程开发和调试的需求。因为SteamOS是一个不可变系统，所以在使用 pacman （Arch的包管理器，类比ubuntu的apt）安装的包如nodejs、npm、vscode等，都可能会在更新后被覆盖掉，如果每次更新系统我们都需要手动安装下所有的包，那可就太麻烦了。更何况SteamOS的头文件是精简过的，里面包含的库并不全。

# 使用容器技术，获取类似WSL的完整Linux开发版体验

在SteamOS 3.5版本及以上，预装了distrobox和podman。podman是一个无root的容器，就像docker一样，只是它是 rootless,所以很适合在SteamOS这种不可变系统里使用，distrobox是一个方便快捷生成Linux发行版容器的工具和管理器。

Distrobox官方的Github上也提供了SteamOS的使用方式。[在SteamOS中安装Distrobox](https://github.com/89luca89/distrobox/blob/main/docs/posts/steamdeck_guide.md)

有了Distrobox,我们便可以在Steamdeck中创建一个Arch或者Ubuntu（随你喜欢）的容器，甚至附加Systemd服务，让它可以运行 Clash。Distrobox还提供了程序入口快捷方式生成的命令，这使得我们在使用容器内的应用的时候，就像在使用本机原生的应用一般快捷。

# 如何使用Distrobox

推荐你阅读官方文档，当然，也可以浏览我下面列出的步骤：[Distrobox快速开始指南](https://github.com/89luca89/distrobox/blob/main/docs/README.md#quick-start)

## 创建一个容器

```shell
distrobox create --name test --init --image archlinux:latest --additional-packages "systemd libpam-systemd pipewire-audio-client-libraries"
```

`--name test`： 指定容器名称为test, 起一个好记的名字，你也不想每次都敲 list 命令看容器的名字吧

`--image archlinux:latest`：指定使用最新版本的archlinux镜像，当然你也可以使用ubuntu，冒号后面是你想要的版本，`ubuntu:22.04`

`--additional-packages "systemd libpam-systemd pipewire-audio-client-libraries"`：指定需要为镜像添加的包，这里是systemd需要的包，如果你要运行的程序依赖systemd,那应该添加进去，我推荐你在创建的时候就添加进去。

## 管理容器

进入容器，没错，它是一个单独命令，而不是 `distrobox enter`

```javascript
distrobox-enter test
```

查看正在运行的distrobox容器列表，很简单，list一下

```javascript
distrobox list
```

删除容器，相信我第一次玩你会用到的

```javascript
distrobox rm test
```

停止容器，感觉不太会用到，除非你对内存敏感无比，因为它资源占用不是很多

```javascript
distrobox stop test
```

# 结合VSCode进行开发

1. VSCode 安装 [Dev Container](https://marketplace.visualstudio.com/items/?itemName=ms-vscode-remote.remote-containers)插件
2. 点击VSCode的左下角，选择`附加到正在运行的容器`，选择你刚才创建的容器。
3. 等待服务器初始化完成，就可以调出终端，使用`pacman`、`apt`等包管理器安装nodejs等运行环境，开始非常舒服的开发了。
