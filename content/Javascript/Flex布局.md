---
title: Flex布局
author: AnyJohn
tags:
  - 前端
date: 2020-09-22 16:44:00
---
### 引言
Flex布局区别于传统布局，可以更好、更简便响应式地实现各种布局。通过简单的属性设置，即可达成曾经十分复杂的，如盒子垂直居中等情况。 目前已得到所有浏览器的支持。具体支持如下图。  
其中红色表示不支持、绿色条纹表示部分支持、黄色角标表示需要使用-webkit-语法。
![Not found](post-img11.png)

布局的传统解决方案，基于盒状模型，依赖`display`属性+`position`属性+`float`属性。这种布局方案对于特殊的布局（尽管现在非常常用，但不得不承认对于最初的设计而言，横向排列与垂直居中是很特殊的），比如，垂直居中就不容易实现。  
于是，2009年，W3C提出了一种新的布局方案——flex布局，未来即现在的布局首选方案。  

### Flex布局是什么？
Flex是Flexible Box的缩写，意为“弹性布局”，用来为盒子模型提供最大的灵活性。任何一个容器都可以被指定为Flex布局。  
```
.container {
    display: flex;
}
```

行内元素也可以使用Flex布局。  

```
.container {
    display: inline-flex;
}
```
兼容老版本的Webkit内核浏览器（市占率大概百分之0.1，所以大部分情况不必考虑）需要加上-webkit-前缀
```
.container {
    display: -webkit-; //Safari
    display: flex;
}
```
**注意**，设置Flex布局后，子元素的`float`、`clear`和`vertical-align`属性将失效。

## 基本概念
采用Flex布局的元素，称为Flex容器（Flex container），简称“容器”。它的所有子元素自动成为容器成员，称为Flex项目（Flex item），简称“项目”。  、

![Not found](post-img12.png)

容器默认存在两根轴，水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做`main start`，结束位置叫做`main end`；交叉轴的开始位置叫做`cross start`，结束位置叫做cross end。
项目默认沿主轴哦爱列。单个项目占据的主轴空间叫做`main size`，占据的交叉轴空间叫做`cross size`。  

## 容器的属性
以下六个属性设置在容器上

* flex-direction
* flex-warp
* flex-flow
* justify-content
* align-items
* align-content

### flex-diretion属性
`flex-direction`属性决定主轴的方向（即项目的排列方向）
```
.container{
    flex-direction: row | row-reverse | colum | colum-reverse
}
```
![Not found](post-img13.png)
它的四个值分别代表为：
* row（默认值）：主轴为水平方向，起点在左端。
* row-reverse：主轴为水平方向，起点在右端。
* colum：主轴为垂直方向，起点在上沿。
* colum-reverse：主轴为垂直方向，起点在下沿。

### flex-warp属性
默认情况下，项目都排在一条线（又称“轴线”上）。`flex-warp`属性定义，如果一条轴线空间占满后，应该如何换行。
![Not found](post-img14.png)

```
.container{
    flex-warp: nowarp | warp | warp-rerverse;
}
```
它可以取三个值：

1. nowarp（默认）：不换行。  
![Not found](post-img15.png)
2. warp：换行，第一行在上方。  
![Not found](post-img16.png)
3. warp-reverse：换行，第一行在下方。  
![Not found](post-img17.png)

### flex-flow属性
flex-flow属性是flex-direction属性和flex-warp属性的简写形式，默认值为row nowarp。
```
.container{
    flex-flow: <flex-direction> <flex-warp>;
 }
```

### justity-content属性
justify-content属性定义了项目在主轴上的对齐方式。
```
.container{
    justity-content: flex-start | flex-end | center | space-between | space-around;
}
```
![Not found](post-img18.png)
它可取五个值，具体对齐方式与轴的方向有关。下面假设主轴为从左到右。
* flex-start（默认值）：左对齐。
* flex-end：右对齐。
* center：居中。
* space-between：两端对齐，项目之间的间隔都相等。
* space-around：每个项目两侧的捡个相等。所以，项目之间的间隔比项目与边框的捡个大一倍

### align-items属性
align-items属性定义项目在交叉轴上如何对齐。
```
.contaioner{
    align-items: flex-start | flex-end | center | baseline | stretch
}
```
![Not found](post-img19.png)
它可取五个值。具体的对齐方向与交叉轴的方向有关，下面假设交叉轴从上到下。
* flex-start：交叉轴的起点对齐。
* flex-end：交叉轴的终点对齐。
* center：交叉轴的中点对齐。
* baseline：项目的第一行文字的基线对齐。
* stretch（默认值）：如果项目未设置高度或者高度设为auto，将占满整个容器的高度。

### align-content属性
 align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

```
.container {
    align-content: flex-start | flex-end | center | space-between | space-around | stretch;
 }
```
![Not found](post-img20.png)

 该属性有6个属性
 * flex-start：与交叉轴的起点对齐。
 * flex-end：与交叉轴的终点对齐。
 * center：与交叉轴的中点对齐。
 * space-between：与交叉轴两侧的捡个都相等。所以轴线之间的间隔比轴线与边框的间隔大一倍。
 * stretch（默认值）：轴线占满整个交叉轴。
 
 ## 项目的属性
 以下六个属性设置在项目上
 * order
 * flex-grow
 * flex-shink
 * flex-basis
 * flex
 * align-self
 
 ### order属性
 order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。
 
```
 .item {
    order:<integer>;
 }
```

![Not found](post-img21.png)

### flex-grow属性
flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。
```
.item {
    flex-grow:<number>; // default 0
}
```
![Not found](post-img22.png)
如果所有的项目的flex-grow属性都为1，则它们将等分剩余的空间。如果一个项目的flex-grow属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。

### flex-shrink属性
flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。
```
.item {
    flex-shrink:<number>;// default 1
}
```
![Not found](post-img23.png)
如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。
负值对该属性无效。

### flex-basis属性
flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目本来的大小。

```
.item { 
    flex-basis:<length> | auto ; // default auto
}
```
它可以设为跟width或height属性一样的值（比如350px），则项目将占据固定空间。

### flex属性
flex属性是flex-grow，flex-shrink和flex-basis的简写，默认值为0 1 auto。后两个属性可选。
```
.item {
    flex: none | [<'flex-grow'><'flex-shrink'>? || <'flex-basis'>]
}
```
该属性有两个快捷值：auto（1 1 auto）和none（0 0 auto）。
建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值。

### align-self属性
align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。
```
.item {
    align-sekf:auto | flex-start | flex-end | center | baseline | stretch;
}
```
![Not found](post-img24.png)
该属性可能取六个之，出了auto，其他都与align-items属性完全一致。

来自[阮一峰的网络日志](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)。
*来源：http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html*