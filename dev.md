### env

1 install electron

```
// install dependencies
yarn install --registry=https://registry.npm.taobao.org
// install devDependencies
yarn install --dev

// package
yarn add electron-builder
```


2 electron demo
https://github.com/electron/electron-api-demos



### reference

#### package 
1、yarn build

将打包的文件（dist文件中的所有文件）都放到http://bltwlgs.com/cdn/static/ 目录下。

config.js配置如下：
publicPath: 'http://bltwlgs.com/cdn/static/',

参考：
https://zhuanlan.zhihu.com/p/41103887
https://zhuanlan.zhihu.com/p/41102709


### antd 配置

1、publicpath
https://github.com/ant-design/ant-design-pro/issues/2580



### 创建新页面
1、pages/ 目录下创建页面.js, .less
2、config/router.config.js 配置路由
3、locales/menu.js 配置菜单文案
4、locales/order.js  配置新页面所需文案或页面中写死
5、/models/order.js 创建state， 或当前文件夹创建/models/rule.js 等state



### 开发中问题

##### require is not defined
新页面没有export default Order， 或者 import 不对
