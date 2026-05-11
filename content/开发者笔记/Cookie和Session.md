---
title: Cookie和Session
author: AnyJohn
tags:
  - 前端
date: 2019-11-12 16:20:00
---

# 浏览器Cookie

- Cookie是浏览器保存在本地的文本内容
- Cookie常用于保存登录状态,用户资料等小文本
- Cookie具有时效性,Cookie内容会伴随请求发送给Tomcat  

(以下代码写在Servlet子类的doGet(),doPost()方法内)  

创建cookie

```javascript
Cookie cookie = new Cookie("user","admin");
cookie.setMaxAge(60*60*24*7);//设置cookie保存7天,默认是关闭浏览器后即删除
response.addCookie(cookie);
```

获得cookie

```javascript
//request.getCookies()用户获取所有的Cookie
Cookie[] cs = request.getCookies();
String user = null;//存放用户名
if (cs==null){    response.getWriter().println("User not login");    return;}
for(Cookie c:cs){
    System.out.println(c.getName()+":"+c.getValue());
    if(c.getName().equals("user")){
        user = c.getValue();
        break;
    }
}
if(user==null){
    response.getWriter().println("user not login");
} else {
    response.getWriter().println("user:"+user);
}
```

# Session-用户会话

- Session(用户会话)用于保存与”浏览器窗口”对应的数据
- Session的数据存储在Tomcat服务器的内存中,具有时效性
- Session通过浏览器的Cookie的SessionId值提取用户数据

创建session:

```javascript
HttpSession session = request.getSession();session.setAttribute("name","张三");
```

取得session:

```javascript
HttpSession session = request.getSession();
String name = (String)session.getAttribute("name");
```

总而言之,Session就是一个与浏览器窗口绑定的,且把对象存储在Tomcat内存中的对象

![Not found](post-img4.png)
