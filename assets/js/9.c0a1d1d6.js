(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{45:function(t,a,s){"use strict";s.r(a);var n=s(0),e=Object(n.a)({},function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"介绍"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#介绍","aria-hidden":"true"}},[t._v("#")]),t._v(" 介绍")]),t._v(" "),s("h2",{attrs:{id:"这是什么？"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#这是什么？","aria-hidden":"true"}},[t._v("#")]),t._v(" 这是什么？")]),t._v(" "),s("p",[s("code",[t._v("tua-storage")]),t._v(" 是一款二次封装各个平台存储层接口，抹平各平台接口操作差异的库。采用 ES6+ 语法，将异步 api 使用 Promise 包裹，并采用 jest 进行了完整的单元测试。")]),t._v(" "),s("p",[t._v("已适配以下场景：")]),t._v(" "),s("ul",[s("li",[t._v("web 场景：使用 "),s("code",[t._v("localStorage")]),t._v(" 作为存储对象")]),t._v(" "),s("li",[t._v("小程序场景：使用微信提供的原生存储对象")]),t._v(" "),s("li",[t._v("Node.js 场景：直接使用内存作为存储对象（其实就是使用 "),s("code",[t._v("object")]),t._v("）")]),t._v(" "),s("li",[t._v("React-Native 场景：使用 "),s("code",[t._v("AsyncStorage")]),t._v(" 作为存储对象")])]),t._v(" "),s("h2",{attrs:{id:"能干什么？"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#能干什么？","aria-hidden":"true"}},[t._v("#")]),t._v(" 能干什么？")]),t._v(" "),s("p",[t._v("日常开发中，在不同的平台下由于有不同的存储层接口，所以往往导致同一份代码要写几份儿。")]),t._v(" "),s("p",[t._v("例如，小程序中保存数据要使用异步的 "),s("code",[t._v("wx.setStorage")]),t._v("、"),s("code",[t._v("wx.getStorage")]),t._v(" 或对应的同步方法；而在 web 端使用 localStorage 的话，则是同步的 "),s("code",[t._v("setItem")]),t._v("、"),s("code",[t._v("getItem")]),t._v(" 等方法；在 React-Native 的场景下，使用的又是 "),s("code",[t._v("AsyncStorage")]),t._v(" 中异步的 "),s("code",[t._v("setItem")]),t._v("、"),s("code",[t._v("getItem")]),t._v("...")]),t._v(" "),s("p",[t._v("然而，经过 "),s("code",[t._v("tua-storage")]),t._v(" 的二次封装，以上两个方法统一变成了：")]),t._v(" "),s("ul",[s("li",[s("code",[t._v("save")])]),t._v(" "),s("li",[s("code",[t._v("load")])])]),t._v(" "),s("p",[t._v("由于异步方法没法变成同步方法，所以以上方法在所有场景下都异步返回 "),s("code",[t._v("Promise")]),t._v("。")]),t._v(" "),s("h2",{attrs:{id:"如何使用？"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#如何使用？","aria-hidden":"true"}},[t._v("#")]),t._v(" 如何使用？")]),t._v(" "),s("p",[t._v("首先参阅上一章 "),s("router-link",{attrs:{to:"/guide/installation.html"}},[t._v("安装")]),t._v(" 将 "),s("code",[t._v("tua-storage")]),t._v(" 安装到你的项目中，并正确地导入和初始化。")],1),t._v(" "),s("h3",{attrs:{id:"常规操作"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#常规操作","aria-hidden":"true"}},[t._v("#")]),t._v(" 常规操作")]),t._v(" "),s("p",[t._v("对于存储层来说，最基本的操作自然是保存（save）、读取（load）、删除（remove，删除单个）和清除（clear，清空全部）了。")]),t._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" TuaStorage "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'tua-storage'")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" tuaStorage "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("TuaStorage")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("...")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 返回一个 Promise")]),t._v("\ntuaStorage"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("save")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'foo'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" foo"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'bar'")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("then")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("console"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("log"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("console"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("error"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 使用 async/await")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("async")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" data "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("await")]),t._v(" tuaStorage"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("load")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'foo'")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        console"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("e")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        console"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("error")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\ntuaStorage"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("remove")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'foo'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\ntuaStorage"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("clear")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])])])},[],!1,null,null,null);a.default=e.exports}}]);