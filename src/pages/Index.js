import React, { PureComponent } from 'react';
import router from 'umi/router';
import { CacheUser } from '../utils/storage';
/* eslint react/no-multi-comp:0 */

class Main extends PureComponent {
  state = {};

  async componentDidMount() {
    this.gotoLogin();
  }

  /**
   * 登录校验跳转。后端接口没登录，则跳转到登录
   * @param {*} data
   */
  gotoLogin = () => {
    if (!CacheUser || !CacheUser.user_id) {
      router.push('/User/Login');
      return false;
    }
    return true;
  };

  render() {
    return <div />;
  }
}

export default Main;
