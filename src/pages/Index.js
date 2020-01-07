import React, { PureComponent } from 'react';
import router from 'umi/router';
import { CacheUser } from '../utils/storage';
import back from '../assets/back.jpeg'
import { urlToList } from '@/components/_utils/pathTools';
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
    return <div style={{ backgroundImage: `url(${back})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', width: '100%', minHeight: '100vh', backgroundAttachment: "fixed" }} ></div>;
  }
}

export default Main;
