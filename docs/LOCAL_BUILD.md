# VPN Client 本地构建指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Git

## 构建步骤

### 1. 克隆代码
```bash
git clone https://github.com/huangzhou251225-hash/vpn-client-app.git
cd vpn-client-app
```

### 2. 安装依赖
```bash
npm install
```

### 3. 下载Clash核心
```bash
npm run download-clash
```

### 4. 构建各平台

**Mac:**
```bash
npm run build:mac
```

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

**所有平台:**
```bash
npm run build:all
```

## 构建产物

构建完成后，安装包在 `dist/` 目录：
- Mac: `dist/VPN Client-1.0.0.dmg`
- Windows: `dist/VPN Client Setup 1.0.0.exe`
- Linux: `dist/VPN Client-1.0.0.AppImage`

## 手动构建脚本

```bash
#!/bin/bash

# 安装依赖
npm install

# 下载Clash核心
npm run download-clash

# 构建所有平台
npm run build:all

echo "构建完成！安装包在 dist/ 目录"
```

## 注意事项

1. Mac构建需要Mac电脑或虚拟机
2. Windows构建需要Windows电脑或虚拟机
3. Linux构建可以在任何Linux系统上完成

## 跨平台构建

使用Docker进行跨平台构建：

```bash
# 构建Docker镜像
docker build -t vpn-client-builder .

# 运行构建
docker run -v $(pwd)/dist:/app/dist vpn-client-builder
```
