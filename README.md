# AI视频工场 - AI视频供需链交易平台

连接AI视频创作者与需求方的一站式交易平台。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TailwindCSS + TypeScript |
| 后端 | Nest.js + Prisma + PostgreSQL |
| 缓存 | Redis |
| 部署 | Docker + Docker Compose |

## 快速开始

### 1. 环境准备

- Node.js >= 18
- Docker & Docker Compose
- npm 或 yarn

### 2. 启动数据库

```bash
docker-compose up -d
```

### 3. 安装依赖

```bash
npm install
```

### 4. 初始化数据库

```bash
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:3001
- API 文档：http://localhost:3001/api/docs

## 项目结构

```
ai-video-marketplace/
├── frontend/              # Next.js 前端
│   ├── src/
│   │   ├── app/           # 页面路由
│   │   ├── components/    # 组件
│   │   ├── lib/           # 工具函数、API 客户端
│   │   ├── types/         # TypeScript 类型
│   │   └── styles/        # 样式
│   └── public/            # 静态资源
├── backend/               # Nest.js 后端
│   ├── src/
│   │   ├── auth/          # 认证模块
│   │   ├── user/          # 用户模块
│   │   ├── works/         # 作品模块
│   │   ├── order/         # 订单模块
│   │   ├── payment/       # 支付模块
│   │   ├── prisma/        # 数据库服务
│   │   └── common/        # 公共工具
│   └── prisma/
│       └── schema.prisma  # 数据库 Schema
├── docker-compose.yml     # Docker 配置
└── .env.example           # 环境变量模板
```

## API 接口

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | `POST /auth/send-code` | 发送验证码 |
| 认证 | `POST /auth/login` | 登录/注册 |
| 用户 | `GET /user/profile` | 获取个人信息 |
| 创作者 | `GET /creators` | 创作者列表 |
| 创作者 | `POST /creators/register` | 注册创作者 |
| 作品 | `GET /works` | 作品列表 |
| 作品 | `GET /works/:id` | 作品详情 |
| 作品 | `POST /works` | 发布作品 |
| 订单 | `GET /orders` | 订单列表 |
| 订单 | `POST /orders` | 发布需求 |
| 订单 | `POST /orders/:id/accept` | 接单 |
| 订单 | `POST /orders/:id/complete` | 验收完成 |
| 支付 | `POST /payment/create` | 创建支付 |

## 测试账号

| 角色 | 手机号 | 验证码 |
|------|--------|--------|
| 买家 | 13800000001 | 123456 |
| 创作者 | 13800000002 | 123456 |

## License

Private - All rights reserved.
