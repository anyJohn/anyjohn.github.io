---
title: 初见Vue
date: 2019-10-17 15:51:00
author: AnyJohn
tags:
  - 前端
---

# vue2.X 核心技术-最流行的前端框架

## 学习清单：

* vue2.X框架常用知识点（模板语法、条件渲染、列表渲染等）
* vue2.X核心技术（vue-router、vuex）
* 集成vue2.x

---

vue优点：

* 方便集成，灵活小巧
* 语法清晰，便捷强大

# Vue常用知识点

<!--more-->

*vue Hello World！:*

```javascript
<script src="https://cdn.bootcss.com/vue/2.6.10/vue.min.js"></script>//引用bootCDN的vue库
```

建立一个Vue对象:

```javascript
new Vue({
    el:'.bg',
    data:{
        msg:'hello vue!'   
    }
｝)
```

# 模板语法：

差值语法`{{msg}}`，数据、js表达式

`v-bind`：绑定属性，省略为':'

`v-on`：绑定事件，省略为'@'
`v-model`:双向绑定，视图或者数据更新，同步更新另外一个。

# 计算属性与侦听器

* 计算属性：computed
* 监听器：watch
* 使用场景，watch（异步场景），computed（数据联动）

watch监听一个变量，computed可以监听很多变量，但变量是在vue实例中的。

```javascript
var app = new Vue({
    el:'#app',
    data:{
        msg:'hello Vue!'
    },
    watch:{         
        msg:function(newval,oldval){   
            console.log('newval is' + newval);
            console.log('oldval is' + oldval);          
    }//msg发生改变时执行,只监听msg的变化
    },
    computed:{
        msg1:function(){
        return 'computed:' + this.msg + ',' + this.another ;
   }//当msg1里的任意值发生变化都会执行
    }
})
```

# 条件渲染、列表渲染、Class与Style绑定

## 条件渲染

* v-if
* v-else，v-else-if
* v-show

## 列表渲染

v-for="item in list"

# vue核心技术

# vue-cli工具

在网页可视化界面管理vue项目、安装各种功能以及进行项目配置

# 组件化思想

什么是组件化？

* 独立的
* 可复用的
* 整体化的

为什么要组件化？

* 实现功能模块的复用
* 高执行效率
* 开发单页面复杂应用

如何进行拆分？

* 300行原则
* 复用原则
* 业务复杂性原则

组件化带来的问题：

* 组件状态管理（vuex）
* 多组件的混合使用，多页面，复杂业务（vue-router）
* 组件间的传参、消息、时间管理（props，emit/on，bus）

# vue代码规范（风格指南）

# vue-router

官方的路由管理工具

切换组件

# vuex

单项数据流概念

实际应用发现的问题：

* 多个视图依赖于同一状态（例：菜单导航）
* 来自不同视图的需要变更
同一状态

vuex介绍

* 为vue开发的状态管理模式
* 组件状态统一管理
* 组件状态改变遵循统一规则

# 如何进行调试

添加断点

添加输出函数

```javascript
console.log(),alert(),debugger
```

# 集成vue

# 如何集成vue

集成场景：

* 单页面、多页面引入vue.js
* 复杂单页面引用vue-cli工具

开发工作流：

* 需求调研（确定需求）
* 交互设计、逻辑设计、接口设计
* 代码实现、测试运行、线上部署

## git

* 创建项目git clone 、git init
* 创建分支、推送分支、合并分支
* 删除分支、回退版本
