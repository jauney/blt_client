import { getExpenses, addExpense, getExpenseTypes, getExpenseDetails } from '@/services/api';

export default {
  namespace: 'expense',

  state: {
    expenseList: [],
    expenseTotal: 0,
    expenseTypes: [],
    expenseDetails: [],
    totalExpense: 0,
  },

  effects: {
    *getExpensesAction({ payload }, { call, put }) {
      const response = yield call(getExpenses, payload);
      yield put({
        type: 'getExpensesReducer',
        payload: response,
      });
    },
    *getExpenseTypesAction({ payload }, { call, put }) {
      const response = yield call(getExpenseTypes, {
        pageNo: 1,
        pageSize: 100,
        company_id: payload.company_id || 0,
        site_id: payload.site_id || 0,
      });
      console.log(response);
      yield put({
        type: 'getExpenseTypesReducer',
        payload: response,
      });
    },
    *getExpenseDetailsAction({ payload }, { call, put }) {
      const response = yield call(getExpenseTypes, payload);
      yield put({
        type: 'getExpenseDetailsReducer',
        payload: response,
      });
    },
    *getExpensesStatisticAction({ payload }, { call, put }) {
      const response = yield call(getExpensesStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *addExpenseAction({ payload }, { call, put }) {
      return yield call(addExpense, payload); // post
    },
  },

  reducers: {
    getExpensesReducer(state, action) {
      return {
        ...state,
        expenseList: action.payload.expenses,
        expenseTotal: action.payload.total,
        totalExpense: action.payload.totalExpense,
      };
    },
    getExpenseTypesReducer(state, action) {
      console.log(action);
      return {
        ...state,
        expenseTypes: action.payload.expenseTypes,
        expenseTypesTotal: action.payload.total,
      };
    },
    getExpenseDetailsReducer(state, action) {
      return {
        ...state,
        expenseDetails: action.payload.expenseDetails,
        expenseDetailsTotal: action.payload.total,
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
