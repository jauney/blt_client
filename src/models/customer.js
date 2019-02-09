import { queryCustomerList, removeCustomer, addCustomer, updateCustomer } from '@/services/api';

export default {
  namespace: 'customer',

  state: {
    getCustomerList: [],
    sendCustomerList: [],
  },

  effects: {
    *getCustomerListAction({ payload }, { call, put }) {
      payload.type = 2;

      const response = yield call(queryCustomerList, payload);
      const list = response.customers;
      yield put({
        type: 'queryGetCustomerList',
        payload: Array.isArray(list) ? list : [],
      });
    },
    *sendCustomerListAction({ payload }, { call, put }) {
      payload.type = 1;
      const response = yield call(queryCustomerList, payload);
      const list = response.customers;
      yield put({
        type: 'querySendCustomerList',
        payload: Array.isArray(list) ? list : [],
      });
    },
    *addFetch({ payload }, { call, put }) {
      const response = yield call(addCustomer, payload);

      yield put({
        type: 'appendGetCustomer',
        payload: response ? [response] : [],
      });
    },
  },

  reducers: {
    queryGetCustomerList(state, action) {
      return {
        ...state,
        getCustomerList: action.payload,
      };
    },
    querySendCustomerList(state, action) {
      return {
        ...state,
        sendCustomerList: action.payload,
      };
    },
    appendGetCustomer(state, action) {
      return {
        ...state,
        getCustomerList: state.getCustomerList.concat(action.payload),
      };
    },
  },
};
