### 常见错误
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
