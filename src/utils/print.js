
import moment from 'moment';
import { getSelectedAccount } from '@/utils/account';
/**
 *
 * @param { type } type:'pdf' 下载
 */
export function printDownLoad({ selectedRows = [], type = '', lastCar = {} }) {
  console.log('d***********', type)
  let bodyHTML = ''
  let totalTransFund = 0
  selectedRows.forEach(item => {
    let transType = '提付'
    if (item.trans_type == 1) {
      transType = '回付'
    }
    else if (item.trans_type == 2) {
      transType = '现付'
    }
    totalTransFund += Number(item.trans_discount || 0)
    bodyHTML += `<tr>
        <td>${item.order_code || ''}</td>
        <td>${item.getcustomer_name || ''}</td>
        <td>${item.getcustomer_mobile || ''}</td>
        <td>${item.order_real || order.order_amount || ''}</td>
        <td>${item.trans_discount || ''}</td>
        <td>${transType || ''}</td>
        <td>${item.order_advancepay_amount || ''}</td>
        <td>${item.insurance_fee || ''}</td>
        <td>${item.order_name || ''}</td>
        <td>${item.remark || ''}</td>
        </tr>`
  })
  let styles = `
    <style>
    .content, .header {text-align: center; padding: 10px 0 20px;}
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 10px; padding: 4px; text-align: left; line-height: 150%;}
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
  let html = `
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    ${carHtml}
    <table>
      <tr>
        <th style="width:50px;">货单号</th>
        <th style="width:40px;">收货客户</th>
        <th style="width:40px;">收货电话</th>
        <th style="width:50px;">实收货款</th>
        <th style="width:40px;">折后运费</th>
        <th style="width:40px;">运费方式</th>
        <th style="width:30px;">垫付</th>
        <th style="width:40px;">保价费</th>
        <th style="width:150px;">货物名称</th>
        <th style="width:100px;">备注</th>
      </tr>
      ${bodyHTML}
      <tr><td colspan="10">合计运费</td><td>${totalTransFund}</td></tr>
      <tr><td colspan="10">日期</td><td>${new Date().toLocaleDateString()}</td></tr>
    </table>
    </div>
    `
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printWebview')
  console.log('type: ', type)
  printOrderWebview.send('webview-print-render', { printHtml: `${styles}${html}`, type })
}

/**
 *
 * 打印托运单
 * @param {footer} 是否打印回执单
 */
export function printOrder({ getCustomer = {}, sendCustomer = {}, data = {}, branchCompanyList = [], siteList = [], footer = false }) {
  let getCustomerType = ''
  if (getCustomer.getcustomer_type == 1) { getCustomerType = 'V' } else if (getCustomer.getcustomer_type == 9) { getCustomerType = 'H' }
  let sendCustomerType = ''
  if (sendCustomer.sendcustomer_type == 1) { sendCustomerType = 'V' } else if (sendCustomer.sendcustomer_type == 9) { sendCustomerType = 'H' }
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
  let accountStatistic = getSelectedAccount([data]);
  let styles = `
    <style>
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
  let html = `
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    <table>
      <tr>
        <td class="col3 txt-bold">到货站:${data.company_name || ''}</td>
        <td class="col3 txt-bold">发货站:${data.site_name || ''}</td>
        <td class="col3 txt-bold">单号:${data.order_code || ''}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col3-1">${getCustomerType}</td>
        <td class="col3-2">收货人:${data.getcustomer_name || ''}</td>
        <td class="col3-2">电话:${data.getcustomer_mobile || ''}</td>
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
        <td class="col2-1">合计:${accountStatistic.totalAccount}</td>
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
        <td>收货地址:${data.getcustomer_address || getCustomer.getcustomer_address || ''}</td>
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
        <td class="desc">申明：1.托运方必须如实提供货物类型、名称、数量，要求包装完好、捆扎牢固；交货只负责包装无损，不负责包装内质量与数量问题。2.公司严禁托运危险品及国家禁运品，若经欺瞒货品造成损失则由托运方承担。3.所有货品均实行自愿投保，若出现货损，3%以内的货损为正常损耗，不予赔付；若未保价出现货损或丢失，承运方则按运费的1-5倍赔付；若保价后出现货损或丢失，承运方则按货物平均保价金额进行赔付，且不超过货物价值的80%。4.文物、珠宝、陶瓷、玻璃、水果、海鲜、鲜肉制品等易碎、易腐烂变质的货品不在保险范围内（投保无效），本公司只负责丢失责任，不负责损坏、变质等赔偿。5.收货方接到提货通知后须及时取货，提货后出现的任何货物问题公司概不受理；到货通知后一周任不提货则原货返货，运费翻倍。6.承运期间若因人为无法控制的自然灾害而造成的损失，承运方不承担任何责任。7.托运单经开出，且托运方继续托运货物，则默认托运方同意公司托运协议，本协议及时生效；货物确认收货，运费及货款结算清后，本协议终止，且该托运单作废。</td>
      </tr>
    </table>
    <table>
      <tr>
        <td class="col2-1">
          <img src="https://sf3-ttcdn-tos.pstatp.com/obj/dump-v2-public/2019/12/31/ca7ea0aee0567014386fda40e67de226.jpeg" width="100px" height="100px">
        </td>
        <td class="col2-2">
          <div>总公司地址：西安市港务区港务南路百利威国际电商产业园</div>
          <div>公司网址：www.bltwlgs.com</div>
          <div>业务电话：02986253988，13309221294</div>
          <div>财务电话：02986237928</div>
          <div>客服电话：13324583349</div>
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
    </table>
    <table>
      <tr>
        <td class="col3-1">${getCustomerType}</td>
        <td class="col3-2">收货人:${data.getcustomer_name || ''}</td>
        <td class="col3-2">电话:${data.getcustomer_mobile || ''}</td>
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
        <td class="col2-1">合计:${accountStatistic.totalAccount}</td>
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
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printOrderWebview')
  printOrderWebview.send('webview-print-render', `${styles}${printHtml}`)
}


export function printPayOrder({ selectedRows = [] }) {
  let bodyHTML = ''
  let totalTransFund = 0
  selectedRows.forEach(item => {
    let orderNum = ''
    if (item.order_code) {
      orderNum = item.order_code.split(',').length
    }

    totalTransFund += Number(item.trans_discount || 0)
    bodyHTML += `<tr>
        <td>${item.sendcustomer_name || ''}</td>
        <td>${orderNum || ''}</td>
        <td>${item.order_amount || ''}</td>
        <td>${item.pay_amount || ''}</td>
        <td>${item.agency_fee || ''}</td>
        <td>${item.bank_account || ''}</td>
        <td>${item.pay_date && moment(Number(item.pay_date || 0)).format('YYYY-MM-DD HH:mm:ss') || ''}</td>
        <td>${item.order_code || ''}</td>
        </tr>`
  })
  let styles = `
    <style>
    .content, .header {text-align: center; padding: 10px 0 20px;}
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 10px; padding: 4px; text-align: left; line-height: 150%;}
    .carinfo th {border: 0;}
    </style>`
  let html = `
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    <table>
      <tr>
        <th style="width:50px;">发货客户</th>
        <th style="width:50px;">合计票数</th>
        <th style="width:50px;">合计货款</th>
        <th style="width:50px;">合计付款</th>
        <th style="width:50px;">代办费</th>
        <th style="width:50px;">银行账号</th>
        <th style="width:50px;">付款时间</th>
        <th style="width:50px;">票号</th>
      </tr>
      ${bodyHTML}
    </table>
    </div>
    `
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printWebview')
  printOrderWebview.send('webview-print-render', { printHtml: `${styles}${html}`, type: 'pdf' })
}

