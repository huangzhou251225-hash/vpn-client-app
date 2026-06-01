# VPN Client

基于Clash的跨平台VPN客户端

## 功能特性

- [x] 单击查看节点详情
- [x] 双击切换节点
- [x] 自动选择最快节点
- [x] 智能分流（国内直连/国外代理）
- [x] 账户系统（邮箱验证+付费）
- [x] 3设备同时在线

## 技术架构

```
前端: Electron + React
核心: Clash (Go)
后端: Node.js + Express
数据库: SQLite
```

## 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 项目结构

```
vpn-client/
├── src/
│   ├── main/          # Electron主进程
│   ├── renderer/      # React前端
│   ├── clash/         # Clash核心集成
│   └── shared/        # 共享代码
├── assets/            # 静态资源
├── docs/              # 文档
└── scripts/           # 构建脚本
```

## 许可证

MIT
