
## 打包

1. 指定平台架构

参考： 
https://zhuanlan.zhihu.com/p/45250432
https://juejin.im/post/5bc53aade51d453df0447927

```
# windows 64bit
electron-builder --win --x64
# windows and mac 32bit
electron-builder --win --mac --ia32
```


## 常见错误
1、Warning: You cannot set a form field before rendering a field associated with the value.
```
form.setFieldsValue({
  driver_plate: currentDriver.driver_plate,
  driver_name: currentDriver.driver_name,
  driver_mobile: currentDriver.driver_mobile,
});
```
setFieldsValue的时候，driver_plate在form中没有。即设置了getFieldDecorator中没有的字段时，就会报该错误



2、打包到windows7无法启动
需要设置参数：
```
"package-build-win": "yarn run build && electron-builder --win",
```


## github

https://github.com/settings/security

jauney

Cp4*****5

## 服务器部署

#### 服务器按照nginx，nginx配置
```
  server {
      listen       8001;
      # 按实际部署路径修改
      root   /home/source/blt_client/dist;
      index  index.html;
      location / {
          try_files $uri $uri/ /index.html;
          # index index.html;
          # alias /opt/tiger/caijing/fe/wallet_portal/html;
      }

      # 按实际部署路径修改

      #index  index.html;
      #root   /opt/tiger/caijing/fe/cashdesk_spa/html;
      #location /activity {
      #    alias   /opt/tiger/static/cashdesk_spa/html/;
      #}
  }
```
#### git clone 代码到服务器目录，修改 src/services/api.js 中的 127.0.0.1:3008 为 [服务器IP]:3008

#### 编译
```
npm run build
```


## 打印机设置

### 标签打印机
纸张大小设置为：80mm*50mm



