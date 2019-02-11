import { getOrderCode, createOrder, getOrderList, deleteOrder } from '@/services/api';

export default {
  namespace: 'order',

  state: {
    orderList: [],
    orderCode: {},
    total: 0,
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
    *getOrderListAction({ payload }, { call, put }) {
      payload.order_status = 0;
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
  },

  reducers: {
    getOrderCodeReducer(state, action) {
      return {
        ...state,
        orderCode: action.payload,
      };
    },
    getOrderListReducer(state, action) {
      let newList = state.orderList || [];
      if (Array.isArray(action.payload.orders)) {
        newList = newList.concat(action.payload.orders);
      }
      return {
        ...state,
        orderList: newList,
        total: action.payload.total,
      };
    },
  },
};
