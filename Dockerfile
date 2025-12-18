# Build stage
FROM node:18-alpine as builder
WORKDIR /app

# 使用淘宝镜像加速依赖安装
RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 设置默认后端地址环境变量
# 容器启动时可以通过 -e BACKEND_URL="http://your-backend-api" 覆盖
# 默认指向 host.docker.internal:5001 以方便本地开发调试
ENV BACKEND_URL="http://host.docker.internal:5001"

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置模板
# Nginx 官方镜像启动时会自动处理 /etc/nginx/templates/ 下的 .template 文件
# 将其中的环境变量替换后输出到 /etc/nginx/conf.d/ 目录下（去掉 .template 后缀）
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
