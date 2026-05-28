---
title: 理解 Jenkins 的原理
date: 2026-05-19 11:29
author: AnyJohn
tags:
  - 工具
---

# 理解 Jenkins 的原理：从核心架构到跨机器部署实战

## 前言

在现代软件开发中，CI/CD（持续集成与持续部署）已经成为了标配。而谈到 CI/CD，**Jenkins** 绝对是一个绕不开的名字。很多人天天在用 Jenkins，点击“立即构建”看到进度条变绿就很开心，但如果问起：_“Jenkins 底层到底是怎么运作的？它是怎么把代码从我的电脑弄到远程生产服务器上的？”_ 很多人可能就有些模糊了。

今天这篇文章，我们就用最通俗的语言，彻底拆解 Jenkins 的核心原理，并结合一个“跨多台服务器部署 Node.js 服务”的真实场景，带你建立起闭环的认知。

---

## 一、 Jenkins 的核心工作原理：数字化总调度官

如果把自动化部署比作一场战役，**Jenkins 本身通常不运行你的生产服务，而是作为坐镇后方的“总调度指挥官”**。它的核心能力可以概括为以下三点：

1. **事件驱动的监听器（Trigger）**

    Jenkins 擅长“守株待兔”。它可以作为 Webhook 的接收端，死死盯着 GitHub/GitLab 等代码仓库。一旦开发者提交代码，或者触发了定时任务（Cron），Jenkins 就会立刻被唤醒并启动任务。

2. **无限可能的插件生态（Plugins）**

    Jenkins 刚装好的时候其实是个“光杆司令”，功能极简。但它拥有成千上万的插件。

    - 想管 Node.js 版本？装 NodeJS 插件。
    - 想通过远程连接服务器？装 SSH 插件。
    - 想给钉钉发通知？装 Webhook 插件。
	插件是 Jenkins 的灵魂，让它能连接一切。

3. **流水线编排引擎（Pipeline）**

    通过一个在项目根目录下的 `Jenkinsfile` 脚本，你可以把“拉取代码 $\rightarrow$ 编译打包 $\rightarrow$ 自动化测试 $\rightarrow$ 远程部署”这套复杂的全手工流程，用代码（Groovy 语法）固化下来。只要点一下启动，它就会像工厂流水线一样严丝合缝地自动跑完。

---

## 二、 经典实战场景：从本地 PC 到生产环境的跨机器部署

为了更直观地理解，我们来看一个典型的三端部署场景：

- **PC A（开发端）**：你自己的工作电脑，负责写代码和提交。
- **Server A（构建端）**：部署了 Jenkins 的独立服务器，充当“自动化加工厂”。
- **Server B（运行端）**：真正跑业务的生产环境服务器。

在这个架构中，代码和指令究竟是怎么流转的？我们拆解为 4 个步骤：

### 1. 触发阶段（PC A $\rightarrow$ Server A）

你在 PC A 上完成了 Node.js 代码修改，执行 `git push` 推送到远程 Git 仓库。

仓库收到代码后，通过预先配置的 **Webhook**（一个 HTTP POST 请求）向 Server A 上的 Jenkins 发送信号：“有人推了新代码，开始工作！”。

---

### 2. 构建阶段（Server A 内部完成）

Jenkins 收到指令后，在 Server A 的工作空间（`workspace`）里启动一个独立的构建进程：

- **拉取代码**：通过 Git 插件把最新的代码克隆到本地。
- **环境准备**：切换到项目指定的 Node.js 版本（如 `v22.x`）。
- **依赖安装与编译**：在 Server A 本地执行 `npm install` 和 `npm run build`。
- **打包压缩**：为了方便跨网络传输，将代码、编译产物（`dist`）和必要的运行依赖（`node_modules`）打包成一个压缩包（例如 `app.tar.gz`）。

---

### 3. 传输与远程控制（Server A $\rightarrow$ Server B）

这是跨机器部署最核心的一步。Jenkins 通常利用 **SSH 协议** 来完成跨服务器的通信：

- **免密认证**：Server A（Jenkins）提前将自己的 SSH 公钥配置到 Server B 的 `authorized_keys` 中，实现安全的免密登录。
- **文件传输（SCP/SFTP）**：Jenkins 将打包好的 `app.tar.gz` 远程复制到 Server B 的目标目录下。
- **远程命令执行**：文件传输完毕后，Jenkins 在 Server A 上发出远程 Shell 指令，指挥 Server B 现场解压并启动服务（例如通过 `pm2 reload` 实现平滑重启）。

---

### 4. 反馈与监控

Server B 上的脚本执行完毕后，会将执行结果（标准输出和错误日志）通过 SSH 连接原路返回给 Jenkins。 如果返回值是 `0`（代表成功），Jenkins 界面变绿（Success）；如果中间某一步（比如 Node 编译报错或 B 服务器磁盘满了）挂了，Jenkins 就会立刻中断并变红（Failure），同时触发报警通知。

---

## 三、 现代玩法：基础设施即代码（Jenkinsfile）

在过去，大家喜欢在 Jenkins 的图形界面上点点点来配置任务，但这种方式无法留痕、无法做版本控制。现代流水线推荐把整套逻辑写成代码随项目走，也就是 `Jenkinsfile`。

一个标准的跨机器 Node.js 部署脚本长这样：

```Groovy
pipeline {
    agent any
    environment {
        SERVER_B_IP = '192.168.1.1' // 生产环境服务器 B 的 IP
        DEPLOY_DIR  = '/var/www/nodejs-app' // 部署目录
    }
    stages {
        stage('1. 拉取代码') {
            steps {
                checkout scm // 自动拉取当前 Git 仓库
            }
        }
        stage('2. 本地编译打包') {
            steps {
                sh 'npm install' // 在 Jenkins 机器（Server A）上安装依赖
                sh 'tar -zcf app.tar.gz ./*' // 打包成压缩包
            }
        }
        stage('3. 远程部署到 Server B') {
            steps {
                // 利用 SSH 插件将文件发送到 Server B，并在 B 上执行命令
                sshPublisher(publishers: [
                    sshPublisherDesc(
                        configName: 'Server_B_Config',
                        transfers: [
                            sshTransfer(
                                remoteSourceFiles: 'app.tar.gz',
                                execCommand: '
                                    cd ${DEPLOY_DIR}
                                    tar -zxvf app.tar.gz
                                    pm2 reload project
                                ' // 在生产服务器（Server B）上执行的重启命令
                            )
                        ]
                    )
                ])
            }
        }
    }
}
```

---

## 结语

总结来说，Jenkins 的本质就是一个“传话筒”。

它通过**插件**连接不同的工具，通过 **SSH** 穿透不同的服务器，通过**流水线代码**将原本繁琐、易错的人工运维操作，变成了标准化的自动化生产线。理解了这一层机器与机器之间的通信与协作逻辑，以后无论面对多么复杂的 CI/CD 流水线，你都能游刃有余、一眼看穿本质。

---

了解更多？

- [[基于云原生的 DevOps]]
