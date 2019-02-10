import { getOrderCode, createOrder, getOrderList } from '@/services/api';

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
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *submit({ payload }, { call, put }) {
      let callback;
      if (payload.id) {
        callback = Object.keys(payload).length === 1 ? removeFakeList : updateFakeList;
      } else {
        callback = addFakeList;
      }
      const response = yield call(callback, payload); // post
      yield put({
        type: 'queryList',
        payload: response,
      });
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
    queryListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload,
      };
    },
  },
};
