---
title: ES6的学习（一）
author: AnyJohn
tags:
  - 前端学习笔记
  - ES6
  - Javascript
categories:
  - 学习笔记
  - 前端
date: 2020-08-13 16:41:00
---
##  ES6的学习（一）
### 什么是ES6？
ES的全称是ECMASccript，它是由ECMA国际标准化组织，指定的一项脚本语言的标准化规范。
ES6即ES2015之后的版本的泛指。

### 为什么使用ES6？
JavaScript语言存在一些缺点，需要不断的推进更新来完善。
* 变量提升特性增加了程序运行时的不可测性
* 语法松散，实现相同的功能，不同的人可能会写出不同的代码。

### ES6新增语法
#### let
ES6中新增的用于声明变量的关键字
* let声明的变量只在所处于的块级作用域有效

```
if (true) {
    let a = 10;
    var b = 20;
    console.log(a);
    console.log(b);
}
console.log(a);// a is not defined
console.log(b);//b = 20
// a只在{}这个块级作用域生效，而在这个作用域之外的都是未定义。
```

* 在一个大括号中，使用了let关键字声明的变量才具有块级作用域。var关键字是不具备这个特点的。
* 防止循环变量变成全局变量

```
for (var i = 0;i<2;i++) {
}
console.log(i); //i = 2
for (let j = 0;j<2;j++) {
}
console.log(j);//j is not defined
```

* 不存在变量提升（旧语法中，变量可以不经声明直接使用，在ES6中这是错误的）

```
console.log(a);// a is not defined
let a = 20;
```

* 暂时性死区特性，一旦在块级区域使用了let变量，则该变量会绑定区块，与区块外部无关。

```
var num = 10;
if (true) {
    console.log(num);// num is not defined
    let num = 20;
}
```

#### const
作用：声明常量，常量就是值（内存地址）不能改变的量。
* 具有块级作用域

```
if(true) {
    const a = 10;
    if (true) {
        const a = 20;
        console.log(a);// a = 20
    }
    console.log(a);// a = 10
}
console.log(a); // a is not defined
```

* const声明常量必须赋值

```
const PI; // Missing initializr is const declaration
```

* 常量赋值后，值不能修改。

```
const PI = 3.14;
PI = 100; // Assignmnt to constant variabl

const ary = [100,200];
ary[0] = 'a';
ary[1] = 'b';
console.log(ary); //{'a','b'};
ary = {'a','b'};// Assigment to constant variable
// 第一种方法赋值，没有改变数组的内存地址，第二种方法改变了数组的内存地址，所以会报错
```

### let、const、var 的区别
1. 使用 var声明的变量，其作用域为**该语句所在的函数内，且存在变量提升现象**
2. 使用let声明的变量，其作用域为**该语句所在的代码块内，不存在变量提升**
3. 使用const声明的是常量，在后面出现的代码中**不能再修改该常量的值（内存地址）**

##  ES6的学习（一）
### 什么是ES6？

ES的全称是ECMASccript，它是由ECMA国际标准化组织，指定的一项脚本语言的标准化规范。
ES6即ES2015之后的版本的泛指。

### 为什么使用ES6？
JavaScript语言存在一些缺点，需要不断的推进更新来完善。
* 变量提升特性增加了程序运行时的不可测性
* 语法松散，实现相同的功能，不同的人可能会写出不同的代码。

### ES6新增语法
#### let
ES6中新增的用于声明变量的关键字
* let声明的变量只在所处于的块级作用域有效

```
if (true) {
    let a = 10;
    var b = 20;
    console.log(a);
    console.log(b);
}
console.log(a);// a is not defined
console.log(b);//b = 20
// a只在{}这个块级作用域生效，而在这个作用域之外的都是未定义。
```

* 在一个大括号中，使用了let关键字声明的变量才具有块级作用域。var关键字是不具备这个特点的。
* 防止循环变量变成全局变量

```
for (var i = 0;i<2;i++) {
}
console.log(i); //i = 2
for (let j = 0;j<2;j++) {
}
console.log(j);//j is not defined
```
* 不存在变量提升（旧语法中，变量可以不经声明直接使用，在ES6中这是错误的）

```
console.log(a);// a is not defined
let a = 20;
```

* 暂时性死区特性，一旦在块级区域使用了let变量，则该变量会绑定区块，与区块外部无关。

```
var num = 10;
if (true) {
    console.log(num);// num is not defined
    let num = 20;
}
```

#### const
作用：声明常量，常量就是值（内存地址）不能改变的量。
* 具有块级作用域

```
if(true) {
    const a = 10;
    if (true) {
        const a = 20;
        console.log(a);// a = 20
    }
    console.log(a);// a = 10
}
console.log(a); // a is not defined
```

* const声明常量必须赋值

```
const PI; // Missing initializr is const declaration
```
* 常量赋值后，值不能修改。
```
const PI = 3.14;
PI = 100; // Assignmnt to constant variabl

const ary = [100,200];
ary[0] = 'a';
ary[1] = 'b';
console.log(ary); //{'a','b'};
ary = {'a','b'};// Assigment to constant variable
// 第一种方法赋值，没有改变数组的内存地址，第二种方法改变了数组的内存地址，所以会报错
```

### let、const、var 的区别
1. 使用 var声明的变量，其作用域为**该语句所在的函数内，且存在变量提升现象**
2. 使用let声明的变量，其作用域为**该语句所在的代码块内，不存在变量提升**
3. 使用const声明的是常量，在后面出现的代码中**不能再修改该常量的值（内存地址）**

![Not found](post-img6.png)