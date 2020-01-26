
import moment from 'moment';

export function print({ selectedRows = [], type = '' }) {
  let bodyHTML = ''
  selectedRows.forEach(item => {
    let transType = '提付'
    if (item.trans_type == 1) {
      transType = '回付'
    }
    else if (item.trans_type == 2) {
      transType = '现付'
    }
    bodyHTML += `<tr>
        <td>${item.order_code || ''}</td>
        <td>${item.sendcustomer_name || ''}</td>
        <td>${item.getcustomer_name || ''}</td>
        <td>${item.order_real || ''}</td>
        <td>${item.trans_discount || ''}</td>
        <td>${transType || ''}</td>
        <td>${item.order_advancepay_amount || ''}</td>
        <td>${item.insurance_fee || ''}</td>
        <td>${item.order_name || ''}</td>
        <td>${ item.depart_date ? moment(Number(item.depart_date || 0)).format('YYYY-MM-DD HH:mm:ss') : ''}</td>
        <td>${item.site_name || ''}</td>
        </tr>`
  })
  let styles = `
    <style>
    .content, .header {text-align: center; padding: 10px 0 20px;}
    table {width: 100%; border-collapse: collapse; border-spacing: 0;}
    table th { font-weight: bold; }
    table th, table td {border: 1px solid #ccc; font-size: 10px; padding: 4px; text-align: left; line-height: 150%;}
    </style>`
  let html = `
    <div class="header">陕西远诚宝路通物流</div>
    <div class="content">
    <table>
      <tr>
        <th style="width:50px;">货单号</th>
        <th style="width:50px;">发货客户</th>
        <th style="width:50px;">收货客户</th>
        <th style="width:50px;">实收货款</th>
        <th style="width:50px;">折后运费</th>
        <th style="width:50px;">运费方式</th>
        <th style="width:50px;">垫付</th>
        <th style="width:50px;">保价费</th>
        <th style="width:120px;">货物名称</th>
        <th style="width:110px;">发车时间</th>
        <th style="width:50px;">站点</th>
      </tr>
      ${bodyHTML}
    </table>
    </div>
    `
  //告诉渲染进程，开始渲染打印内容
  const printOrderWebview = document.querySelector('#printWebview')
  printOrderWebview.send('webview-print-render', { printHtml: `${styles}${html}`, type })
}
