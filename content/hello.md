title: hexo-admin安装与使用
author: AnyJohn
tags:
  - hexo
categories:
  - blog
date: 2019-09-23 16:47:00
---
## hexo-admin安装与使用
使用了hexo-admin可视化界面操作
hexo-admin官网:https://jaredforsyth.com/hexo-admin/
安装hexo-admin：

```
npm install --save hexo-admin
hexo server -d
```
打开 http://localhost:4000/admin/ 
在settings中设置账号密码
配置hexo根目录配置文件_config.yml

```
admin:  
username: 
password_hash: //用户名密码可以不设置
secret: super secret phrase//用以cookies安全；  
Command: './admin_script/hexo-generate.sh'
```
这里的command对应于界面中的deploy按钮，在下面写上脚本，可以一键生成html页面，并提交到托管的地址
在根目录下的admin_script中新建hexo-generate.sh文件，编辑：

```
#!/usr/bin/env sh
hexo clean
hexo g  -d
```