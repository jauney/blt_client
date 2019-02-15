import { queryCarList, getCarCode, getLastCarCode, getCarInfo } from '@/services/api';

export default {
  namespace: 'car',

  state: {
    carCode: {},
    carInfo: {},
    carList: [],
    lastCar: {},
  },

  effects: {
    *getCarCodeAction({ payload }, { call, put }) {
      const response = yield call(getCarCode, payload);
      yield put({
        type: 'getCarCodeReducer',
        payload: response,
      });
    },
    *getCarInfoAction({ payload }, { call, put }) {
      const response = yield call(getCarInfo, payload);
      yield put({
        type: 'getCarInfoReducer',
        payload: response,
      });
      return response;
    },
    *getLastCarCodeAction({ payload }, { call, put }) {
      const response = yield call(getLastCarCode, payload);
      yield put({
        type: 'getLastCarCodeReducer',
        payload: response,
      });
      return response;
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
    getLastCarCodeReducer(state, action) {
      return {
        ...state,
        lastCar: action.payload,
      };
    },
    getCarInfoReducer(state, action) {
      return {
        ...state,
        carInfo: action.payload,
      };
    },
  },
};
