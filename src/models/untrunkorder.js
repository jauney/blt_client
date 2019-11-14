import {
  getOrderList,
  getOrderStatistic,
  cancelShipOrder,
  entrunkOrder,
  changeOrderReceiver,
} from '@/services/api';

export default {
  namespace: 'untrunkorder',

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
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = 1;
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      const response = yield call(getOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *cancelShipAction({ payload }, { call, put }) {
      return yield call(cancelShipOrder, payload); // post
    },
    *entrunkOrderAction({ payload }, { call, put }) {
      return yield call(entrunkOrder, payload); // post
    },
    *changeOrderReceiverAction({ payload }, { call, put }) {
      return yield call(changeOrderReceiver, payload); // post
    },
  },

  reducers: {
    getOrderListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
      };
    },
    getOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
