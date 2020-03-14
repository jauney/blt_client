import {
  queryCustomerList,
  getCustomerList,
  getCustomerTypes,
  getCustomer,
  removeCustomer,
  createCustomer,
  updateCustomer,
} from '@/services/api';

export default {
  namespace: 'customer',

  state: {
    getCustomerList: [],
    getCustomerMap: {},
    getCustomerPageNo: 1,
    sendCustomerList: [],
    sendCustomerMap: {},
    sendCustomerPageNo: 1,
    customers: [],
    total: 0,
    customerTypesTotal: 0,
    customerTypes: [],
  },

  effects: {
    // 专门用于客户管理
    *queryCustomerListAction({ payload }, { call, put, select }) {
      const response = yield call(getCustomerList, payload);

      yield put({
        type: 'queryGetCustomersReducer',
        payload: response,
      });
    },
    // 获取单个客户信息
    *queryCustomerAction({ payload }, { call, put, select }) {
      const response = yield call(getCustomer, payload);
      yield put({
        type: 'queryCustomerReducer',
        payload: Object.assign({ type: payload.type }, response),
      });
      return response;
    },
    *queryCustomerTypesAction({ payload }, { call, put, select }) {
      const response = yield call(getCustomerTypes, payload);

      yield put({
        type: 'queryGetCustomerTypesReducer',
        payload: response,
      });
    },
    *createCustomerAction({ payload }, { call, put }) {
      const response = yield call(createCustomer, payload);
      return response;
    },
    *updateCustomerAction({ payload }, { call, put }) {
      const response = yield call(updateCustomer, payload);
      return response;
    },
    *getCustomerListAction({ payload }, { call, put, select }) {
      const customerState = yield select(state => state.customer);
      payload.type = 2;
      payload.pageNo = customerState.getCustomerPageNo;
      payload.pageSize = 20;
      payload.filter.customerMobiles = [];

      const response = yield call(queryCustomerList, payload);
      const list = response.customers;

      yield put({
        type: 'queryGetCustomerList',
        payload: Array.isArray(list) ? list : [],
      });
    },
    *sendCustomerListAction({ payload }, { call, put, select }) {
      const customerState = yield select(state => state.customer);
      payload.type = 1;
      payload.pageNo = customerState.sendCustomerPageNo;
      payload.pageSize = 20;

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
    *resetCustomerPageNoAction({ payload }, { call, put }) {
      yield put({
        type: 'resetCustomerPageNo',
        payload,
      });
    },
  },

  reducers: {
    queryGetCustomersReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    /**
     * 将通过手机号，customer_id查询出来的用户信息push到list中
     * @param {*} state
     * @param {*} action
     */
    queryCustomerReducer(state, action) {
      const sendCustomerList = state.sendCustomerList
      const getCustomerList = state.getCustomerList
      let getCustomer = action.payload.getCustomer
      let sendCustomer = action.payload.sendCustomer
      let getCustomerFlag = false
      for (let i = 0; i < getCustomerList.length; i++) {
        let item = getCustomerList[i]
        if (getCustomer && getCustomer.customer_id == item.customer_id) {
          getCustomerFlag = true
          break
        }
      };
      if (!getCustomerFlag && getCustomer && getCustomer.customer_id) { getCustomerList.push(getCustomer) }

      let sendCustomerFlag = false
      for (let i = 0; i < sendCustomerList.length; i++) {
        let item = sendCustomerList[i]
        if (sendCustomer && sendCustomer.customer_id == item.customer_id) {
          sendCustomerFlag = true
          break
        }
      };
      if (!sendCustomerFlag && sendCustomer && sendCustomer.customer_id) { sendCustomerList.push(sendCustomer) }
      return {
        ...state,
        sendCustomerList,
        getCustomerList
      }
    },
    queryGetCustomerTypesReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    queryGetCustomerList(state, action) {
      const customers = action.payload;
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
        sendCustomerPageNo: state.sendCustomerPageNo + 1,
        getCustomerList: state.getCustomerList.concat(action.payload),
      };
    },
    resetCustomerPageNo(state, action) {
      if (action.payload.type == 'Get') {
        return {
          ...state,
          getCustomerPageNo: 1,
          getCustomerList: [],
          getCustomerMap: {},
        };
      } else if (action.payload.type == 'Send') {
        return {
          ...state,
          sendCustomerPageNo: 1,
          sendCustomerList: [],
          sendCustomerMap: {},
        };
      }

      return {
        ...state,
        getCustomerPageNo: 1,
        sendCustomerPageNo: 1,
        sendCustomerList: [],
        sendCustomerMap: {},
        getCustomerList: [],
        getCustomerMap: {},
      };
    },
  },
};
