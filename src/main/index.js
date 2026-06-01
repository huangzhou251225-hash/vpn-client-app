const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupIPC } = require('./clash');
const { setupUserIPC } = require('./user');

// 主窗口
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // 加载前端页面
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用启动
app.whenReady().then(() => {
  createWindow();
  
  // 设置IPC
  setupIPC();
  setupUserIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 应用退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信
ipcMain.handle('get-nodes', async () => {
  // 获取节点列表
  return [
    { name: '新加坡-1', ip: '43.156.20.12', port: 443, delay: 50 },
    { name: '新加坡-2', ip: '118.26.111.241', port: 443, delay: 60 },
    { name: '美国', ip: '103.234.62.100', port: 443, delay: 150 }
  ];
});

ipcMain.handle('switch-node', async (event, nodeName) => {
  // 切换节点
  console.log('切换到节点:', nodeName);
  return { success: true };
});

ipcMain.handle('test-delay', async (event, ip) => {
  // 测试延迟
  const start = Date.now();
  // 模拟延迟测试
  await new Promise(resolve => setTimeout(resolve, 100));
  return Date.now() - start;
});