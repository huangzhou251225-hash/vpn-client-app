const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Clash核心管理
class ClashManager {
  constructor() {
    this.clashProcess = null;
    this.configPath = path.join(__dirname, '../../assets/clash-config.yaml');
  }

  // 启动Clash
  async start() {
    return new Promise((resolve, reject) => {
      const clashPath = this.getClashPath();
      
      this.clashProcess = exec(`${clashPath} -f ${this.configPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Clash启动失败:', error);
          reject(error);
        }
      });

      this.clashProcess.stdout.on('data', (data) => {
        console.log('Clash:', data.toString());
      });

      this.clashProcess.stderr.on('data', (data) => {
        console.error('Clash错误:', data.toString());
      });

      // 等待启动完成
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  // 停止Clash
  async stop() {
    if (this.clashProcess) {
      this.clashProcess.kill();
      this.clashProcess = null;
    }
  }

  // 重启Clash
  async restart() {
    await this.stop();
    await this.start();
  }

  // 获取Clash路径
  getClashPath() {
    const platform = process.platform;
    const arch = process.arch;
    
    const paths = {
      win32: {
        x64: 'clash-windows-amd64.exe',
        ia32: 'clash-windows-386.exe'
      },
      darwin: {
        x64: 'clash-darwin-amd64',
        arm64: 'clash-darwin-arm64'
      },
      linux: {
        x64: 'clash-linux-amd64',
        arm64: 'clash-linux-arm64'
      }
    };

    const binaryName = paths[platform]?.[arch] || 'clash';
    return path.join(__dirname, '../../assets', binaryName);
  }

  // 更新配置
  async updateConfig(config) {
    const yaml = require('js-yaml');
    const configStr = yaml.dump(config);
    fs.writeFileSync(this.configPath, configStr);
    await this.restart();
  }
}

// 延迟测试
async function testDelay(host, port = 443) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      const delay = Date.now() - start;
      socket.destroy();
      resolve(delay);
    });
    
    socket.on('error', (err) => {
      reject(err);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('连接超时'));
    });
    
    socket.connect(port, host);
  });
}

// IPC处理
function setupIPC() {
  const clashManager = new ClashManager();

  // 启动Clash
  ipcMain.handle('clash-start', async () => {
    try {
      await clashManager.start();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 停止Clash
  ipcMain.handle('clash-stop', async () => {
    try {
      await clashManager.stop();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 测试延迟
  ipcMain.handle('test-delay', async (event, { host, port }) => {
    try {
      const delay = await testDelay(host, port);
      return { success: true, delay };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 获取配置
  ipcMain.handle('get-config', async () => {
    try {
      const config = fs.readFileSync(clashManager.configPath, 'utf8');
      return { success: true, config };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 保存配置
  ipcMain.handle('save-config', async (event, config) => {
    try {
      await clashManager.updateConfig(config);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupIPC, ClashManager, testDelay };