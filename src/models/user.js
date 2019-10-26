import { addUser, getUserInfos, getRoleList } from '@/services/api';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../utils/storage';

export default {
  namespace: 'user',
  state: {
    userList: [],
    total: 0,
    roleList: [],
    roleTotal: 0,
  },
  effects: {
    *getUserListAction({ payload }, { call, put }) {
      const response = yield call(getUserInfos, payload);
      yield put({
        type: 'getUserListReducer',
        payload: response,
      });

      return response;
    },
    *getRoleListAction({ payload }, { call, put }) {
      const response = yield call(getRoleList, payload);
      yield put({
        type: 'getRoleListReducer',
        payload: response,
      });

      return response;
    },
    *addUserAction({ payload }, { call, put }) {
      const response = yield call(addUser, payload);
      return response;
    },
  },

  reducers: {
    getUserListReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    getRoleListReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
