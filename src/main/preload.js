const { contextBridge, ipcRenderer } = require('electron');

// 暴露API给前端
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取节点列表
  getNodes: () => ipcRenderer.invoke('get-nodes'),
  
  // 切换节点
  switchNode: (nodeName) => ipcRenderer.invoke('switch-node', nodeName),
  
  // 测试延迟
  testDelay: (ip) => ipcRenderer.invoke('test-delay', ip),
  
  // 获取配置
  getConfig: () => ipcRenderer.invoke('get-config'),
  
  // 保存配置
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // 登录
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  
  // 注册
  register: (userInfo) => ipcRenderer.invoke('register', userInfo),
  
  // 获取用户信息
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),
  
  // 检查更新
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  
  // 下载更新
  downloadUpdate: () => ipcRenderer.invoke('download-update')
});