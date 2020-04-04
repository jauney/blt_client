
import {
  AutoComplete, message
} from 'antd';

const customerAutoCompleteState = {
  currentGetCustomer: {},
  currentSendCustomer: {},
  getCustomerNameChangeTimer: 0,
  sendCustomerNameChangeTimer: 0,
  currentSender: {},
  currentReceiver: {}
};

export { customerAutoCompleteState }

export async function fetchGetCustomerList (context, filter = {}) {
  const { dispatch } = context.props;
  await dispatch({
    type: 'customer/getCustomerListAction',
    payload: {
      filter,
    },
  });
};

export async function fetchSendCustomerList (context, filter = {}) {
  const { dispatch } = context.props;
  await dispatch({
    type: 'customer/sendCustomerListAction',
    payload: {
      filter,
    },
  });
};

export async function onSendCustomerChange (context, value) {
  context.setState({
    sendCustomerNameChangeTimer: (new Date()).getTime()
  })
  setTimeout(() => {
    const { sendCustomerNameChangeTimer } = context.state
    if (new Date().getTime() - sendCustomerNameChangeTimer > 300 && value) {
      fetchSendCustomerList(context, { customer_name: value })
    }
    if (!value) {
      context.setState({
        currentSendCustomer: {}
      })
    }
  }, 350)
};

let emptyCompanyAlert = false
export async function onGetCustomerChange (context, value) {
  context.setState({
    getCustomerNameChangeTimer: (new Date()).getTime()
  })
  setTimeout(() => {
    const { getCustomerNameChangeTimer, currentCompany } = context.state
    if (!currentCompany || !currentCompany.company_id) {
      if (!emptyCompanyAlert) {
        message.info('请先选择分公司')
        emptyCompanyAlert = true
      }
      return
    }
    else {
      emptyCompanyAlert = false
    }
    if (new Date().getTime() - getCustomerNameChangeTimer > 300 && value) {
      fetchGetCustomerList(context, { customer_name: value, company_id: currentCompany.company_id })
    }
    if (!value) {
      context.setState({
        currentGetCustomer: {}
      })
    }
  }, 350)
};


export async function onGetCustomerSelect (context, value) {
  const { customer: { getCustomerList, sendCustomerList }, form } = context.props;
  let currentCustomer;
  for (let i = 0; i < getCustomerList.length; i++) {
    const customer = getCustomerList[i];
    if (customer.customer_id == value) {
      currentCustomer = customer;
      break;
    }
  }

  if (currentCustomer) {
    await context.setState({
      currentGetCustomer: currentCustomer,
    });
  }
}

export async function onSendCustomerSelect (context, value) {
  const { customer: { getCustomerList, sendCustomerList }, form } = context.props;
  let currentCustomer;
  for (let i = 0; i < sendCustomerList.length; i++) {
    const customer = sendCustomerList[i];
    if (customer.customer_id == value) {
      currentCustomer = customer;
      break;
    }
  }

  if (currentCustomer) {
    await context.setState({
      currentSendCustomer: currentCustomer,
    });
  }
}


export async function onCourierChange (context, value, type) {
  if (!value) {
    if (type == 'receiver') {
      context.setState({
        currentReceiver: {}
      })
    }
    else {
      context.setState({
        currentSender: {}
      })
    }
  }
};


export async function onCourierSelect (context, value, type) {
  const { courier: { receiverList = [], senderList = [] } } = context.props
  let courier;
  let courierList = type == 'receiver' ? receiverList : senderList
  for (let i = 0; i < courierList.length; i++) {
    const customer = courierList[i];
    if (customer.courier_id == value) {
      courier = customer;
      break;
    }
  }

  if (courier && type == 'receiver') {
    await context.setState({
      currentReceiver: courier,
    });
  }
  else if (courier && type == 'sender') {
    await context.setState({
      currentSender: courier,
    });
  }
}

/**
 * 保存订单信息、查询订单列表时，将已经选择的客户信息转化为正确格式
 */
export async function setCustomerFieldValue (context, fieldsValue = {}, type = 'search') {
  const { currentGetCustomer, currentSendCustomer } = context.state
  const { customer: { sendCustomerList, getCustomerList } } = context.props
  // 1.从下拉列表选择的客户使用currentSendCustomer，currentGetCustomer
  // 2.输入电话带出来的客户使用currentSendCustomer，currentGetCustomer
  let sendCustomer = currentSendCustomer
  let getCustomer = currentGetCustomer
  // 编辑时的客户，使用list中的数据，因为没有currentSendCustomer，currentGetCustomer
  sendCustomerList.forEach(item => {
    if (item.customer_id == fieldsValue.sendcustomer_name || item.customer_id == fieldsValue.sendcustomer_id) {
      sendCustomer = item
    }
  })
  getCustomerList.forEach(item => {
    if (item.customer_id == fieldsValue.getcustomer_name || item.customer_id == fieldsValue.getcustomer_id) {
      getCustomer = item
    }
  })

  if (getCustomer && getCustomer.customer_id) {
    fieldsValue.getcustomer_id = getCustomer.customer_id;
    // 如果是添加、编辑托运单，则需要赋值customer_name, customer_address
    // 如果是查询，则只需要依据customer_id即可
    if (type == 'edit') {
      fieldsValue.getcustomer_name = getCustomer.customer_name;
      fieldsValue.getcustomer_address = getCustomer.customer_address
      fieldsValue.getcustomer_type = getCustomer.customer_type || 0
    }
  }
  else if (fieldsValue.getcustomer_id) {
    // 非选择，而是手工输入的姓名
    fieldsValue.getcustomer_name = fieldsValue.getcustomer_id;
    delete fieldsValue.getcustomer_id
    if (type == 'edit') {
      fieldsValue.getcustomer_id = 0;
    }
  }

  if (sendCustomer && sendCustomer.customer_id) {
    fieldsValue.sendcustomer_id = sendCustomer.customer_id;
    if (type == 'edit') {
      fieldsValue.sendcustomer_name = sendCustomer.customer_name;
      fieldsValue.sendcustomer_address = sendCustomer.customer_address
      fieldsValue.sendcustomer_type = getCustomer.customer_type || 0
    }
  }
  else if (fieldsValue.sendcustomer_id) {
    // 非选择，而是手工输入的姓名
    fieldsValue.sendcustomer_name = fieldsValue.sendcustomer_id;
    delete fieldsValue.sendcustomer_id
    if (type == 'edit') {
      fieldsValue.sendcustomer_id = 0;
    }
  }

  return fieldsValue
}


/**
 * 客户管理，将已经选择的客户信息转化为正确格式
 */
export async function setCustomerFieldValue2Mng (context, fieldsValue = {}, type = 'search') {
  const { currentGetCustomer, currentSendCustomer } = context.state
  const { customer: { sendCustomerList, getCustomerList } } = context.props
  // 1.从下拉列表选择的客户使用currentSendCustomer，currentGetCustomer
  // 2.输入电话带出来的客户使用currentSendCustomer，currentGetCustomer
  let sendCustomer = currentSendCustomer
  let getCustomer = currentGetCustomer
  // 编辑时的客户，使用list中的数据，因为没有currentSendCustomer，currentGetCustomer
  sendCustomerList.forEach(item => {
    if (item.customer_id == fieldsValue.customer_name || item.customer_id == fieldsValue.customer_id) {
      sendCustomer = item
    }
  })
  getCustomerList.forEach(item => {
    if (item.customer_id == fieldsValue.customer_name || item.customer_id == fieldsValue.customer_id) {
      getCustomer = item
    }
  })

  if (getCustomer && getCustomer.customer_id) {
    fieldsValue.customer_id = Number(getCustomer.customer_id);
    delete fieldsValue.customer_name
  }
  else if (!fieldsValue.customer_name) {
    delete fieldsValue.customer_name
  }

  if (sendCustomer && sendCustomer.customer_id) {
    fieldsValue.customer_id = Number(sendCustomer.customer_id);
    delete fieldsValue.customer_name
  } else if (!fieldsValue.customer_name) {
    delete fieldsValue.customer_name
  }

  return fieldsValue
}



/**
 * 客户管理，将已经选择的客户信息转化为正确格式
 */
export async function setCourierFieldValue2Mng (context, fieldsValue = {}, type = 'search') {
  const { currentReceiver, currentSender } = context.state
  const { courier: { receiverList = [], senderList = [] } } = context.props
  // 1.从下拉列表选择的客户使用currentSendCustomer，currentGetCustomer
  // 2.输入电话带出来的客户使用currentSendCustomer，currentGetCustomer
  let sendCustomer = currentSender
  let receiveCustomer = currentReceiver
  // 编辑时的客户，使用list中的数据，因为没有currentSendCustomer，currentGetCustomer
  senderList.forEach(item => {
    if (item.courier_id == fieldsValue.sender_id) {
      sendCustomer = item
    }
  })
  receiverList.forEach(item => {
    if (item.courier_id == fieldsValue.receiver_id) {
      receiveCustomer = item
    }
  })

  if (sendCustomer && sendCustomer.courier_id) {
    fieldsValue.sender_id = sendCustomer.courier_id;
  }
  else {
    delete fieldsValue.sender_id
  }

  if (receiveCustomer && receiveCustomer.courier_id) {
    fieldsValue.receiver_id = receiveCustomer.courier_id;
  }
  else {
    delete fieldsValue.receiver_id
  }

  return fieldsValue
}

// 渲染autocomplete的option
// 废弃，页面通过import引用该函数使用会报错，所以逻辑写死在页面
export async function renderCustomerOption (item) {
  const AutoOption = AutoComplete.Option;
  return (
    <AutoOption key={`${item.customer_id}`} value={`${item.customer_id}`} customerid={`${item.customer_id}`} label={item.customer_name}>
      {item.customer_name}
    </AutoOption>
  );
};
