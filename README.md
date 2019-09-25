
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

