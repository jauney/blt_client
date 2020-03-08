
import moment from 'moment';
/**
 * 获取当前列表中勾选的信息 包含记录总数，货款、运费总额等
 * type:cancelsettle 获取取消结算的统计数据
 * @param {*} sltDatas
 * @param {*} type  'init': 初始录入订单，没有实付金额，所以使用order_amount当做order_real
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
    var realOrderAmount = order.order_real || 0;
    if (type == 'init') {
      realOrderAmount = order.order_amount || 0
    }

    totalActualGoodsFunds += Number(realOrderAmount);
    // trans_discount即为实付运费，去掉trans_real字段
    var realTransAmount = order.trans_discount ? order.trans_discount : order.trans_amount;
    var insuranceFee = 0;
    if (order.insurance_fee) {
      insuranceFee += order.insurance_fee;
    }
    // 所有垫付，都是提付，下站结算，和货款性质一样
    totalAdvancepayAmount += Number(order.order_advancepay_amount || 0);

    if (order.trans_type == 0) {
      totalActualTransFunds += Number(realTransAmount || 0);
      totalTifuInsurance += insuranceFee;
    } else {
      totalXianSettleTransFunds += Number(realTransAmount || 0);
      totalXianInsurance += insuranceFee;
    }
    totalShouldTransFunds += Number(order.trans_amount || 0);
    totalShouldGoodsFunds += Number(order.order_amount || order.order_real || 0);

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


  let totalShouldGoodsFunds = 0;
  let totalActualGoodsFunds = 0;
  let totalTransFunds = 0;
  let totalPayTransFunds = 0;
  let totalPayInsurance = 0;
  let sendCustomerId = '';
  let bankAccount = ''
  let isSameSendCustomer = true;
  let isSameBankAccount = true;
  let isSettled = true;
  for (var i = 0; i < sltDatas.length; i++) {
    let order = sltDatas[i]
    if (i == 0) {
      sendCustomerId = order['sendcustomer_id'];
      bankAccount = order['bank_account'];
    }

    if (sendCustomerId && sendCustomerId != order['sendcustomer_id']) {
      isSameSendCustomer = false;
      break;
    }
    if (bankAccount && bankAccount != order['bank_account']) {
      isSameBankAccount = false;
      break;
    }

    //是否“回付|现付”运费
    if (order.trans_type == 1 || order.trans_type == 2) {
      totalTransFunds += Number(order.trans_discount || order.trans_amount);
    }
    // 下账时只减去回付运费、回付保费
    if (order.trans_type == 2) {
      totalPayTransFunds += Number(order.trans_discount || order.trans_amount);
      totalPayInsurance += Number(order.insurance_fee || 0);
    }

    if (order.order_status == 6) {
      if (Number(order.order_real) > 0) {
        totalActualGoodsFunds += Number(order.order_real);
      } else {
        totalActualGoodsFunds += Number(order.order_amount);
      }
      totalShouldGoodsFunds += Number(order.order_amount || order.order_real || 0);

    } else {
      isSettled = false;
    }
  }

  accountData.totalShouldGoodsFund = totalShouldGoodsFunds
  accountData.totalActualGoodsFund = totalActualGoodsFunds;
  accountData.totalPayTransFunds = totalPayTransFunds;
  accountData.totalPayInsurance = totalPayInsurance;
  accountData.totalTransFunds = totalTransFunds;
  accountData.isSameSendCustomer = isSameSendCustomer;
  accountData.isSameBankAccount = isSameBankAccount;
  accountData.isSettled = isSettled;

  return accountData;
}

/**
 * 计算滞纳金
 * @param {*} item
 * @param {*} company
 */
export function calLateFee(items = [], company = {}) {
  let lateFee = 0
  for (let i = 0; i < items.length; i++) {
    let item = items[i]
    let orderAmount = Number(item.order_amount)
    // 计算滞纳金
    if (
      Number(item.order_status) < 6 &&
      Number(item.order_status) >= 3 &&
      orderAmount > 0
    ) {
      let departDate = moment(Number(item.depart_date))
      let curDate = moment(new Date().getTime())
      let subDays = curDate.diff(departDate, 'days') // 1

      if (subDays >= company.late_fee_days) {
        lateFee = company.late_fee_beginamount || 10
        lateFee = 10 + subDays * Number((orderAmount * (company.late_fee_rate || 0)) / 1000)
      }
    }
  }
  return Math.floor(lateFee * 100) / 100
}

/**
 * 计算奖励金
 * @param {*} item
 * @param {*} company
 */
export function calBonusFee(items = [], company = {}) {
  let rewardFee = 0

  for (let i = 0; i < items.length; i++) {
    let item = items[i]
    let orderAmount = Number(item.order_real)
    // 计算奖励金
    if (
      Number(item.order_status) >= 4 &&
      orderAmount > 0 &&
      item.depart_date
    ) {
      let departDate = moment(Number(item.depart_date))
      let settleDate = moment(Number(item.settle_date || (new Date()).getTime()))
      let subHours = settleDate.diff(departDate, 'hours')
      if (subHours <= 24) {
        rewardFee += Number((orderAmount * company.rewards_24h || 1) / 1000)

      } else if (subHours <= 48) {
        rewardFee += Number(
          (orderAmount * company.rewards_48h || 0.04) / 1000
        )
      } else if (subHours <= 72) {
        rewardFee += Number(
          (orderAmount * company.rewards_72h || 0.01) / 1000
        )
      }
    }
  }
  return Math.floor(rewardFee * 100) / 100
}
