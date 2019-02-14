import { queryCarList, getCarCode } from '@/services/api';

export default {
  namespace: 'car',

  state: {
    carList: [],
    carCode: 1,
  },

  effects: {
    *getCarCodeAction({ payload }, { call, put }) {
      const response = yield call(getCarCode, payload);
      yield put({
        type: 'getCarCodeReducer',
        payload: response,
      });
    },
    *getCarListAction({ payload }, { call, put }) {
      const response = yield call(queryCarList, payload);
      const list = response.cars;
      yield put({
        type: 'getCarListReducer',
        payload: Array.isArray(list) ? list : [],
      });
    },
  },

  reducers: {
    getCarListReducer(state, action) {
      return {
        ...state,
        carList: action.payload,
      };
    },
    getCarCodeReducer(state, action) {
      return {
        ...state,
        carCode: action.payload,
      };
    },
  },
};
