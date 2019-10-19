import { getTodayAccountList, getTodayAccountStatistic } from '@/services/api';

export default {
  namespace: 'search',

  state: {
    accounts: [],
    accountTotal: 0,
    totalAccount: 0,
    totalIncomeAccount: 0,
    totalExpenseAccount: 0,
    totalRealTransAmount: 0,
    totalRealOrderAmount: 0,
  },

  effects: {
    *getTodayAccountListAction({ payload }, { call, put }) {
      const response = yield call(getTodayAccountList, payload);
      yield put({
        type: 'getTodayAccountListReducer',
        payload: response,
      });
    },
    *getTodayAccountStatisticAction({ payload }, { call, put }) {
      const response = yield call(getTodayAccountStatistic, payload);
      yield put({
        type: 'getTodayAccountStatisticReducer',
        payload: response,
      });
    },
  },

  reducers: {
    getTodayAccountListReducer(state, action) {
      return {
        ...state,
        accountTotal: action.payload.total,
        accounts: action.payload.accounts,
      };
    },
    getTodayAccountStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
