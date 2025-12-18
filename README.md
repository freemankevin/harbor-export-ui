# Harbor Export 前端（React + Vite）

用于实施人员便捷地浏览并下载 Harbor 镜像，支持配置 Harbor 连接与查看系统/日志。

## 启动步骤

1. 安装依赖

```bash
npm install
```

2. 开发启动

```bash
npm run dev
```

访问 `http://localhost:5173`（端口以实际为准）。`/api` 请求已代理到后端 `http://localhost:5001`。

可通过环境变量 `VITE_API_TARGET` 修改开发环境后端地址：

```bash
# Windows (PowerShell)
$env:VITE_API_TARGET="http://192.168.1.100:5001"; npm run dev

# Linux/Mac
VITE_API_TARGET=http://192.168.1.100:5001 npm run dev
```

## Docker 部署

项目支持构建 Docker 镜像，并通过环境变量配置后端 API 地址。

1. 构建镜像

```bash
docker build -t harbor-export-ui .
```

2. 启动容器

通过 `BACKEND_URL` 环境变量指定后端 API 地址：

```bash
# 后端在宿主机 (Windows/Mac 使用 host.docker.internal)
docker run -d -p 8080:80 -e BACKEND_URL="http://host.docker.internal:5001" harbor-export-ui

# 后端在其他服务器
docker run -d -p 8080:80 -e BACKEND_URL="http://192.168.1.100:5001" harbor-export-ui
```

## 功能

- 设置页：保存 Harbor 地址、账户信息并测试连接
- 浏览镜像：按项目列出仓库与标签，支持搜索入口
- 下载中心：选择镜像与标签并下载，记录历史
- 系统页：健康检查、系统信息、查看后端滚动日志

## 注意

- 请先启动后端服务，再运行前端以完成联调
- 前端不会在日志或持久化中保存明文密码至远端，仅本地 `localStorage` 保存配置信息（可随时清除）
