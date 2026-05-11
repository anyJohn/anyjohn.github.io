---
title: VSCode开发Vue常用插件
author: AnyJohn
tags:
  - 工具
date: 2020-08-27 16:49:00
---

# VSCode 开发Vue 常用插件（基于个人喜好）

## VSCode如何安装插件

点击左侧的方块块，可以进入插件目录，在上方可以在插件商店中搜索想要安装的插件。搜索到点击install（安装）即可安装插件，有的插件需要json配置一下。

## 推荐一些我个人在使用的插件

在使用的过程中我看了几个博客试用了几款插件，在这里我只说一下我在用的吧，大家有什么好用的插件也可以评论说说。

1. **Chinese(Simplified)** : 汉化插件，看个人爱好吧。
2.  **Vetur** : 语法高亮，在空文件里输入"vue"+回车，直接自动生成template模板，alt+shift+F快捷键格式化全文，不过默认的格式化是两个空格，有些人比如我就很不习惯（我习惯tab四个空格），这里贴一个改格式化缩进的方法。[VSCode的Vue插件Vetur设置](https://www.jianshu.com/p/80ae9b1b8fae)，按照文章中的做法在setting.json中为vetur加入以下两行设置代码就行了。

```javascript
"vetur.format.options.tabSize": 4,
"vetur.format.options.useTabs": true,

3. **Auto Close Tag** :自动闭合HTML/XML标签。不用再输入闭合标签了，舒爽的coding吧！
4. **Auto Rename Tag** ：自动完成另一侧标签的同步修改。
5. **HTML CSS Support** : 写样式表自动补全
6. **Debugger for Chrome** : 顾名思义，在Chrome中调试bug，这样就可以直观的在VSCode中设置断点了。不过使用之前得配置一下`launch.json`文件，配置的方法Vue的学习文档给出了，[在 VS Code 中调试](https://cn.vuejs.org/v2/cookbook/debugging-in-vscode.html)
7. **JavaScript(ES6) code snippets** :  ES6语法智能提示以及快速输入，除js外还支持.ts,.jsx,.tsx,.html,.vue,省去了配置其支持各种包含js代码文件的时间。
8. **Beautity** : 可美化JS、JSON、CSS、Sass、HTML，这个默认缩进就是4空格，倒是很舒服,有Vetur的情况下算是锦上添花吧。
9. **Path Intellisense** : 自动路径补全，用之前得先把VSCode的默认自动完成关了，在设置的`setting.json`文件中添加以下配置选项：
```

{“ typescript.suggest.paths”：false}

```javascript
10. **ESlint** : 语法纠错。***安装之后四个空格缩进会报错，因为不符合语法规范，所以我自己又设置的ESlint无视四个空格***。哎，ESlint，又爱又恨。带来规范，也带来不爽。**代码写的不规范的话，会稀里哗啦的报错，干脆别装了**。

### 最后附上我自己的配置文件，嫌配置麻烦的同学可以复制使用，这里我删掉了ESlint的设置

**打开配置文件的方式**：左上角“文件”->“首选项”->“设置”之后点击右上角的文件图标 

```

{   "editor.tabSize": 4,//tab = 四个空格

    "files.autoSave": "afterDelay",//延时自动保存

    "window.zoomLevel": 1,//窗口图标变大点，我老盲僧了

    "editor.fontSize": 18,//字号18

    "auto-close-tag.activationOnLanguage": [//绑定自动闭合标签的语言

        "xml",

        "php",

        "blade",

        "ejs",

        "jinja",

        "javascript",

        "javascriptreact",

        "typescript",

        "typescriptreact",

        "plaintext",

        "markdown",

        "vue",

        "liquid",

        "erb",

        "lang-cfml",

        "cfml",

        "HTML (EEx)",

        "HTML (Eex)",

        "plist"

    ],

        "vetur.format.options.tabSize": 4,//将vetur的tab设置为4个空格

        "vetur.format.options.useTabs": false,

        "vetur.format.defaultFormatterOptions": {

            "prettier": {

                "semi": false,    //不加分号

                "singleQuote": true  //用单引号

            }

        },

        "[javascript]": {

            "editor.defaultFormatter": "HookyQR.beautify"

        },

        "[jsonc]": {

            "editor.defaultFormatter": "HookyQR.beautify"

        },

        "editor.renameOnType": true,

}

```
