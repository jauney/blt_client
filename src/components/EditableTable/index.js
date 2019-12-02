import React, { PureComponent, Fragment } from 'react';
import { Form, Popconfirm, Table, Button, Modal, Input, Radio } from 'antd';
import styles from './index.less';

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  onRadioChange = e => {
    console.log(e.target.value);
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      console.log(values);
      if (error && error[e.currentTarget.id]) {
        return;
      }
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    console.log(dataIndex);
    let cellJSX;
    if (dataIndex == 'mobile') {
      cellJSX = (
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator(dataIndex, {
            rules: [
              {
                required: true,
                message: `${title} is required.`,
              },
            ],
            initialValue: record[dataIndex],
          })(<Input onBlur={this.save} />)}
        </Form.Item>
      );
    } else {
      cellJSX = children;
    }

    return cellJSX;
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      form,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
      </td>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = props.dataSource || [];
    const selectedRowKeys = [];

    dataSource.forEach(item => {
      if (item.mobile_type == 1) {
        selectedRowKeys.push(item.mobile_id);
      }
    });
    this.state = {
      dataSource,
      count: dataSource.length,
      selectedRowKeys,
    };
    /**
     * {
     *  mobile_id: '',
     *  mobile: '',
     *  mobile_type: '' // 1: 默认
     * }
     */
    this.columns = [
      {
        title: '手机号',
        dataIndex: 'mobile',
        width: '65%',
        editable: true,
      },
      {
        title: '操作',
        dataIndex: 'mobile_id',
        render: (text, record) => {
          const { dataSource = [] } = this.state;
          return dataSource.length >= 1 ? (
            <Popconfirm title="确定删除?" onConfirm={() => this.handleDelete(record.mobile_id)}>
              <a>删除</a>
            </Popconfirm>
          ) : null;
        },
      },
    ];
  }

  notifyParantDataSource = dataSource => {
    const { notifyDataSource } = this.props;
    // 通知父组件更新的数据源
    if (typeof notifyDataSource == 'function') {
      notifyDataSource(dataSource);
    }
  };

  handleDelete = key => {
    let { dataSource = [], selectedRowKeys = [] } = this.state;

    dataSource = dataSource.filter(item => item.mobile_id !== key);

    let hasDefault = false;
    dataSource.forEach(item => {
      if (item.mobile_type == 1) {
        hasDefault = true;
      }
    });

    if (!hasDefault && dataSource.length > 0) {
      dataSource[0].mobile_type = 1;
      selectedRowKeys = [dataSource[0].mobile_id];
    }

    this.setState({ dataSource, selectedRowKeys });
    this.notifyParantDataSource(dataSource);
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const mobiles = dataSource.filter(item => {
      return !item.mobile;
    });

    if (mobiles.length > 0) {
      Modal.info({
        content: '请填写新添加的手机号',
      });
      return;
    }
    const newData = {
      mobile_id: `TMP-${new Date().getTime()}`,
      mobile: '',
      mobile_type: 0,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });

    this.notifyParantDataSource([...dataSource, newData]);
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.mobile_id === item.mobile_id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    this.setState({ dataSource: newData });
    this.notifyParantDataSource(newData);
  };

  updateMobileType = (selectedRowKeys = []) => {
    const { dataSource = [] } = this.state;
    dataSource.forEach(item => {
      if (selectedRowKeys.includes(item.mobile_id)) {
        item.mobile_type = 1;
      } else {
        item.mobile_type = 0;
      }
    });

    this.setState({ dataSource });
    this.notifyParantDataSource(dataSource);
  };

  rowRadioSelected = record => {
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      selectedRowKeys.push(record['mobile_id']);
    } else if (selectedRowKeys.indexOf(record['mobile_id']) === -1) {
      selectedRowKeys.splice(0, 1, record['mobile_id']);
    }
    this.updateMobileType(selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  onSelectedRowKeysChange = selectedRowKeys => {
    this.updateMobileType(selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  render() {
    const { dataSource, selectedRowKeys } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    const rowRadioSelection = {
      selectedRowKeys, //  选中行的key
      type: 'radio', // 类型 ： radio & checkbox
      onChange: this.onSelectedRowKeysChange,
      columnTitle: '默认',
    };
    return (
      <div>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          className={styles.dataTable}
          bordered
          dataSource={dataSource}
          columns={columns}
          rowKey="mobile_id"
          rowSelection={rowRadioSelection}
          footer={() => (
            <Button onClick={this.handleAdd} type="primary">
              添加
            </Button>
          )}
        />
      </div>
    );
  }
}

export default EditableTable;
