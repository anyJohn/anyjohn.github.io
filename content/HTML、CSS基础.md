---
title: HTML、CSS基础
author: AnyJohn
tags:
  - 前端
  - HTML
  - CSS
categories:
  - 学习笔记
  - 前端
date: 2019-10-14 17:04:00
---
## HTML、CSS
### html、CSS、JavaScript关系：
1. Html是网页内容的载体
2. CSS样式是表现
3. JavaScript是逻辑、实现网页上的特效效果

## Html：
### HTML基础语法：
<!--注释语句-->
- `&nbsp`:空格
- `<strong>`:粗体
- `<em>`:斜体
- `<span>`:无语义，为了设置单独的样式而用 
- `<q>`:短文本引用
- `<blockquote>`:长文本引用
- `<br>与<br />`:换行，前者html4.01写法后者Xhtml写法，现在一般用后者
- `<hr>与<hr />`:分割线，前者html4.01写法后者Xhtml写法，现在一般用后者
- `<address>`:定义一个地址
- `<code>`:代码段
- `<pre>`:多行代码
- `<ul><li></li></ul>`:无序列表项
- `<ol><li>`:有序列表项
- `<img src="图片地址" alt="下载失败时的替换文本" title=“提示文本”/>`:插入图片
- `<a href="url" title="" target="_blank"></a>`:超链接，其中title帮助搜索引擎理解链接地址内容,target="blank"让浏览器从新标签页打开目标网址
- `<a href="mailto=mailUrl?subject=""&body></a>`: 使用mailto能让访问者发送电子邮件， 如果mailto后面同时有多个参数的话，第一个参数必须以“?”开头，后面的参数每一个都以“&”分隔，其中subject为邮件主题，body为邮件内容。  


### 提交数据：
                                  
#### 表单：

```
<form method="传送方式" action=“服务器文件”>
```
- `<form><form/>`:成对出现
- `action`:浏览者输入的数据被传送到的地方
- `method`:数据传输的方式（get/post）

#### 输入框：
```
<input type="text/password" name="名称" value="文本" />
```

- `type`:值为"text"时，输入框为文本框，为"password"时输入框为密码输入框
- `name`:为文本框命名，以备后台应用ASP、php使用
- `value`:为文本框设置默认值。（一般起到提示作用）

```
<input type="radio/checkbox" value="值" name="名称" checked="checked" />
```

- type:值为"radio"时，控件为单选框，为"checkbox"时，控件为复选框
- value:提交数据到服务器的值（后台程序PHP使用）
- name:为控件命名，以便后台程序ASP、PHP使用
- checked:当设置为"checked"时，该选项被默认选中

```
<input type="submit" value="提交">
```

- type:只有设置为submit时，按钮才有提交作用
- value:按钮上显示的文字

```
<input type="reset" value="重置">
```
- type:只有设置为reset时，按钮才有重置作用
- value:按钮上显示的文字

#### 下拉列表：

```
<select>
    <option value="">选项</option>
</select>
```
- `value`:`<option value="提交值">`
- `selected="selected"`:若在`<option>`中设置该属性，则该选项被默认选中
- `multiple="multiple"`:若在`<select>`中设置该属性，就可以多选

#### 文本域：

```
<textarea rows="行数" cols="列数">文本</textarea>
```

- `<textarea></textarea>`成对出现
- `cols`:输入域列数
- `rows`:输入域行数

#### 表格：
- `<table>`表格的开始与结束标志
- `<tr>`:表格的一行
- `<td>`:表格的单元格
- `<th>`:表格表头
- `<table summary="表格摘要">`:表格摘要，不显示，搜索引擎优化用
- `<caption>`:表格标题
  
## CSS:“层叠式样式表”：
### CSS基础：

css样式由“选择符”和“声明”组成，而“声明”又由“属性”和“值”组成。


- 选择符：又名选择器，指名网页中要应用样式规则的元素。
- 声明：在"{ }"中的就是声明，属性和值之间用“ : ”分隔。当有多条声明时用“;”隔开

```
p{font-size:12px;color:red;}
```

注释格式：`/*注释语句*/`

```
选择器{
    样式;
}
```

- 优点：通过定义某个样式，可以让不同网页位置的内容拥有统一的样式。

#### 三种插入CSS代码方法：
1. 内联式：把CSS代码直接写在现有的html标签中。如：
```
<p style="color:red">这里文字是红色</p>
```
2. 嵌入式：写在<style></style>之间，一般情况下嵌入式CSS样式写在<head></head>之间。如：
```
<style type="text/css">
span {
  color:red;
}
</style>
```
3. 外部式（外联式）:CSS代码写在单独的文件，在`<head>`标签内使用`<link>`链接到HTML文件中
```
<link href="base.css" rel="stylesheet" type="text/css" />
```

attetion:
1. css样式文件英文单词命名。
2. `rel="stylesheet type="text/css"`为固定写法，不可修改。
3. `<link />`标签一般写在`<head>`标签内

三种方法的优先级 ：内联式 > 嵌入式 > 外部式，即就近原则，前提：当嵌入式CSS样式位置在外部式后面时。

### CSS优先级：
#### 优先级（权值）：
权值高的CSS样式优先显示
标签的权值为1，类选择符的权值为10，ID选择符的权值最高为100，继承的权值只有0.1最低，例如：
```
p{color:red;}/*权值为1*/
p span{color:green;}/*权值为1+1=2*/
.waring{color:write;}/*权值为10*/
p span.warning{color:purple;}/*权值为1+1+10=12*/
#footer .note p{color:yellow;}/*权值为100+10+1=101*/
```

#### 权值相同？层叠：

层叠当相同权重的样式存在时，会根据CSS样式的前后顺序决定，最后面的CSS样式会被应用。即后面的样式会覆盖前面的样式。  
所以前面的css样式优先级就不难理解了：  
内联样式表（标签内部）> 嵌入样式表（当前文件中）> 外部样式表（外部文件中）。  

#### 重要性：
赋予某些样式最高权值，使用`!important`。
```
p{color:red!important;}
p{color:pink;}
```
`!important`要写在分号的前面。

#### CSS选择器：

#### 五种选择器：
- 标签选择器`h1`
- 类选择器`.class `
- id选择器`#id `
- 属性选择器`[name="mooc"]{color:red}`
- 通配符选择器`*{}`

类选择器：
为标签设置`class="类名称"`属性
```
.类选择器名称｛css样式代码；｝/*类前面要加入一个英文圆点*/
```
ID选择器：
为标签设置`id="id名称"`属性 
```
#id选择器名称{css样式代码；}/*id选择器前面加#*/
```
两者区别：
- 相同：可以应用任何元素。
- 不同：  
1.ID选择器只能在文档中使用一次  
2.id选择器比类选择器优先级高  
3.可以用类选择器词列表方法为一个元素同时设置多个样式，不可使用id选择器

子选择器：
```
.food>li{border:1px solid red;}
```
这行代码会使class名为food下的子元素li（水果、蔬菜）加入红色实线边框。  
包含（后代）选择器:  
````
.first span{color:red;}
````

总结：`>`作用于元素的第一代后代，空格作用于元素的所有后代。  
通用选择器：  
匹配html中所有元素，设置其样式。  
```
*{color:red;}
```

伪类选择符：  
给html中一个标签元素的鼠标滑过的状态来设置字体颜色
```
a:hover{color:red;}
```
鼠标滑过`<a>`标签，颜色变为红色。  
伪类选择符有很多，但是并不能兼容所有浏览器，a标签上使用:hover是最常用、兼容性最好的。  
分组选择符：  
为html中多个标签元素设置同一个样式时，可以使用分组选择符`,`
```
h1,span{color:red;}
```
相当于
```
h1{color:red;}
span{color:red;}
```

### CSS继承：
继承：
Css的某些样式具有继承性。“继承”允许样式不仅应用于某个特定的html标签元素，而且应用于其后代（子元素）。
```
p{color:red;}
<p>三年级时，我还是一个<span>胆小如鼠</span>的小女孩。</p>
```
attetion:
```
p{border:1px solid red;}
```
不具有继承性。

### CSS格式化排版：
字体：
```
body{font-family:"宋体";}
```
一般网页设置为“微软雅黑”。用英文兼容性更好。
```
body{font-family:"Microsoft Yahei"}
body{font-famliy:"微软雅黑";}
```
字号、颜色：
设置字号12px,颜色：灰色。
```
body{font-size:12px;color:#666;}
```
粗体：
```
p span{font-weight:bold;}
```
斜体：
```
p a{font-style:italic;}
```
下划线：
```
p a{text-decoration:underline;}
```
删除线：
```
.oldprice{text-decoration:line-through;}
```
缩进：
```
p{text-indent:2em}
```
2em的意思就是文字的两倍大小。
行间距（行高）：
```
p{line-height:2em;}
```
中文、字母、单词间距：
```
h1{
    letter-spacing:20px;/*中文、字母间距*/
    word-spacing:20px;/*单词间距*/
}
```
对齐：
```
h1{
    text-align:center;/*left居左*//*right居右*/
}
```

### 盒子模型：
#### 元素分类：
CSS中，Html标签元素被分为三种不同的类型：块状元素、内联元素（行内元素）、内联块元素
常用的块状元素:
```
<div> <p> <h1>......<h6> <ol> <ul> <dl> <table> <adress> <blockquote> <form>
```
常用的内联元素：
```
<a> <span> <br> <i> <em> <strong> <label> <q><var> <cite><code>
```
常用的内联块元素：
```
<img> <input>
```

#### 块状元素：  
特点：
- 每个块状元素从新的一行开始，并且其后的元素也另起一行。
- 元素的高度、宽度、行高以及顶和底边距都可以设置。
- 元素宽度在不设置的情况下，是它本身父容器的100%（和父容器宽度一致），除非设定一个宽度
```
a{display:block;}/*将内联元素a转换为块状元素*/
```

#### 内联元素：  
特点：  
- 和其他元素都在一行上。
- 元素的高度、宽度和顶部和底部的边距不可设置。
- 元素的宽度就是它包含的文字或图片的宽度，不可改变。
```
div{
    display:inline;/*将块状元素转换为内联元素*/
}
```

#### 内联块状元素：  
特点：  
- 和其他元素都在同一行。
- 元素的高度、宽度、行高、以及顶和底边距都可以设置。
```
display:inline-block/*将元素设置为内联块状元素*/
```

#### 什么是盒子模型？
页面元素承载内容
- `margin：-top,-bottom,-left,-right`,外边距，盒子之间的距离。
- `padding：-top,-bottom,-left,-right`,内边距，盒子边界与内容的距离。
- `border`：盒子的边框。
盒模型-边框：  
围绕内容以及补白的线。有粗细、样式和颜色三个属性。  
```
div{
    border:2px solid red;
}//缩写形式
div{
    border-width:2px;
    border-style:solid;
    border-color:red;
}//不缩写形式
div{
    border-bottom:2px solid red;//四边单独设置样式，-top,-left,-right,-bottom
}
```
`border-style`常见的样式有：  
dashed（虚线）、dotted（点线）、solid（实线）。  
border-color可以设置为十六制颜色。
#### 盒模型-宽度和高度：
CSS定义的宽（width）和高（height），指的是填充以里的内容范围。

![Not found](post-img0.png)

一个元素的实际宽度（盒子的宽度）= 左边界+左边框+左填充+内容宽度+右填充+右边框+右边界。高度同理。  
```
div{
    width:200px;
    padding:20px;
    border:1px solid red;
    margin:10px;
}
```

#### 盒模型-填充：
元素内容与边框之间可以设置距离。称之为“填充”。填充也分为上、右、下、左（顺时针）。  
````
div{padding:10px 15px 20px 25px;}//缩写
div{
    padding-top:10px;
    padding-right:15px;
    padding-bottom:20px;
    padding-left:25px;
}//完整
div{padding:10px;｝//四边边距都是10px
div{padding:10px 20px;}//上下为10px，左右为20px
````

#### 盒模型-边界：
元素和其他元素之间（盒子之间）可以用边界（margin）来设置。边界也分为上、右、下、左。
````
div{margin:10px 15px 20px 25px;}//缩写
div{
    margin-top:10px;
    margin-right:15px;
    margin-bottom:20px;
    margin-left:25px;
}//全部
div{margin:10px}
div{margin:10px 20px;}
````

区别：padding在边框内，margin在边框外。
### CSS布局模型：
布局模型与盒模型一样，是CSS最基本、最核心的概念。但布局模型建立在盒模型之上。  
三种布局模型：`Flow、Layer、Float`  
1. 流动模型（flow）
2. 浮动模型（float）
3. 层模型（layer）  

#### 流动模型：  
（flow）是默认的网页布局模式。  
特征：  
块状元素都会在所处的包括元素在内自上而下按照顺序垂直延伸分布，因为在默认状态下，块状元素的宽度都为100%。即，块状元素以行的形式占据位置。  
在流动模型下，内联元素都会在所处的包括元素内从左到右水平分布显示。  

#### 浮动模型：  
将多个块状元素并排显示。任何元素默认情况下都是不浮动的，但可以CSS定义为浮动。
```
div{
    width:200px;
    height:200px;
    border:2px red solid;
}
#div1{float:left;}
#div2{float:right}//设置div1左浮动，div2右浮动。
```
#### 层模型：
即将元素分层显示。CSS定义了一组定位（pasition）属性来支持层布局模型：  
1. 绝对定位`position:absolute`
2. 相对定位`position:relative`
3. 固定定位`position:fixed`

绝对定位：  
将元素从文档流脱离出来，然后用left、right、top、bottom属性相对于对其最接近的一个居右定位属性的父包括块进行绝对定位，若无，则相对于浏览器窗口。
```
div{
    position:absolute
    left:100px;//right
    top:50px;//bottom
}
```

相对定位：  
通过left、right、top、bottom、属性确定元素在正常文档流中的偏移位置。相对定位首先按照static（float）方式生成一个元素，然后相对于以前的位置移动。偏移前的位置保留不动。
```
#div1{
    position:relative;
    left:100px;
    top:50px;
}
```

固定定位：  
与绝对定位相似，但它的相对移动的坐标是视图（屏幕内的网页窗口），固定的元素会始终位于浏览器窗口内视图的某个位置，不会受文档流动影响。与background-attachment:fixed;属性功能相同。  

组合使用Relative和Absolute：
让position:absolute相对于其他元素定位  
必须满足条件：  
1. 参照定位的元素必须是相对定位元素的前辈元素。
2. 参照定位的元素必须加入posiotion:relative（不必要上下左右属性）。
3 定位元素加入position:abolute,便可以用top、bottom、left、right来进行偏移定位了。

### 缩写：
颜色缩写：16位颜色表达式中如果每两位相同则可以合并。  
盒子模型位置缩写：见上文。  
字体缩写：  
```
body{
    font-style:italic;
    font-variant:small-caps;
    font-weight:bold;
    font-size:12px;
    line-height:1.5em;
    font-family:"宋体",sans-serif;
}//标准
body{
    font:italic small-caps bold 12px/1.5em "宋体",sans-serif;
}//缩写
body{
    font:12px/1.5em "宋体"，sans-serif;
}//常用
```

### 颜色和值：
颜色：  
三种表达式：  
```
p{color:red;}//英文命令颜色
p{color:rgb(133,45,200);}//RGB颜色
p{color:#00ffff;}//十六进制颜色，
普遍使用，将RGB颜色用16进制表示
```

长度值：  
1. 像素：px
2. em：本元素给定的font-size，即一个字的长宽高
3. 百分比：相对于font-size

### CSS样式设置技巧：
水平居中：  
&nbsp;&nbsp;行内元素：  
  &nbsp;&nbsp;被设置元素为文本、图像等行内元素时，水平居中是通过给父元素设置 text-align:center 来实现的。   
```
.tetcenter{
    text-align:center;
}
```

定宽块状元素：  
&nbsp;&nbsp;满足定宽和块状两个条件的元素是可以通过设置“左右margin”值为“auto”来实现居中的。  
```
div{
    width:200px;
    margin:20px auto;
}
```
不定宽块状元素：  
&nbsp;&nbsp;三种居中方法：  
加入table标签  
设置display:inline  与第一种方法类似，显示类型设置为 行内元素 ，进行不定宽元素的属性设置。
设置position:relaive和left:50%，利用相对定位的方法，将元素向左偏移50%，即达到居中目的。  
第一种方法：  
&nbsp;&nbsp;利用table标签的长度自适应，因此将其看作一个定宽块状元素，然后再利用定宽元素居中的margin方法，使其居中。  
第一步：为需要设置的居中元素外面加入一个table标签（包括`<tbody>、<tr>、<td>`）  
第二步：为这个table设置左右margin居中。  
第二种方法：
改变块状元素的display属性为inline类型（设置为行内元素显示），然后父元素使用 text-align:center 来实现居中效果。  
第三种方法：  
通过给父元素设置float，然后给父元素设置position:relative和left:50%来实现水平居中。  

垂直居中：  
&nbsp;&nbsp;父元素高度确定的单行文本：
1. 设置父元素的height和line-height高度一致，即高度和行间距相同。
2. 弊端：当文字内容长度大于块的宽度时，就有内容脱离了块。
父元素高度确定的多行文本：
方法一：  
使用插入table（同理不定宽块状元素方法一），因为td标签默认情况下设置了vertical-align为middle，所以会居中显示  
```
table td{height:500px;background:#ccc}
```

方法二：  
&nbsp;&nbsp;兼容性较差，仅供参考。设置块状元素的`display:table-cell`，激活`vertical-align:middle;`IE6、7并不支持此样式。