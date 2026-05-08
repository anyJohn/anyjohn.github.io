---
title: 浏览器输入url后发生了什么
author: AnyJohn
tags:
  - 学习笔记
  - 面经
categories:
  - 学习笔记
  - 面试
  - ''
date: 2021-12-29 14:42:00
---
### 浏览器输入url后发生了什么
1. 找本地HOST文件，检查文件中是否有相应域名和IP的对应关系
2. 找DNS服务器，从DNS服务器获取域名对应的IP地址
3. 建立TCP链接，三次握手
![Not found](post-img25.png)
4. 客户端发送http请求
5. 服务器处理http请求
6. 服务器返回响应结果
![Not found](post-img26.png)
7. 关闭TCP链接，四次握手
![Not found](post-img27.png)
8. 浏览器解析HTML
9. 浏览器布局渲染，页面展示给用户

最后一步这里有两个概念需要了解，重绘（repaint）和回流（reflow、layout）
* 重绘（repaint）：屏幕的一部分重画，不影响整体布局，比如某个CSS的背景色变了，但元素的几何尺寸和位置不变
* 回流（reflow）：render tree渲染树的一部分（或者全部）因为元素的规模尺寸、布局、隐藏等改变需要重新构建。这就称为回流，每个页面至少需要一次回流，就是在页面首次加载时，因为构建render tree 一定会发生回流，完成回流后，浏览器会重新绘制受影响的部分到屏幕中，该过程称之为重绘。



