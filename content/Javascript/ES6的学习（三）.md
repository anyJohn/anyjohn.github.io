---
title: ES6的学习（三）
author: AnyJohn
tags:
  - 前端
date: 2020-08-17 16:47:00
---
## ES6的学习（三）
### 扩展运算符
#### Array的扩展方法
**扩展运算符（展开语法）**
扩展运算符可以将数组或者对象转为逗号分割的参数序列。
```
let ary = [1,2,3];
console.log(...ary); // 1 2 3
// 逗号被当做方法的参数分隔符
console.log(1,2,3)
let letters = ['a','b','c'];
console.log(...letters);// a b c
```
**扩展运算符的应用**
扩展运算符可用于*合并数组*
```
// 方法一
let ary1 = [1,2,3];
let ary2 = [3,4,5];
let ary3 = [...ary1,...ary2];
console.log(ary3); // [1,2,3,4,5,6]

//方法二 
ary1.push(...ary2);
console.log(ary1);
```

扩展运算符可以将类数组（伪数组）或者可遍历对象转换为真正的数组

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
	<title>test</title>
</head>
<body>
	<div>1</div>
	<div>2</div>
	<div>3</div>
	<div>1</div>
	<div>2</div>
	<div>3</div>
	<div>1</div>
	<div>2</div>
	<div>3</div>
	<script type="text/javascript">
	let oDivs = document.getElementsByTagName('div');
	console.log(oDivs);
	let ary = [...oDivs];
	//ary.push('a');
	console.log(ary);
	let aryFrom = Array.from(oDivs);
	console.log(aryFrom);
	</script>
</body>
</html>
```

### Array的扩展方法
#### 构造函数方法：Array.from()
* 将类数组或可遍历对象转换为真正的数组
* 接受第二个参数，作用类似于数组的map方法，用来对每个元素进行处理，将处理后的值放入返回的数组。

```
let arrayLike = {
    '0' : '1',
    '1' : '2',
    '2' : '3',
    length:3
 };
var ary =  Array.from(arrayLike,item => item * 2)
console.log(ary);// [2,4,6]
let aryFrom  =  Array.from(arrayLike); 
console.log(aryFrom); // [1,2,3]
```

#### 实例方法：find()
用于找出第一个符合条件的数组成员，如果没有找到则返回undefined

```
let ary = [{
    id: 1,
    name: 'zhagsan'
},{
    id: '2',
    name: 'lisi'
}];
let target = ary.find((item,index) => item.id ==2);
console.log(target)
```
#### 实例方法：findIndex()
 用于找出**第一个**符合条件的数组成员的位置，如果没有找到则返回-1
 
 ```
 let ary = [1,5,10,15];
 let index = ary.findIndex((value,index) => value > 9);
 console.log(index);// 2
```

####  实例方法：includes()
表示某个数组是否包含给定的值 ，返回布尔值。

```
let array1 = [1,2,3]
let index1 = array1.includes(2) //true
let index2 = [1,2,3].includes(4) //false
console.log(index1);
console.log(index2);
```
### String的扩展方法
#### 实例方法：startsWith()和endsWith()

```
let str = 'Hello world!';
console.log(str.startsWith('Hello')); //true
console.log(str.startsWith('hello')) //fales,该方法会区分大小写
console.log(str.endsWith('!')) //true
```

#### 实例方法：repeat()
repeat()方法表示将元字符串重复n次，返回一个新的字符串

```
let str1 = 'x'.repeat(3);  // 'xxx'
console.log(str1);
let str2 = 'hello'.repeat(2) // 'hellohello'
console.log(str2);
```

### Set 数据结构
ES6提供了新的数据结构Set。它类似于数组，但是成员的值都是惟一的，没有重复的值。
Set本身是一个构造函数，用来生成Set数据结构。

```
const s = new Set();
```

Set函数可以接受一个数组作为参数，用来初始化。

```
const set = new Set([1,2,3,4,5]);
```
示例：
```
const s1 = new Set();
console.log(s1.size);

const s2 = new Set(['a','b']);
console.log(s2.size);

const s3 = new Set(['a','a','b','b']);
console.log(s3.size);
const ary = [...s3]; // 使用扩展运算符将set数据结构转换为数组
console.log(ary)
```
#### Set数据结构的实例方法
* add(value)：添加某个值，返回Set结构本身
* deleate(value)：删除某个值，返回一个布尔值，表示删除是否成功
* has(value)： 返回一个布尔值，表示该值是否为Set的成员
* clear()：清除所有成员，没有返回值

```
const s = new Set();
s.add(1).add(2).add(3);// 向Set结构中添加值
console.log(s);

s.delete(2); // 删除set结构中的2值
console.log(s);

console.log(s.has(1)); // 表示set结构中是否有1这个值 返回布尔值

s.clear(); //清除set结构中的所有值
console.log(s);
```

#### Set的遍历
Set结构的实例与数组一样，也拥有forEach()方法，用于对每个成员执行某种操作，没有返回值。
```
s.forEach(value => console.log(value))
```

示例：
```
const s = new Set(['a','b','c']);
s.forEach(value =>{
    console.log(value)
})
```

![Not found](post-img7.png)
