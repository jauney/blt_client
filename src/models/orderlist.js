import { getOrderListAxios, getOrderStatisticAxios } from '@/services/api';

export default {
  namespace: 'orderlist',

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
    totalXianInsurence: 0,
    totalTifuInsurance: 0,
  },

  effects: {
    *getOrderListAction ({ payload }, { call, put }) {
      const response = yield call(getOrderListAxios, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response || [],
      });
    },
    *getOrderStatisticAction ({ payload }, { call, put }) {
      const response = yield call(getOrderStatisticAxios, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
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
