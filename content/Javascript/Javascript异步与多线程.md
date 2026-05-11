---
title: Javascript异步与多线程
author: AnyJohn
tags:
  - 前端
date: 2019-10-20 15:50:00
---

# 为什么要使用JavaScript多线程编程？

浏览器端JavaScript是以单线程的方式执行的，也就是JavaScript和UI渲染占用同一主线程。一般来说：

1. 非阻塞性的任务采取同步的方法，直接在主线程的执行栈完成。
2. 阻塞性的任务采取异步操作，异步的工作一般会交给其他线程完成。

如果JavaScript进行高负载处理，UI渲染就很可能被阻断，浏览器就会出现卡顿，降低了用户的体验。

而且多核CPU普及，单线程无法充分发挥CPU的计算能力。

# 为什么JavaScript是单线程的？

JavaScript的单线程与其用途有关。JavaScript作为浏览器脚本语言，其主要用途是与用户交互，以及操作DOM。这决定了他只能是单线程，否则会带来很复杂的同步问题。
比如，假定JavaScript同时有两个线程，一个线程往DOM节点上添加内容，一个线程删除了这个节点，这时浏览器应该以那个线程为准？当一个函数执行的时候，JS引擎会锁住DOM树，其他事件的响应代码只能在队列中等待，并且此时页面卡死（即无法响应）。

# 为什么JavaScript需要异步？

如果JS中不存在异步，只能自上而下执行，如果上一行解析事件很长，那么下面的代码就会被阻塞，对于用户而言，阻塞就意味着“卡死”，这样就导致了很差的用户体验。

# JavaScript如何实现异步？

是通过事件循环（event loop），理解了event loop机制，就理解了js的执行机制

## JavaScript中的event loop

![Not found](post-img1.png)

## 哪些是宏任务那些是微任务？

宏服务（macrotask）：

|#|浏览器|Node|
|----|----|----|
|同步代码|✔|✔|
|UI render|✔|✔|
|I/O|✔|✔|
|setTimeout|✔|✔|
|setInterval|✔|✔|
|requestAnimationFrame|✔|✖|
|settimmediate|✖|✔|

微服务（microtask）：

|#|浏览器|Node|
|----|----|----|
|process.nextTick|✖|✔|
|Promise|✔|✔|
|MutationObserver|✔|✖|

## 任务的优先级

![Not found](post-img2.png)

### 宏任务macrotask：  

主代码块>setImmediate>MessageChannel>setTimout/setInterval
(为了提升用户体验，大部分浏览器会将DOM事件回调优先处理，其次是network IO操作的回调，在然后是UI render，之后的顺序不同浏览器表现不同)

### 微任务microtask：

process.nextTick>Promise=MUtationObserver
任务的执行顺序是建立在优先级之上的，那么如果队列已经有一个setTimeout的宏任务，后来又加入了主代码的宏任务，会让主代码的任务插队。

### 回过头来看setTimeout（指定时间后执行）和setInterval（指定周期执行）

```javascript
setTimeout(function(){
	console.log('down')
})
```

`setTimeout`，`setInterval`并不是多线程，只是一个定时的事件触发器，它们在合适的时间把一些JS代码塞到JS引擎的队列中。这两个函数根本上其实是事件触发函数。

从表面上可以解释为3秒后执行setTimeout里的函数。但更为准确地解释为：3秒后，setTimeout里的函数会被推入event queue，而event queue（事件队列）里的人物，只有在主线程空闲时间才会执行。

所以只有同时满足以下两点才会执行该函数：

1. 3秒后
2. 主线程空闲

`setTimeout(aFunction(){...}, 0)`，这行代码看似的意思是在0秒之后执行`aFunction`, 但这并不意味着立即执行。其它真正的意思是立刻把`aFunction`的代码放到当前JS引擎的队列中。所以当前代码块执行完成之前，`aFunction`的代码是得不到执行的。比如这段代码，一定是`world`先出来，`hello`后出来。尽管`setTimeout`的参数是0，但这并不意味着立即执行

```javascript
setTimeout(function() {  
    alert("hello");  
}, 0)  
alert("world");
```

## 再看看异步Ajax

![Not found](post-img3.png)

JS是单线程的，当一个函数执行的时候，JS引擎会锁住DOM树，其他时间的响应代码只能在队列中等待，并且此时页面卡死。  

那么为何异步Ajax可以实现页面可响应的同时发起Ajax请求呢？
事实上Ajax确实使用了多线程。Ajax请求的Http连接由浏览器打开了另外一个线程执行，执行完毕后给JS引擎发送一个事件，这时候异步请求的回调代码得以执行。
