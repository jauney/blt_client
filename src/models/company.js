import { queryCompanyList, addCompany, updateCompany } from '@/services/api';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../utils/storage';

export default {
  namespace: 'company',

  state: {
    // 分公司，company_type=2
    branchCompanyList: [],
    branchTotal: 0,
    // 总公司，company_type=1
    companyList: [],
    companyTotal: 0,
  },

  effects: {
    *getCompanyList({ payload }, { call, put }) {
      let companyType = 2;
      if (!payload || !payload.filter) {
        payload = { filter: { company_type: 2 } };
      } else {
        companyType = payload.filter.company_type;
      }
      const response = yield call(queryCompanyList, payload);
      const list = response.companys;
      const action = companyType === 2 ? 'queryBranchCompanyList' : 'queryCompanyList';
      yield put({
        type: action,
        payload: { list: Array.isArray(list) ? list : [], total: response.total },
      });

      return list;
    },
    *getBranchCompanyList({ payload }, { call, put }) {
      let list = [payload];
      let total = 0;
      if (payload.company_type == 1) {
        payload = { filter: { company_type: 2 } };
        const response = yield call(queryCompanyList, payload);
        list = response.companys;
        total = response.total;
      }

      yield put({
        type: 'queryBranchCompanyList',
        payload: { list: Array.isArray(list) ? list : [], total },
      });

      return list;
    },
    *addCompany({ payload }, { call, put }) {
      const response = yield call(addCompany, payload);
      return response;
    },
  },

  reducers: {
    queryBranchCompanyList(state, action) {
      return {
        ...state,
        branchCompanyList: action.payload.list,
        branchTotal: action.payload.total,
      };
    },
    queryCompanyList(state, action) {
      return {
        ...state,
        companyList: action.payload.list,
        companyTotal: action.payload.total,
      };
    },
  },
};
