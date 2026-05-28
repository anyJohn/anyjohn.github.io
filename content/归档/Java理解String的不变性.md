---
title: Java理解String的不变性
author: AnyJohn
tags:
  - 后端
date: 2019-11-14 16:17:00
---

# String对象创建后不能被修改,是不可变的,所谓的修改其实是创建了新的对象,所指向的内存空间不同

```javascript
//比如创建四个String对象,值都为"Love"
String s1 = "Love";
String s2 = "Love";
String s3 = new String("Love");
String s4 = new String("Love");
//对于字符常量,只创建一个,重复的会引用常量池中的内容,所以比对s1,s2的内存,会返回true
System.out.println(s1 == s2);
//s1和s3是不同的对象,会返回false
System.out.println(s1 == s3);
//s3和s4是不同的对象,两者都开辟了不同的内存空间,所以返回false
System.out.println(s3 == s4);
//修改s1,s1会指向新的内存空间
s1 = s1+" you";
System.out.println(s1);
```

# 结合try - finally理解

```javascript
public static int test1() { 
    int i; 
    try {
        i = 1;
        return i; 
    } finally { 
        i = 3; 
    }
}//结果返回1;
//返回return 复制的内存块,即1,原来的i所在内存内容更改为3

public static String test2() { 
    String i; 
    try {
        i = "abc";
        return i; 
    } finally { 
        i = "def"; 
    }
}//结果返回"abc"
//返回return复制的,"abc"常量所在的内存区域,即"abc";在finally中,i被引用向新的内存区域"def"

public static Demo test3() { 
    Demo demo = new Demo(); 
    try {
       demo.i = 1;
       return demo; 
    } finally { 
        demo.i = 3; 
    }
}//结果返回demo对象,demo.i为3
//对象存在堆中,指针存在堆中,return复制了指向堆中对象的指针,所以,对象内数据的改变,会影响指针指向的值

public static int test4() { 
    Demo demo = new Demo(); 
    try {
       demo.i = 1;
       return demo.i; 
    } finally { 
        demo.i = 3; 
    }
}//结果返回 1
//为何会与test4()方法不同呢?在这里return复制了demo.i变量所在的内存块,原来demo.i所在的内存更改为3,与test1()方法就很类似了

public class Demo{//Demo类
    public int i ; 
}
```
