
import moment from 'moment';
import XLSX from 'xlsx';
const electron = window.require('electron').remote;
import { getSelectedAccount } from '@/utils/account';

export function printSiteOrder ({ selectedRows = [], type = '', lastCar = {} }) {
  let bodyHTML = ''
  let totalTransFund = 0
  let totalOrderNum = 0
  let totalGoodsFund = 0
  let orderIndex = 1
  selectedRows = selectedRows.sort(function compareFunction (item1, item2) {
    return item1.company_name.localeCompare(item2.company_name);
  });
  console.log(selectedRows)
  selectedRows.forEach(item => {
    let transType = '提付'
    if (item.trans_type == 1) {
      transType = '现付'
    }
    else if (item.trans_type == 2) {
      transType = '回付'
    }
    totalTransFund += Number(item.trans_discount || 0)
    totalGoodsFund += Number(item.order_amount || 0)
    totalOrderNum += Number(item.order_num || 0)
    bodyHTML += `<tr>
        <td>${item.company_name || ''}</td>
        <td>${item.order_code || ''}</td>
        <td>${item.getcustomer_name || ''}</td>
        <td>${item.trans_discount || ''}</td>
        <td>${item.order_name || ''}</td>
        </tr>`
    orderIndex++
  })
  let styles = `
    <style>
    .order-box {text-align: center;}
    .content .header {text-align: center; width: 100%;}
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 12px; padding: 4px; text-align: left; line-height: 150%;}
    .carinfo th {border: 0;}
    </style>`
  let carHtml = ``
  if (lastCar.car_code) {
    carHtml = `<table class="carinfo">
    <tr>
    <th style="width:50px;">车牌号：${lastCar.driver_plate}</th>
    <th style="width:50px;">电话：${lastCar.driver_mobile}</th>
    <th style="width:50px;">姓名：${lastCar.driver_name}</th>
    <th style="width:50px;">货车运费：${lastCar.car_fee}</th>
    <th style="width:50px;">货车编号：${lastCar.car_code}</th>
    </tr>
  </table>`
  }
  let printHtml = `<div class="order-box">
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    ${carHtml}
    <table>
      <tr>
        <th style="width:15%;">分公司</th>
        <th style="width:15%;">货单号</th>
        <th style="width:20%;">收货客户</th>
        <th style="width:15%;">运费</th>
        <th style="width:35%;">货物名称</th>
      </tr>
      ${bodyHTML}
    </table>
    <table>
      <tr><td>合计票数</td><td>${orderIndex - 1}</td></tr>
      <tr><td>合计件数</td><td>${totalOrderNum}</td></tr>
      <tr><td>合计运费</td><td>${totalTransFund}</td></tr>
      <tr><td>${new Date().toLocaleDateString()}</td><td>接货人签字：</td></tr>
    </table>
    </div></div>
    `
  //告诉渲染进程，开始渲染打印内容
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printOrderWebview')
  printOrderWebview.send('webview-print-render', { html: `${styles}${printHtml}` })
}
/**
 *
 * @param { type } type:'pdf' 下载
 */
export function printDownLoad ({ selectedRows = [], type = '', lastCar = {}, silent = true }) {
  let bodyHTML = ''
  let totalTransFund = 0
  let totalGoodsFund = 0
  let orderIndex = 1
  selectedRows.forEach(item => {
    let transType = '提付'
    if (item.trans_type == 1) {
      transType = '现付'
    }
    else if (item.trans_type == 2) {
      transType = '回付'
    }
    totalTransFund += Number(item.trans_discount || 0)
    totalGoodsFund += Number(item.order_amount || 0)
    bodyHTML += `<tr>
        <td>${orderIndex}</td>
        <td>${item.order_code || ''}</td>
        <td>${item.getcustomer_name || ''}</td>
        <td>${item.getcustomer_mobile || ''}</td>
        <td>${item.order_amount || ''}</td>
        <td>${item.trans_discount || ''}</td>
        <td>${transType || ''}</td>
        <td>${item.order_advancepay_amount || ''}</td>
        <td>${item.deliver_amount || ''}</td>
        <td>${item.insurance_fee || ''}</td>
        <td>${item.order_name || ''}</td>
        <td>${item.remark || ''}</td>
        </tr>`
    orderIndex++
  })
  let styles = `
    <style>
    .order-box {text-align: center;}
    .content .header {text-align: center; width: 100%;}
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 12px; padding: 4px; text-align: left; line-height: 150%;}
    .carinfo th {border: 0;}
    </style>`
  let carHtml = ``
  if (lastCar.car_code) {
    carHtml = `<table class="carinfo">
    <tr>
    <th style="width:50px;">车牌号：${lastCar.driver_plate}</th>
    <th style="width:50px;">电话：${lastCar.driver_mobile}</th>
    <th style="width:50px;">姓名：${lastCar.driver_name}</th>
    <th style="width:50px;">货车运费：${lastCar.car_fee}</th>
    <th style="width:50px;">货车编号：${lastCar.car_code}</th>
    </tr>
  </table>`
  }
  let html = `<div class="order-box">
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    ${carHtml}
    <table>
      <tr>
        <th style="width:30px;">序号</th>
        <th style="width:50px;">货单号</th>
        <th style="width:40px;">收货客户</th>
        <th style="width:40px;">收货电话</th>
        <th style="width:50px;">应收货款</th>
        <th style="width:40px;">折后运费</th>
        <th style="width:30px;">运费方式</th>
        <th style="width:30px;">垫付</th>
        <th style="width:30px;">送货费</th>
        <th style="width:30px;">保价费</th>
        <th style="width:150px;">货物名称</th>
        <th style="width:90px;">备注</th>
      </tr>
      ${bodyHTML}
      <tr><td colspan="11">合计运费</td><td>${totalTransFund}</td></tr>
      <tr><td colspan="11">合计货款</td><td>${totalGoodsFund}</td></tr>
      <tr><td colspan="11">日期</td><td>${new Date().toLocaleDateString()}</td></tr>
    </table>
    </div></div>
    `
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printWebview')
  console.log('type: ', type)
  printOrderWebview.send('webview-print-render', { printHtml: `${styles}${html}`, type, silent })
}

/**
 * 获取打印托运单HTML
 * @param {*} param0
 */
export function getPrintOrderConent ({ getCustomer = {}, sendCustomer = {}, data = {}, branchCompanyList = [], siteList = [], footer = false }) {
  let getCustomerType = ''
  if (getCustomer.customer_type == 1) { getCustomerType = 'V' } else if (getCustomer.customer_type == 9) { getCustomerType = 'H' }
  let sendCustomerType = ''
  if (sendCustomer.customer_type == 1) { sendCustomerType = 'V' } else if (sendCustomer.customer_type == 9) { sendCustomerType = 'H' }
  let transType = '提付'
  if (data.trans_type == 1) { transType = '现付' } else if (data.trans_type == 2) { transType = '回付' }
  let transferType = ''
  if (data.transfer_type == 1) { transferType = '转出' } else if (data.transfer_type == 2) { transferType = '转入' }
  let printSite = {}
  let printCompany = {}
  branchCompanyList.forEach(item => {
    if (item.company_name == data.company_name) {
      printCompany = item
    }
  })
  siteList.forEach(item => {
    if (item.site_name == data.site_name) {
      printSite = item
    }
  })
  let accountStatistic = getSelectedAccount([data], 'init');

  let orderDate = moment(data.create_date).format('YYYY-MM-DD')
  let html = `
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    <table>
      <tr>
        <td class="col3 txt-bold">到货站:${data.company_name || ''}</td>
        <td class="col3 txt-bold">发货站:${data.site_name || ''}</td>
        <td class="col3 txt-bold">单号:${data.order_code || ''}</td>
      </tr>
      <tr>
        <td class="txt-bold" colspan="3">日期:${orderDate}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col3-1">${getCustomerType}</td>
        <td class="col3-2 txt-bold">收货人:${data.getcustomer_name || ''}</td>
        <td class="col3-2 txt-bold">电话:${data.getcustomer_mobile || ''}</td>
      </tr>
      <tr>
        <td class="col3-1">${sendCustomerType}</td>
        <td class="col3-2">发货人:${data.sendcustomer_name || ''}</td>
        <td class="col3-2">电话:${data.sendcustomer_mobile || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th class="split"></th>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col4">货款:${data.order_amount || ''}</td>
        <td class="col4">运费:${transType}</td>
        <td class="col4">运价:${data.trans_amount || ''}</td>
        <td class="col4">折后:${data.trans_discount || ''}</td>
      </tr>
      <tr>
        <td class="col4">保额:${data.insurance_amount || ''}</td>
        <td class="col4">保费[${transType}]:${data.insurance_fee || ''}</td>
        <td class="col4">垫付:${data.order_advancepay_amount || ''}</td>
        <td class="col4">送货费:${data.deliver_amount || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-1 txt-bold">提付合计:${accountStatistic.totalAccount}</td>
        <td class="col2-2">账号:${data.bank_account || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th class="split"></th>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-2">货物名称:${data.order_name || ''}</td>
        <td class="col2-1">标签:${data.order_num || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td>收货地址:${data.getcustomer_address || getCustomer.customer_address || ''}</td>
      </tr>
      <tr>
        <td>备注:${data.remark || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th class="split"></th>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col3">转进:${transferType || ''}</td>
        <td class="col3">中转费:${data.transfer_amount || ''}</td>
        <td class="col3">地址:${data.transfer_address || ''}</td>
      </tr>
      <tr>
        <td class="col3">物流:${data.transfer_company_name || ''}</td>
        <td class="col3">单号:${data.transfer_order_code || ''}</td>
        <td class="col3">电话:${data.transfer_company_mobile || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th class="split"></th>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-1">到货站:${printCompany.company_name || ''}</td>
        <td class="col2-2">电话:${printCompany.company_mobile || ''}</td>
      </tr>
      <tr>
        <td class="col2-1">发货站:${data.site_name || ''}</td>
        <td class="col2-2">电话:${printSite.site_mobile || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-1">
          <img src="data:image/jpeg;base64,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" width="100px" height="100px">
        </td>
        <td class="col2-2">
          <div>扫码查看托运协议、公司信息、货款查询</div>
          <div>总公司地址：西安市港务区港务南路百利威国际电商产业园</div>
          <div>公司网址：www.bltwlgs.com</div>
          <div>业务电话：02986253988，13309221294</div>
          <div>财务电话：02986237928</div>
          <div>客服电话：02986457606</div>
          <div>投诉电话：15389278107</div>
        </td>
      </tr>
    </table>
    </div>
    `

  const footerHtml = `<div class="header" style="margin-top: 20px;">陕西远诚宝路通物流(回执单)</div>
  <table>
      <tr>
        <td class="col3 txt-bold">到货站:${data.company_name || ''}</td>
        <td class="col3 txt-bold">发货站:${data.site_name || ''}</td>
        <td class="col3 txt-bold">单号:${data.order_code || ''}</td>
      </tr>
      <tr>
        <td class="txt-bold" colspan="3">日期:${orderDate}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col3-1">${getCustomerType}</td>
        <td class="col3-2 txt-bold">收货人:${data.getcustomer_name || ''}</td>
        <td class="col3-2 txt-bold">电话:${data.getcustomer_mobile || ''}</td>
      </tr>
      <tr>
        <td class="col3-1">${sendCustomerType}</td>
        <td class="col3-2">发货人:${data.sendcustomer_name || ''}</td>
        <td class="col3-2">电话:${data.sendcustomer_mobile || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th class="split"></th>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col4">货款:${data.order_amount || ''}</td>
        <td class="col4">运费:${transType}</td>
        <td class="col4">运价:${data.trans_amount || ''}</td>
        <td class="col4">折后:${data.trans_discount || ''}</td>
      </tr>
      <tr>
        <td class="col4">保额:${data.insurance_amount || ''}</td>
        <td class="col4">保费[${transType}]:${data.insurance_fee || ''}</td>
        <td class="col4">垫付:${data.order_advancepay_amount || ''}</td>
        <td class="col4">送货费:${data.deliver_amount || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-1 txt-bold">提付合计:${accountStatistic.totalAccount}</td>
        <td class="col2-2">账号:${data.bank_account || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-2">货物名称:${data.order_name || ''}</td>
        <td class="col2-1"> </td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col3-1">收货人签字:</td>
        <td class="col3-2">付款方式：微信/支付宝/现金/银行转账 </td>
        <td class="col3-3">送货人签字:</td>
      </tr>
    </table>
  `
  let printHtml = html
  if (footer) {
    printHtml = `${html}${footerHtml}`
  }

  printHtml = `<div class="order-box">${printHtml}</div>`
  return printHtml
}
/**
 *
 * 打印托运单
 * @param {footer} 是否打印回执单
 */
export function printOrder (printHtml = '') {
  let styles = `
  <style>
  .order-box{height: 292mm;}
  .content, .header {text-align: center;}
  table {width: 100%; border-collapse: collapse; border-spacing: 0;}
  table td {border: 1px solid #ccc; font-size: 10px; padding: 4px; text-align: left; line-height: 150%;}
  .col3 {width: 33%;}
  .col3-1 {width: 10%;}
  .col3-2 {width: 45%;}
  .txt-bold {font-weight: bold; font-size: 12px;}
  .split {width: 100%; height: 5px;}
  .col4 {width: 25%;}
  .col2-1 {width: 35%;}
  .col2-2 {width: 65%;}
  .desc {font-size: 8px;}
  </style>`
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printOrderWebview')
  printOrderWebview.send('webview-print-render', { html: `${styles}${printHtml}` })
}


export function printPayOrder ({ selectedRows = [], type = '' }) {
  let bodyHTML = ''
  let totalTransFund = 0
  let orderIndex = 1
  selectedRows = selectedRows.sort(function compareFunction (item1, item2) {
    return item1.sendcustomer_name.localeCompare(item2.sendcustomer_name);
  });
  let totalPay = 0
  selectedRows.forEach(item => {
    let orderNum = ''
    let orderCodes = ''
    if (item.order_code) {
      orderNum = item.order_code.split(',').length
    }
    orderCodes = item.order_code.replace(/,/ig, ', ')

    totalTransFund += Number(item.trans_discount || 0)
    totalPay += Number(item.pay_amount || 0)
    bodyHTML += `<tr>
        <td>${orderIndex}</td>
        <td>${item.bank_account || ''}</td>
        <td>${item.sendcustomer_name || ''}</td>
        <td>${item.pay_amount || ''}</td>
        <td>${orderCodes || ''}</td>
        </tr>`
    orderIndex++
  })
  let styles = `
    <style>
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 14px; padding: 4px; text-align: left; line-height: 150%;}
    .header {text-align: center;}
    </style>`
  let html = `
    <table>
      <thead>
        <tr>
          <td colspan="5" class="header">陕西远诚宝路通物流</td>
        </tr>
        <tr>
          <th style="width:30px;">序号</th>
          <th style="width:90px;">账号</th>
          <th style="width:60px;">发货客户</th>
          <th style="width:60px;">付款金额</th>
          <th style="width:280px;">票号</th>
        </tr>
      </thead>
      <tbody>
      ${bodyHTML}
        <tr>
          <td>总计</td>
          <td colspan="4">${totalPay}</td>
        </tr>
      </tbody>
    </table>
    `
  if (type != 'print') {
    var iframeDocument = document.getElementById('printExcelFrame').contentWindow.document;
    var printDOM = iframeDocument.getElementById("bd");
    printDOM.innerHTML = `${styles}${html}`
    let curDate = new Date()
    let defaultFileName = `${curDate.getFullYear()}${curDate.getMonth() + 1}${curDate.getDate()}${curDate.getTime()}.xlsx`
    // const fileNameDialog = electron.dialog.showSaveDialogSync(electron.getCurrentWindow(), { defaultPath: defaultFileName });
    const fileNameDialog = electron.dialog.showSaveDialogSync({ defaultPath: defaultFileName });
    var wb = XLSX.utils.table_to_book(printDOM, { raw: true });
    XLSX.writeFile(wb, fileNameDialog);
  }
  else {
    const printOrderWebview = document.querySelector('#printWebview')
    console.log('type: ', type)
    printOrderWebview.send('webview-print-render', { printHtml: `${styles}${html}` })
  }
}

/**
 * 打印标签
 * @param {*} data
 */
export function printLabel (data, indexNo, deviceName = 'TSC TTP-244CE', company, getCustomer = {}) {
  // 打印机纸张80mm*50mm，但高度不能设置为50mm，否则会多打一个白页
  let styles = `
    <style>
    .label-box { height: 45mm; padding: 0px; margin: 0px; }
    .content {width: 100%; padding-left: 0px;}
    .content, .header {text-align: center; font-size: 14px; position: relative;}
    .label {padding: 0 8px; text-align: left;  font-size: 16px }
    .header, .footer {text-align: center;}
    .header {font-size: 14px; font-weight: 700;}
    .label-time {font-size: 14px;}
    .label-left {font-size: 14px;}
    .label-right {font-size: 48px; font-weight: 700;}
    .label-sender {position: absolute; right: 10px; top: 10px; font-size: 46px}
    .label-name {padding-top: 5px; font-size: 20px; font-weight: 700;}
    .label-goods {font-size: 14px}
    </style>`

  let senderHtml = ''
  let senderName = ''
  if (getCustomer.sender_name && getCustomer.sender_name.length == 1) {
    senderName = getCustomer.sender_name
  }
  if (company.remember_sender) {
    senderHtml = `<div class="label-sender">${senderName}</div>`
  }
  let printHtml = ''
  let labelHtml = `
      <div class="label-box">
      <div class="header">远诚宝路通物流  <span class="label-time">${moment(new Date).format('YYYY-MM-DD')}</span></div>
      <div class="content">
      <div class="label">
      <span class="label-left">${data.site_name}</span> &rarr; <span class="label-right">${data.company_name}</span>
      </div>
      <div class="label label-name">
      <span class="username">${data.getcustomer_name}</span> <span class="">${data.order_code} - ${data.order_num}</span>
      </div>
      ${senderHtml}
      <div class="label label-goods">货物名称：${data.order_name || ''}</div>
      </div>
      </div>
      `
  for (var i = 0; i < Number(indexNo || 1); i++) {
    printHtml += labelHtml
  }

  //告诉渲染进程，开始渲染打印内容
  const printLableWebview = document.querySelector(`#printLabelWebview1`)
  printLableWebview.send('webview-print-render', { html: `${styles}${printHtml}`, deviceName })
}

