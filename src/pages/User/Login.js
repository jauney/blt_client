import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import { Checkbox, Alert, Icon, message, Button } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';
const { ipcRenderer } = window.require('electron')
const { machineId, machineIdSync } = window.require('node-machine-id');
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };


  async componentDidMount () {
    this.getPrinterList()
  }

  getPrinterList = () => {
    // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
    ipcRenderer.send('getPrinterList')
    ipcRenderer.once('getPrinterList', (event, data) => {
      // 过滤可用打印机
      console.log('print list...', data)
      let printList = data.filter(element => {
        return element.name.includes('244') || element.name.includes('HPRT')
      })
      console.log(printList)

      // 1.判断是否有打印服务
      if (printList.length <= 0) {
        console.log('标签打印服务异常,请尝试重启电脑')
      } else {
        localStorage.setItem('LabelPrinterName', printList[0].name)
      }
    })
  }

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      this.loginForm.validateFields(['mobile'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          dispatch({
            type: 'login/getCaptcha',
            payload: values.mobile,
          })
            .then(resolve)
            .catch(reject);
        }
      });
    });

  handleSubmit = async (err, values) => {
    const { type } = this.state;
    let macId = machineIdSync({ original: true })

    if (!err) {
      const { dispatch } = this.props;
      const result = await dispatch({
        type: 'login/login',
        payload: {
          ...values,
          mac_id: macId,
          type
        },
      });

      if (!result) {
        message.error('系统异常，稍后再试')
      }
      else if (result.code == 1001) {
        message.error(result.msg);
      }
      else if (result.code == 1002) {
        message.error('用户电脑认证失败');
      }
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  print = () => {
    //告诉渲染进程，开始渲染打印内容
    const printOrderWebview = document.querySelector('#printLabelWebview')
    printOrderWebview.send('webview-print-render', `<div>888888888</div><div>888888888</div><div>888888888</div><div>888888888</div>`)
  }

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render () {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'app.login.tab-login-credentials' })}>
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage(formatMessage({ id: 'app.login.message-invalid-credentials' }))}
            <UserName
              name="userName"
              placeholder={`${formatMessage({ id: 'app.login.userName' })}: admin or user`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.userName.required' }),
                },
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'app.login.password' })}: ant.design`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.password.required' }),
                },
              ]}
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
          </Tab>
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="app.login.remember-me" />
            </Checkbox>
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
