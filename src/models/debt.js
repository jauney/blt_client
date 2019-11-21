import {
  getDebts,
  getDebtsStatistic,
  getDebtTypes,
  addDebt,
  settleDebt,
  getDebtUsers,
} from '@/services/api';

export default {
  namespace: 'debt',

  state: {
    debtUserPageNo: 1,
    debtUserMap: {},
    debtUserList: [],
    debtUserTotal: 0,
    debtList: [],
    debtTotal: 0,
    debtTypes: [],
    debtTypesTotal: 0,
    totalDebtMoney: 0,
    totalIncome: 0,
    totalExpense: 0,
  },

  effects: {
    *getDebtsAction({ payload }, { call, put }) {
      if (payload.filter.debtuser_id) {
        payload.filter.debtuser_id = Number(payload.filter.debtuser_id);
      }
      const response = yield call(getDebts, payload);
      yield put({
        type: 'getDebtsReducer',
        payload: response,
      });
    },
    *getDebtUsersAction({ payload }, { call, put, select }) {
      const customerState = yield select(state => state.debt);
      if (payload.filter.debtuser_id) {
        payload.filter.debtuser_id = Number(payload.filter.debtuser_id);
      }
      payload.pageNo = customerState.debtUserPageNo;
      payload.pageSize = 20;
      const response = yield call(getDebtUsers, payload);
      yield put({
        type: 'getDebtUsersReducer',
        payload: response,
      });
    },
    *getDebtsStatisticAction({ payload }, { call, put }) {
      const response = yield call(getDebtsStatistic, payload);
      yield put({
        type: 'getDebtsStatisticReducer',
        payload: response,
      });
    },
    *addDebtAction({ payload }, { call, put }) {
      return yield call(addDebt, payload); // post
    },
    *settleDebtAction({ payload }, { call, put }) {
      return yield call(settleDebt, payload); // post
    },
    *getDebtTypesAction({ payload }, { call, put }) {
      const response = yield call(getDebtTypes, {
        pageNo: 1,
        pageSize: 100,
        company_id: payload.company_id || 0,
        site_id: payload.site_id || 0,
      });
      yield put({
        type: 'getDebtTypesReducer',
        payload: response,
      });
    },
    *resetDebtUserPageNoAction({ payload }, { call, put }) {
      yield put({
        type: 'resetDebtUserPageNo',
        payload,
      });
    },
  },

  reducers: {
    getDebtsReducer(state, action) {
      return {
        ...state,
        debtList: action.payload.debts,
        debtTotal: action.payload.total,
      };
    },
    getDebtUsersReducer(state, action) {
      const customers = action.payload.debtUsers;
      const customerMap = state.debtUserMap;
      const customerList = state.debtUserList;
      customers.forEach(item => {
        if (!customerMap[item.debtuser_id]) {
          customerMap[item.debtuser_id] = item;
          customerList.push(item);
        }
      });
      return {
        ...state,
        debtUserPageNo: action.payload.length > 0 ? state.debtUserPageNo + 1 : state.debtUserPageNo,
        debtUserMap: customerMap,
        debtUserList: customerList,
      };
    },
    getDebtTypesReducer(state, action) {
      return {
        ...state,
        debtTypes: action.payload.debtTypes,
        debtTypesTotal: action.payload.total,
      };
    },
    getDebtsStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    resetDebtUserPageNo(state, action) {
      return {
        ...state,
        debtUserPageNo: 1,
        debtUserList: [],
        debtUserMap: {},
      };
    },
  },
};
