import {
  getOrderListAxios,
  getOrderStatisticAxios,
  updateCarFee,
  updateCarStatus,
  cancelEntrunk,
  departOrder
} from '@/services/api';

export default {
  namespace: 'trunkedorder',

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
  },

  effects: {
    *getOrderListAction ({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [1, 8];

      const response = yield call(getOrderListAxios, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction ({ payload }, { call, put }) {
      payload.filter.order_status = [1, 8];
      const response = yield call(getOrderStatisticAxios, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *queryOrderListAction ({ payload }, { call, put }) {
      payload.filter = payload.filter || {};

      const response = yield call(getOrderListAxios, payload);
      return response
    },
    *updateCarFeeAction ({ payload }, { call, put }) {
      console.log(payload);
      return yield call(updateCarFee, payload); // post
    },
    *updateCarStatusAction ({ payload }, { call, put }) {
      console.log(payload);
      return yield call(updateCarStatus, payload); // post
    },
    *cancelEntrunkAction ({ payload }, { call, put }) {
      console.log(payload);
      return yield call(cancelEntrunk, payload); // post
    },
    *departOrderAction ({ payload }, { call, put }) {
      return yield call(departOrder, payload); // post
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
