import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import styles from './index.less';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      needTotalList,
    };
    if (typeof this.props.onRef == 'function') {
      this.props.onRef(this)
    }
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, selectedRows });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  selectRow = record => {
    const { rowKey, onSelectRow } = this.props;
    const selectedRowKeys = [...this.state.selectedRowKeys];
    const selectedRows = [...this.state.selectedRows];

    let checkedRecord;
    let checkedIndex;
    selectedRows.forEach((item, index) => {
      if (item[rowKey] == record[rowKey]) {
        checkedRecord = item;
        checkedIndex = index;
      }
    });

    if (checkedRecord) {
      selectedRowKeys.splice(checkedIndex, 1);
      selectedRows.splice(checkedIndex, 1);
    } else {
      selectedRowKeys.push(record[rowKey]);
      selectedRows.push(record);
    }
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }
    this.setState({ selectedRowKeys, selectedRows });
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const {
      data = {},
      rowKey,
      rowClassNameHandler,
      onClickHander,
      onDoubleClickHander,
      ...rest
    } = this.props;
    const { list = [], pagination } = data;
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ["20", "40", "60"],
      ...pagination,
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      // getCheckboxProps: record => ({
      //   disabled: record.disabled,
      // }),
    };

    const tableHeight = window.innerHeight - 360
    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        <Table
          rowKey={rowKey || 'order_id'}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          rowClassName={(record, index) => {
            if (typeof rowClassNameHandler == 'function') {
              return rowClassNameHandler(record, index);
            }

            let selectedFlag = false;
            selectedRowKeys.forEach(key => {
              if (record[rowKey] == key) {
                selectedFlag = true;
              }
            });

            if (selectedFlag) {
              return styles.selectedColor;
            }

            return '';
          }}
          onRow={(record, rowIndex) => ({
            onClick: event => {
              this.selectRow(record);
              if (typeof onClickHander == 'function') {
                onClickHander(record, rowIndex, event);
              }
            },
            onDoubleClick: event => {
              if (typeof onDoubleClickHander == 'function') {
                onDoubleClickHander(record, rowIndex, event);
              }
            },
          })}
          scroll={{ x: 900, y: tableHeight }}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
