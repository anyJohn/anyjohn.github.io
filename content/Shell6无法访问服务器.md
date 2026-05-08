---
title: XShell6无法访问服务器
author: AnyJohn
tags: []
categories:
  - server
date: 2019-09-25 15:37:00
---
在玩SSH时，听了舍友大佬的话，将SHH协议所在的文件夹权限修改为775后出现Xshell无法连接的问题。

```
chmod 775 .shh/
```
然后发现SSH的22端口无法使用，SSR所在端口正常运行。
google了一下发现。ssh文件夹不可以全部拥有写入权限，否则服务会无法正常运行。