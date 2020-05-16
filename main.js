// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
function createWindow () {
  Menu.setApplicationMenu(null);
  // 创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({
    width: 1280, height: 1024, webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: true, // 不集成 Nodejs
      webSecurity: false,
      webviewTag: true,
      allowRunningInsecureContent: true
      // preload: path.join(__dirname, './public/renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    },
    icon: path.join(__dirname, './public/favicon.png')
  });

  // 本地资源
  // const startUrl = url.format({
  //   pathname: path.join(__dirname, './dist/index.html'),
  //   protocol: 'file:',
  //   slashes: true,
  // });
  // mainWindow.loadURL(startUrl);

  // dev 加载应用----适用于 react 项目
  // mainWindow.loadURL('http://118.190.100.113:8001');
  mainWindow.loadURL('http://127.0.0.1:8001');

  // 打开开发者工具，默认不打开
  // mainWindow.webContents.openDevTools();

  // 关闭window时触发下列事件.
  mainWindow.on('close', () => {
    mainWindow.webContents.session.clearStorageData({
      // appcache, cookies, filesystem, indexdb, local storage, shadercache, websql, serviceworkers
      storages: ['serviceworkers', 'filesystem', 'local storage'],
    });

    mainWindow.webContents.session.clearCache();

    mainWindow.destroy();
  });

  // 关闭window时触发下列事件.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  //在主线程下，通过ipcMain对象监听渲染线程传过来的getPrinterList事件
  ipcMain.on('getPrinterList', (event) => {
    //在主线程中获取打印机列表
    const list = mainWindow.webContents.getPrinters();
    //通过webContents发送事件到渲染线程，同时将打印机列表也传过去
    mainWindow.webContents.send('getPrinterList', list);
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', () => {
  if (mainWindow == null) {
    createWindow();
  }

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    const focusWin = BrowserWindow.getFocusedWindow();
    focusWin && focusWin.toggleDevTools();
  });
});

// 所有窗口关闭时退出应用.
app.on('window-all-closed', () => {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 你可以在这个脚本中续写或者使用require引入独立的js文件.
