import {
  getOrderList,
  getOrderStatistic,
  confirmTrans,
  cancelConfirmTrans,
  updateTransSign,
} from '@/services/api';

export default {
  namespace: 'transconfirm',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    totalRealTransAmount: 0,
    totalRealOrderAmount: 0,
    totalAdvancepayAmount: 0,
    totalDeliverAmount: 0,
    totalTifuTransAmount: 0,
    totalXianTransAmount: 0,
    totalLatefee: 0,
    totalBonusfee: 0,
    totalCarFeeConfirm: 0,
    totalCarFee: 0,
    totalTifuInsurance: 0,
    totalXianInsurence: 0,
  },

  effects: {
    *getOrderListAction ({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [3, 7];

      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction ({ payload }, { call, put }) {
      payload.order_status = [3, 7];
      const response = yield call(getOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *cancelConfirmTransAction ({ payload }, { call, put }) {
      return yield call(cancelConfirmTrans, payload); // post
    },
    *confirmTransAction ({ payload }, { call, put }) {
      return yield call(confirmTrans, payload); // post
    },
    *signAction ({ payload }, { call, put }) {
      payload.trans_sign = 1;
      return yield call(updateTransSign, payload); // post
    },
    *cancelSignAction ({ payload }, { call, put }) {
      payload.trans_sign = 0;
      return yield call(updateTransSign, payload); // post
    },
  },

  reducers: {
    getOrderListReducer (state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
      };
    },
    getOrderStatisticReducer (state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
