const { ipcMain } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 用户数据存储
const userDataPath = path.join(__dirname, '../../data');
const usersFile = path.join(userDataPath, 'users.json');

// 确保数据目录存在
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// 用户管理
class UserManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = null;
  }

  // 加载用户数据
  loadUsers() {
    try {
      if (fs.existsSync(usersFile)) {
        return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
    return {};
  }

  // 保存用户数据
  saveUsers() {
    try {
      fs.writeFileSync(usersFile, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }

  // 生成用户ID
  generateUserId() {
    return crypto.randomUUID();
  }

  // 生成验证码
  generateVerificationCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 哈希密码
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // 注册用户
  async register(email, password, deviceId) {
    if (this.users[email]) {
      throw new Error('用户已存在');
    }

    const userId = this.generateUserId();
    const verificationCode = this.generateVerificationCode();

    this.users[email] = {
      id: userId,
      email,
      password: this.hashPassword(password),
      deviceId,
      verificationCode,
      verified: false,
      subscription: {
        type: 'free',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1天免费试用
        devices: [deviceId]
      },
      createdAt: new Date().toISOString()
    };

    this.saveUsers();
    
    // TODO: 发送验证邮件
    console.log('验证码:', verificationCode);

    return { userId, verificationCode };
  }

  // 验证邮箱
  async verifyEmail(email, code) {
    const user = this.users[email];
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.verificationCode !== code) {
      throw new Error('验证码错误');
    }

    user.verified = true;
    this.saveUsers();

    return { success: true };
  }

  // 登录
  async login(email, password, deviceId) {
    const user = this.users[email];
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('密码错误');
    }

    if (!user.verified) {
      throw new Error('邮箱未验证');
    }

    // 检查设备数量
    if (user.subscription.devices.length >= 3 && !user.subscription.devices.includes(deviceId)) {
      throw new Error('设备数量已达上限（3台）');
    }

    // 添加设备
    if (!user.subscription.devices.includes(deviceId)) {
      user.subscription.devices.push(deviceId);
      this.saveUsers();
    }

    this.currentUser = user;
    return { success: true, user: this.getUserInfo(user) };
  }

  // 获取用户信息
  getUserInfo(user) {
    return {
      id: user.id,
      email: user.email,
      verified: user.verified,
      subscription: {
        type: user.subscription.type,
        endDate: user.subscription.endDate,
        devices: user.subscription.devices.length
      }
    };
  }

  // 检查订阅状态
  checkSubscription(userId) {
    const user = Object.values(this.users).find(u => u.id === userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const now = new Date();
    const endDate = new Date(user.subscription.endDate);

    if (now > endDate) {
      // 订阅已过期
      if (user.subscription.type === 'free') {
        throw new Error('免费试用已过期，请购买订阅');
      } else {
        throw new Error('订阅已过期，请续费');
      }
    }

    return {
      valid: true,
      type: user.subscription.type,
      daysLeft: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    };
  }

  // 购买订阅
  async purchaseSubscription(email, type, duration) {
    const user = this.users[email];
    if (!user) {
      throw new Error('用户不存在');
    }

    const now = new Date();
    let endDate;

    switch (duration) {
      case '1month':
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new Error('无效的订阅时长');
    }

    user.subscription = {
      type,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      devices: user.subscription.devices
    };

    this.saveUsers();
    return { success: true, endDate: endDate.toISOString() };
  }

  // 登出
  async logout() {
    this.currentUser = null;
    return { success: true };
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser ? this.getUserInfo(this.currentUser) : null;
  }
}

// IPC处理
function setupUserIPC() {
  const userManager = new UserManager();

  // 注册
  ipcMain.handle('register', async (event, { email, password, deviceId }) => {
    try {
      const result = await userManager.register(email, password, deviceId);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 验证邮箱
  ipcMain.handle('verify-email', async (event, { email, code }) => {
    try {
      const result = await userManager.verifyEmail(email, code);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 登录
  ipcMain.handle('login', async (event, { email, password, deviceId }) => {
    try {
      const result = await userManager.login(email, password, deviceId);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 检查订阅
  ipcMain.handle('check-subscription', async (event, { userId }) => {
    try {
      const result = userManager.checkSubscription(userId);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 购买订阅
  ipcMain.handle('purchase-subscription', async (event, { email, type, duration }) => {
    try {
      const result = await userManager.purchaseSubscription(email, type, duration);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 登出
  ipcMain.handle('logout', async () => {
    try {
      const result = await userManager.logout();
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 获取当前用户
  ipcMain.handle('get-current-user', async () => {
    const user = userManager.getCurrentUser();
    return { success: true, user };
  });
}

module.exports = { setupUserIPC, UserManager };