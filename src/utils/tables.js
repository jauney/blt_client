const mixinTableProps = {
  selectRow: record => {
    const selectedRowKeys = [...this.state.selectedRowKeys];
    if (selectedRowKeys.indexOf(record.key) >= 0) {
      selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
    } else {
      selectedRowKeys.push(record.key);
    }
    this.setState({ selectedRowKeys });
  },
  onSelectedRowKeysChange: selectedRowKeys => {
    this.setState({ selectedRowKeys });
  },
};

export default mixinTableProps;
