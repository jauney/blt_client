// 获取当前列表中勾选的信息 包含记录总数，货款、运费总额等
// type:cancelsettle 获取取消结算的统计数据
export function getSelectedAccount(sltDatas, type) {
  let accountData = {};

  accountData.recordNum = sltDatas.length;
  let totalAccount = 0;

  var totalShouldGoodsFunds = 0;
  var totalShouldTransFunds = 0;
  var totalActualGoodsFunds = 0;
  var totalActualTransFunds = 0;
  // 货款为0，运费结算方式为 回付、现付的记录，不能取消结算，因为这些记录是自动结算的。
  // 运费结算方式trans_type=1、2，表示西安结算，trans_type=0表示下站支付
  var totalXianSettleTransFunds = 0;

  for (var i = 0; i < sltDatas.length; i++) {
    var order = sltDatas[i];

    var realOrderAmount = order.order_real ? order.order_real : order.order_amount;
    totalActualGoodsFunds += Number(realOrderAmount);

    var realTransAmount = order.trans_real ? order.trans_real : order.trans_discount;
    if (order.trans_type == 0) {
      totalActualTransFunds += Number(realTransAmount);
      totalShouldTransFunds += Number(order.trans_discount);
    } else {
      totalXianSettleTransFunds += parseInt(realTransAmount);
    }

    totalShouldGoodsFunds += parseInt(order.order_amount);

    totalAccount = totalActualGoodsFunds + totalShouldTransFunds;
  }
  accountData.totalAccount = totalAccount;
  accountData.totalShouldGoodsFund = totalShouldGoodsFunds;
  accountData.totalShouldTransFund = totalShouldTransFunds;
  accountData.totalActualGoodsFund = totalActualGoodsFunds;
  accountData.totalActualTransFund = totalActualTransFunds;
  accountData.totalXianSettleTransFunds = totalXianSettleTransFunds;

  return accountData;
}

//获取当前列表中勾选下账信息 包含记录总数，货款、运费总额等
function getSelectedDownAccount(id, type) {
  var accountData = {};

  var sltDatas = getGridSelectRows(id);
  var totalActualGoodsFunds = 0;
  var totalTransFunds = 0;
  var ids = '',
    checkCodes = '';
  var result = true;
  var msg = '';
  var customerName = '',
    changed = false,
    searchCondition = 'customer'; //记录每行的客户姓名是否一样，不一样则查询条件为运单号，一样则查询条件为客户姓名
  accountData.recordNum = sltDatas.length;
  var sendCustomerName = '',
    sendCustomerMobiles = '',
    bankName = '',
    bankAccount = '',
    fixBankAccount = '';
  var downDialogTable = '';
  for (var i = 0; i < sltDatas.length; i++) {
    if (i == 0) {
      sendCustomerName = sltDatas[i]['SendCustomer.customer_name'];
      bankAccount = sltDatas[i]['bank_account'];
      bankName = sendCustomerName;
      fixBankAccount = sltDatas[i]['SendCustomer.customer_bankcode'];
    } else if (id != 'checkedlist' && bankAccount != sltDatas[i]['bank_account']) {
      result = false;
      msg = '勾选的下账记录不属于同一个银行账号，不能同时下账！';
      break;
    } else if (id == 'checkedlist' && bankAccount != sltDatas[i]['bank_account']) {
      bankAccount += ',' + sltDatas[i]['bank_account'];
      bankName += ',' + sltDatas[i]['SendCustomer.customer_name'];
    }

    if (customerName === '') {
      customerName = sltDatas[i]['GetCustomer.customer_name'];
    }

    if (sendCustomerMobiles.length > 0) {
      sendCustomerMobiles += ',';
    }

    sendCustomerMobiles += sltDatas[i]['SendCustomer.customer_mobile'];

    if (
      customerName !== '' &&
      changed === false &&
      sltDatas[i]['GetCustomer.customer_name'] != customerName
    ) {
      changed = true;
      searchCondition = 'checkcode';
    }

    if (type && type == 'canceldown') {
      if (sltDatas[i].is_downaccount != 1) {
        result = false;
        msg = '您勾选的记录有些没下账，请重新勾选';
        break;
      }
    } else if (sltDatas[i].is_downaccount != 0) {
      result = false;
      msg = '您勾选的记录有些已经下完账，请重新勾选';
      break;
    }

    //是否“回付”运费
    if (
      sltDatas[i].transpay_advance &&
      sltDatas[i].transpay_advance.indexOf('回') >= 0 &&
      parseInt(sltDatas[i].should_goodsfund) > 0
    ) {
      totalTransFunds += parseInt(sltDatas[i].should_transfund);
    }

    if (
      sltDatas[i].is_settleaccount == 1 ||
      (sltDatas[i].is_settleaccount == 0 && sltDatas[i].goodspay_advance == '网')
    ) {
      if (
        /^[0-9]*$/.test(sltDatas[i].actual_goodsfund) &&
        $.trim(sltDatas[i].actual_goodsfund).length > 0
      ) {
        totalActualGoodsFunds += parseInt(sltDatas[i].actual_goodsfund);
      } else {
        totalActualGoodsFunds += parseInt(sltDatas[i].should_goodsfund);
      }
    }

    //下账对话框中的详细列表
    downDialogTable +=
      '<tr><td style="border:solid 1px #ccc;padding-left:3px;">' +
      sltDatas[i].check_code +
      '</td><td style="border:solid 1px #ccc;padding-left:3px;">' +
      sltDatas[i].actual_goodsfund +
      '</td><td style="border:solid 1px #ccc;padding-left:3px;">' +
      sltDatas[i].should_goodsfund +
      '</td></tr>';

    if (sltDatas[i].check_id) {
      if (ids.length > 0) {
        ids += ',';
      }
      ids += sltDatas[i].check_id;
    }

    if (sltDatas[i].check_code) {
      if (checkCodes.length > 0) {
        checkCodes += ',';
      }
      checkCodes += sltDatas[i].check_code;
    }
  }

  if (accountData.recordNum == 0) {
    result = false;
    if (type && type == 'canceldown') {
      msg = '请选择需要取消下账的货物清单！';
    } else {
      msg = '请选择需要下账的货物清单！';
    }
  }

  accountData.totalActualGoodsFund = totalActualGoodsFunds;
  accountData.totalTransFunds = totalTransFunds;
  accountData.ids = ids;
  accountData.checkCodes = checkCodes;
  accountData.result = result;
  accountData.msg = msg;
  accountData.searchCondition = searchCondition;
  accountData.customerName = customerName;
  accountData.sendCustomerName = sendCustomerName;
  accountData.bankAccount = bankAccount;
  accountData.bankName = bankName;
  accountData.fixBankAccount = fixBankAccount;
  accountData.downDialogTable = downDialogTable;
  accountData.sendCustomerMobiles = sendCustomerMobiles;

  return accountData;
}
