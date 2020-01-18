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
      const customerList = action.payload.type == 1 ? state.sendCustomerList : state.getCustomerList
      const customer = action.payload.type == 1 ? action.payload.sendCustomer : action.payload.getCustomer
      let customerFlag = false
      for (let i = 0; i < customerList.length; i++) {
        let item = customerList[i]
        if (customer && customer.customer_id == item.customer_id) {
          customerFlag = true
          break
        }
      };

      if (!customerFlag && customer && customer.customer_id) { customerList.push(customer) }
      if (action.payload.type == 1) {
        return {
          ...state,
          sendCustomerList: customerList
        }
      }
      else {
        return {
          ...state,
          getCustomerList: customerList
        }
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
      const customerMap = state.getCustomerMap;
      const customerList = state.getCustomerList;
      customers.forEach(item => {
        if (!customerMap[item.customer_id]) {
          customerMap[item.customer_id] = item;
          customerList.push(item);
        }
      });
      return {
        ...state,
        getCustomerPageNo:
          action.payload.length > 0 ? state.getCustomerPageNo + 1 : state.getCustomerPageNo,
        getCustomerMap: customerMap,
        getCustomerList: customerList,
      };
    },
    querySendCustomerList(state, action) {
      return {
        ...state,
        sendCustomerPageNo:
          action.payload.length > 0 ? state.sendCustomerPageNo + 1 : state.sendCustomerPageNo,
        sendCustomerList: state.sendCustomerList.concat(action.payload),
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
