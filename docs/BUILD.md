# VPN Client 构建指南

## 支持平台

| 平台 | 构建目标 | 说明 |
|------|---------|------|
| Mac | .dmg | Intel + Apple Silicon |
| Windows | .exe | x64 + x86 |
| Linux | .AppImage | x64 |
| iOS | 需单独开发 | 使用React Native或Swift |
| Android | 需单独开发 | 使用React Native或Kotlin |

## 构建步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 下载Clash核心
```bash
npm run download-clash
```

### 3. 构建各平台

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

## 自动构建

GitHub Actions会自动构建所有平台，构建产物在Release页面下载。

## 安装包位置

构建完成后，安装包在 `dist/` 目录：
- Mac: `dist/VPN Client-1.0.0.dmg`
- Windows: `dist/VPN Client Setup 1.0.0.exe`
- Linux: `dist/VPN Client-1.0.0.AppImage`

## iOS/Android开发

如需移动端支持，需要：
1. 使用React Native重写
2. 或使用Capacitor打包Web应用
3. 单独开发原生应用

## 发布流程

1. 更新版本号
2. 提交代码
3. 打标签：`git tag v1.0.0`
4. 推送标签：`git push origin v1.0.0`
5. GitHub Actions自动构建并发布
