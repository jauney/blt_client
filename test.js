const path = require('path');
const pdfPath = path.join('/Users/johnny/Downloads/', `${new Date().getTime()}.pdf`);
console.log(pdfPath);

const str = `update_date,arrive_date,create_user_name,abnormal_reason,abnormal_remark,abnormal_resolve_type,remark,transfer_company_mobile,transfer_company_name,transfer_address,transfer_order_code,pay_user_name,settle_user_name,receiver_name,sender_name,operator_name,shipsite_name,site_name,settle_date,depart_date,company_name,order_code,car_code,getcustomer_name,getcustomer_mobile,sendcustomer_name,sendcustomer_mobile,bank_account,getcustomer_address,sendcustomer_address,trans_confirmdate,trans_operatorname,order_name`;
const arr = str.split(',');
let strNew = '';
for (var i in arr) {
  strNew += `'${arr[i]}',`;
}

console.log(strNew);
