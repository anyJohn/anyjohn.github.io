title: 外部JS文件调用Vue实例
author: AnyJohn
tags:
  - 学习笔记
  - Vue
categories:
  - 学习笔记
  - 前端
  - Vue
date: 2021-12-31 14:19:00
---
可以在Vue的声明周期里，把this传过去，在函数里直接使用就ok

```
import outerFunc from "./outerFunc.js"
created() {
	outerFunc(this)
}
```
业务场景如果只是复用方法，可以使用mixins混入，用起来更舒服我觉得。