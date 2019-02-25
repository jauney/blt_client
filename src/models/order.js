import {
  getOrderCode,
  createOrder,
  updateOrder,
  getOrderList,
  deleteOrder,
  getSiteOrderStatistic,
  shipOrder,
  cancelShipOrder,
} from '@/services/api';

export default {
  namespace: 'order',

  state: {
    orderList: [],
    orderCode: {},
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
  },

  effects: {
    *getOrderCodeAction({ payload }, { call, put }) {
      const response = yield call(getOrderCode, { order: payload });
      yield put({
        type: 'getOrderCodeReducer',
        payload: response,
      });
    },
    *createOrderAction({ payload }, { call, put }) {
      const response = yield call(createOrder, payload);
      yield put({
        type: 'appendListReducer',
        payload: response,
      });
      return response;
    },
    *updateOrderAction({ payload }, { call, put }) {
      console.log('update', payload);
      const response = yield call(updateOrder, payload);

      return response;
    },
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = 0;
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *deleteOrderAction({ payload }, { call, put }) {
      payload.is_delete = 1;
      return yield call(deleteOrder, payload); // post
    },
    *getSiteOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = 0;
      const response = yield call(getSiteOrderStatistic, payload);
      yield put({
        type: 'getSiteOrderStatisticReducer',
        payload: response,
      });
    },
    *shipOrderAction({ payload }, { call, put }) {
      return yield call(shipOrder, payload); // post
    },
    *cancelShipAction({ payload }, { call, put }) {
      return yield call(cancelShipOrder, payload); // post
    },
  },

  reducers: {
    getOrderCodeReducer(state, action) {
      return {
        ...state,
        orderCode: action.payload,
      };
    },
    getOrderListReducer(state, action) {
      // let newList = state.orderList || [];
      // if (Array.isArray(action.payload.orders)) {
      //   newList = newList.concat(action.payload.orders);
      // }
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
      };
    },
    getSiteOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
