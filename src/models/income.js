import { getIncomes, addIncome, getIncomeTypes, getIncomeDetails } from '@/services/api';

export default {
  namespace: 'income',

  state: {
    incomeList: [],
    incomeTotal: 0,
    incomeTypes: [],
    incomeDetails: [],
  },

  effects: {
    *getIncomesAction({ payload }, { call, put }) {
      const response = yield call(getIncomes, payload);
      yield put({
        type: 'getIncomesReducer',
        payload: response,
      });
    },
    *getIncomeTypesAction({ payload }, { call, put }) {
      const response = yield call(getIncomeTypes, {
        pageNo: 1,
        pageSize: 100,
        company_id: payload.company_id || 0,
        site_id: payload.site_id || 0,
      });
      console.log(response);
      yield put({
        type: 'getIncomeTypesReducer',
        payload: response,
      });
    },
    *getIncomeDetailsAction({ payload }, { call, put }) {
      const response = yield call(getIncomeTypes, payload);
      yield put({
        type: 'getIncomeDetailsReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = 0;
      const response = yield call(getTrunkedOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *addIncomeAction({ payload }, { call, put }) {
      return yield call(addIncome, payload); // post
    },
  },

  reducers: {
    getIncomesReducer(state, action) {
      return {
        ...state,
        incomeList: action.payload.incomes,
        incomeTotal: action.payload.total,
      };
    },
    getIncomeTypesReducer(state, action) {
      console.log(action);
      return {
        ...state,
        incomeTypes: action.payload.incomeTypes,
        incomeTypesTotal: action.payload.total,
      };
    },
    getIncomeDetailsReducer(state, action) {
      return {
        ...state,
        incomeDetails: action.payload.incomeDetails,
        incomeDetailsTotal: action.payload.total,
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
