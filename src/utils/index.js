

import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

export {
  locale
}


export function showLoading (dispatch) {
  dispatch({
    type: 'ajaxLoading/showLoading',
    payload: {},
  });
}


export function hideLoading (dispatch) {
  dispatch({
    type: 'ajaxLoading/hideLoading',
    payload: {},
  });
}
