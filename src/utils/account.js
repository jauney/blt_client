/**
 * 获取当前列表中勾选的信息 包含记录总数，货款、运费总额等
 * type:cancelsettle 获取取消结算的统计数据
 * @param {*} sltDatas
 * @param {*} type
 */
export function getSelectedAccount(sltDatas, type) {
  let accountData = {};

  accountData.recordNum = sltDatas.length;
  let totalAccount = 0;

  var totalShouldGoodsFunds = 0;
  var totalShouldTransFunds = 0;
  var totalActualGoodsFunds = 0;
  var totalActualTransFunds = 0;
  var totalTifuInsurance = 0;
  var totalXianInsurance = 0;
  // 垫付金额
  var totalAdvancepayAmount = 0;
  // 货款为0，运费结算方式为 回付、现付的记录，不能取消结算，因为这些记录是自动结算的。
  // 运费结算方式trans_type=1、2，表示西安结算，trans_type=0表示下站支付
  var totalXianSettleTransFunds = 0;

  for (var i = 0; i < sltDatas.length; i++) {
    var order = sltDatas[i];

    var realOrderAmount = order.order_real ? order.order_real : order.order_amount;
    totalActualGoodsFunds += Number(realOrderAmount);
    // trans_discount即为实付运费，去掉trans_real字段
    var realTransAmount = order.trans_discount ? order.trans_discount : order.trans_amount;
    var insuranceFee = 0;
    if (order.insurance_fee) {
      insuranceFee += order.insurance_fee;
    }

    if (order.trans_type == 0) {
      totalActualTransFunds += Number(realTransAmount || 0);
      totalAdvancepayAmount += Number(order.order_advancepay_amount || 0);
      totalTifuInsurance += insuranceFee;
    } else {
      totalXianSettleTransFunds += Number(realTransAmount || 0);
      totalXianInsurance += insuranceFee;
    }
    totalShouldTransFunds += Number(order.trans_amount || 0);
    totalShouldGoodsFunds += Number(order.order_amount || 0);

    totalAccount =
      totalActualGoodsFunds + totalActualTransFunds + totalAdvancepayAmount + totalTifuInsurance;
  }
  accountData.totalAccount = totalAccount;
  accountData.totalShouldGoodsFund = totalShouldGoodsFunds;
  accountData.totalShouldTransFund = totalShouldTransFunds;
  accountData.totalActualGoodsFund = totalActualGoodsFunds;
  accountData.totalActualTransFund = totalActualTransFunds;
  accountData.totalXianSettleTransFunds = totalXianSettleTransFunds;
  accountData.totalAdvancepayAmount = totalAdvancepayAmount;
  accountData.totalTifuInsurance = totalTifuInsurance;
  accountData.totalXianInsurance = totalXianInsurance;

  return accountData;
}

//获取当前列表中勾选下账信息 包含记录总数，货款、运费总额等
export function getSelectedDownAccount(sltDatas = []) {
  const accountData = {};

  let totalActualGoodsFunds = 0;
  let totalTransFunds = 0;
  let sendCustomerId = '';
  let isSameSendCustomer = true;
  let isSettled = true;
  for (var i = 0; i < sltDatas.length; i++) {
    if (i == 0) {
      sendCustomerId = sltDatas[i]['sendcustomer_id'];
    } else if (sendCustomerId && sendCustomerId != sltDatas[i]['sendcustomer_id']) {
      isSameSendCustomer = false;
      break;
    }

    //是否“回付”运费
    if (
      sltDatas[i].trans_type &&
      sltDatas[i].trans_type == 3 &&
      Number(sltDatas[i].order_amount) > 0
    ) {
      totalTransFunds += Number(sltDatas[i].trans_discount || sltDatas[i].trans_amount);
    }

    if (sltDatas[i].order_status == 6) {
      if (Number(sltDatas[i].order_real) > 0) {
        totalActualGoodsFunds += Number(sltDatas[i].order_real);
      } else {
        totalActualGoodsFunds += Number(sltDatas[i].order_amount);
      }
    } else {
      isSettled = false;
    }
  }

  accountData.totalActualGoodsFund = totalActualGoodsFunds;
  accountData.totalTransFunds = totalTransFunds;
  accountData.isSameSendCustomer = isSameSendCustomer;
  accountData.isSettled = isSettled;

  return accountData;
}
