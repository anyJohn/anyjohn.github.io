---
title: 啥是个Token？
author: AnyJohn
tags:
  - 计算机网络
date: 2020-08-27 16:51:00
---
### Token是什么？
Token是**服务端**生成的一串字符串，以作为 **客户端**进行请求的一个令牌，当第一次登录后，**服务器**生成一个Token并将这个Token返回给**客户端**，在之后的请求中，客户端只需要带上这个Token前来请求数据即可，不需要再次带上用户名和密码。 即带着“令牌”，证明了自己的合法身份。

### 为什么要使用Token呢？
作为一个engineer，当然是要“find questions，and solve questions”了。
**如果没有token，那么我们在实际中会遇见什么问题呢？**
1. 请求的时候需要带上用户名和密码进行验证，多次查询数据库，服务器压力山大。
2. 跨域了，服务器不认识我了，又得重新登录认证。
3. 用Cookie验证身份，结果就被CSRF（跨站请求伪造）攻击了，损失惨重。
4. 登录后因为网络波动负载均衡到另一台服务器上了，另一台服务器不认识我，只能再次登录认证。

**那么Token就是来拯救这些问题的。**
1. 使用Token减少了服务器端查询数据库的频率，减少了数据库服务器的压力，服务器轻松多了。
2. 完全是应用服务器来管理Token的，所以可以避开[同源策略](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)
3. 被服务器端加密的Token能有效的抵抗CSRF（跨站请求伪造）攻击者无从得知Token的初始值。
4. Token是无状态的，也就是每次登录都会生成全局新的Token，而且Token自己就解决了用户的信息验证，负载均衡可以很轻松的将用户信息从一个服务器传递到另一个服务器上，即在多个服务间共享。

在这里我写的很简略，更多的了解可以参考以下大佬的博客。
参考博客：
[什么是token及怎样生成token--CSDN](https://www.cnblogs.com/lufeiludaima/p/pz20190203.html)
[什么是token--简书](https://www.jianshu.com/p/24825a2683e6)
[深入理解token--博客园](https://www.cnblogs.com/xuxinstyle/p/9675541.html)