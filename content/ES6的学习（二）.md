---
title: ES6的学习（二）
author: AnyJohn
tags:
  - 前端学习笔记
  - ES6
  - Javascript
categories:
  - 学习笔记
  - 前端
date: 2020-08-17 16:10:00
---
## ES6的学习（二）
 ### 解构赋值
 ES6中允许从数组中提取值，对变量赋值，对象也可以实现解构。
 
 #### 数组解构
 数组解构允许我们按照一一对应的关系从数组中提取值，然后将值赋值给变量
 
 ```
 let ary = [1,2,3];
 let [a,b,c] = ary;
 console.log(a);
 console.log(b);
 console.log(c);
 // 输出1 2 3
```
 
 如果解构不成功，变量的值为undeined
 
 ```
 let [foo] = [];
 let [bar,foo] = [1];
 console.log(bar);// 1
 console.log(foo);// undefined
```

#### 对象解构
对象解构允许我们使用变量的名字匹配对象的属性，匹配成功将对象属性的值赋值给变量

```
let person = { name: 'john' , age: 20};
let { name, age } = person;
console.log(name); // 'john'
console.log(age); //20
//
let {name: myName , age: myAge} = person;
console.log(myname); // 'john'
console.log(myAge);// 20
```
 ### 箭头函数
 ES6中新增的定义函数的方式，用来简化函数定义语法的
 #### 箭头函数的几种写法
```
const fn = () => {
    console.log(123)
}
fn();

// 如果函数体只有一句代码，且代码执行结果就是返回值，可以省略大括号
const sum = (num1,num2) => { //一般写法
    return num1 + num2;
}
const sumLite = (num1,num2) => num1 + num2 ; //简化写法
let result = sumLite(10,20);
console.log(result);

// 如果形参只有一个，可以省略小括号
function fn (v) { //一般写法
    return v;
}
const fnLite = v => v;// 简化写法
```

#### 箭头函数中的this
箭头函数不绑定this关键字，箭头函数中的tis，指向的是**函数定义位置的上下文this**。

```
const obj = {name: '张三'}
function fn () {
    console.log(this);
    return () => {
        console.log(this)
    }
}
const resFn = fn.call(obj);
resFn();

// 箭头函数没有自己的this关键字，this关键字将指向箭头函数定义位置中的this
function fnTest () {
    console.log(this);
    return () => {
        console.log(this);
    }
}
console obj = {name: 'john'};
const resFn =  fnTest.call(obj);// 将fnTest中的this指向obj
resFn();// 输出了两次"john"
```

### 剩余参数
剩余参数语法允许我们将一个不定数量的参数表示为一个数组。

```
function sum (fitst, ...args) {
    console.log(first); // 10
    console.log(args); //[20,30]
}
sum(10,20,30);

const sumLite = (...args) => {
    let total = 0;
    args.forEach(item => total +=item)
    return total;
};
console.log(sumLite(10,20));
console.log(sumLite(10,20,30));
```

剩余参数和解构混合使用

```
let students = ['wangwu','zhangsan','lisi'];
let [s1, ...s2] = students;
console.log(s1); // 'wangwu'
console.log(s2); // ['zhangsan', 'lisi']
```
