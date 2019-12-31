import getLodop from './LodopFuncs';

export function print({ width = '80mm', height = '200mm', html = '' }) {
  console.log(getLodop)
  let LODOP = getLodop();
  LODOP.PRINT_INIT("托运单");
  LODOP.SET_PRINT_PAGESIZE(1, width, height, '')
  //LODOP.SET_PRINT_STYLE("FontSize", 18);
  //LODOP.SET_PRINT_STYLE("Bold", 1);
  // LODOP.ADD_PRINT_TEXT(50, 231, 500, 39, "打印页面部分内容");
  LODOP.ADD_PRINT_HTM(0, 0, width, height, html);
  //参数按顺序分别为，上下间距，左右间距，宽度，高度
  LODOP.PRINT();
}
