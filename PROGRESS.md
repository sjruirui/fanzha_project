# 项目开发进度文档

## 项目概述

反诈宣传平台是一个综合性的反电信网络诈骗宣传教育平台，集 AI 反诈骗助手、AI 情景模拟、反诈资讯发布、知识科普、互动交流、在线学习、风险测试、案件举报等功能于一体。

## 技术栈

### 前端
- Vue 3.5.32 + TypeScript
- Pinia 3.0.4 (状态管理)
- Vue Router 5.0.4 (路由)
- Element Plus (UI组件库)
- Vite 8.0.8 (构建工具)
- Axios (HTTP请求)
- Day.js (日期处理)

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 认证
- Multer 文件上传
- 通义千问 AI 大模型

## 已完成功能

### 一、数据库设计 (2024-05-10)

根据 `require/03_database_design.md` 完成了数据库建表，共创建 21 张数据表：

| 表名 | 说明 |
|------|------|
| user | 用户表 |
| admin | 管理员表 |
| banner | 轮播图表 |
| antifraud | 反诈资讯表 |
| knowledge | 反诈知识表 |
| chapter | 课堂章节表 |
| lesson | 课时表 |
| blog | 帖子表 |
| category | 分类表 |
| activity | 活动表 |
| activity_sign | 活动报名表 |
| quiz | 自测关卡表 |
| question | 题目表 |
| user_quiz_record | 答题记录表 |
| report | 举报表 |
| comment | 评论表 |
| likes | 点赞表 |
| collect | 收藏表 |
| notice | 公告表 |
| ai_session | AI会话表 |
| ai_message | AI消息表 |

数据库迁移文件：`database/migrations/001_init_schema.sql`

### 二、后端 API 实现 (2024-05-10)

根据 `require/04_api_design.md` 完成了后端 API 实现：

#### 项目结构
```
backend/
├── src/
│   ├── app.js                 # 应用入口
│   ├── config/index.js        # 配置文件
│   ├── models/                # 数据模型 (14个)
│   │   ├── db.js              # 数据库连接
│   │   ├── user.model.js
│   │   ├── admin.model.js
│   │   └── ...
│   ├── middleware/            # 中间件
│   │   ├── auth.middleware.js # JWT认证
│   │   ├── error.middleware.js # 错误处理
│   │   └── logger.middleware.js # 日志
│   └── routes/                # 路由
│       ├── user/              # 用户端路由 (13个模块)
│       ├── admin/             # 管理端路由 (16个模块)
│       └── upload/            # 文件上传
└── package.json
```

#### API 模块

**用户端 API：**
1. 认证模块 - 登录、注册、获取用户信息
2. 首页模块 - 轮播图、推荐内容
3. 反诈资讯模块 - 列表、详情、相关资讯
4. 反诈知识库模块 - 列表、详情、相关知识
5. 反诈课堂模块 - 章节、课时
6. 交流互动模块 - 帖子CRUD、分类
7. 活动中心模块 - 活动、报名
8. 反诈自测模块 - 关卡、题目、答题
9. 诈骗举报模块 - 提交、历史
10. 个人中心模块 - 资料、帖子、活动、点赞、收藏、评论、举报
11. 点赞/收藏模块 - 点赞、收藏、状态检查
12. 评论模块 - 评论CRUD
13. AI助手模块 - 会话、聊天(SSE流式响应)

**管理端 API：**
1. 管理员认证
2. 数据统计
3. 用户管理
4. 管理员管理
5. 反诈资讯管理
6. 反诈知识库管理
7. 反诈课堂管理
8. 帖子管理
9. 分类管理
10. 活动管理
11. 活动报名管理
12. 反诈自测管理
13. 举报管理
14. 评论管理
15. 公告管理
16. 轮播图管理

**文件上传 API：**
- 图片上传 `/api/upload/image`
- 视频上传 `/api/upload/video`
- 文件上传 `/api/upload/file`

### 三、前端实现 (2024-05-10)

根据 `require/05_route_design.md` 和 `require/01_user_requirements.md` 完成了前端实现：

#### 项目结构
```
frontend/
├── src/
│   ├── api/                   # API服务层
│   │   ├── request.ts         # Axios实例
│   │   ├── upload.ts          # 上传API
│   │   └── user/              # 用户API模块 (13个)
│   ├── assets/styles/         # 全局样式
│   ├── components/
│   │   ├── common/            # 公共组件
│   │   │   ├── LoginModal.vue # 登录/注册弹窗
│   │   │   └── AiAssistant.vue # AI助手悬浮球
│   │   └── layout/            # 布局组件
│   │       └── UserLayout.vue # 用户端布局
│   ├── router/index.ts        # 路由配置
│   ├── stores/                # Pinia状态管理
│   │   ├── user.ts            # 用户状态
│   │   └── app.ts             # 应用状态
│   ├── types/index.ts         # TypeScript类型定义
│   └── views/
│       ├── user/              # 用户端页面 (20个)
│       └── admin/             # 管理端页面 (占位)
└── vite.config.ts             # Vite配置
```

#### 用户端页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Home.vue | 首页 - 轮播图、快捷入口、推荐资讯 |
| `/news` | News.vue | 反诈资讯列表 - 分类筛选、搜索 |
| `/news/:id` | NewsDetail.vue | 资讯详情 - 内容、标签、相关资讯 |
| `/knowledge` | Knowledge.vue | 知识库列表 - 分类、人群筛选 |
| `/knowledge/:id` | KnowledgeDetail.vue | 知识详情 |
| `/classroom` | Classroom.vue | 反诈课堂 - 章节列表 |
| `/classroom/chapter/:id` | ChapterDetail.vue | 章节课时列表 |
| `/classroom/lesson/:id` | LessonDetail.vue | 视频播放页 |
| `/community` | Community.vue | 交流互动 - 帖子列表 |
| `/community/create` | CommunityCreate.vue | 发布帖子 |
| `/community/:id` | CommunityDetail.vue | 帖子详情 - 评论互动 |
| `/activity` | Activity.vue | 活动中心 - 活动列表 |
| `/activity/:id` | ActivityDetail.vue | 活动详情 - 报名功能 |
| `/quiz` | Quiz.vue | 反诈自测 - 关卡列表 |
| `/quiz/:id` | QuizDetail.vue | 答题页面 |
| `/report` | Report.vue | 诈骗举报 - 提交表单 |
| `/report/history` | ReportHistory.vue | 举报历史 |
| `/profile` | Profile.vue | 个人中心 - 布局 |
| `/profile` | ProfileInfo.vue | 个人资料 - 修改信息、密码 |
| `/profile/posts` | ProfilePosts.vue | 我的帖子 |
| `/profile/activities` | ProfileActivities.vue | 我的活动 |
| `/profile/likes` | ProfileLikes.vue | 我的点赞 |
| `/profile/collects` | ProfileCollects.vue | 我的收藏 |
| `/profile/comments` | ProfileComments.vue | 我的评论 |
| `/profile/reports` | ProfileReports.vue | 我的举报 |

#### 核心功能特性

1. **登录/注册弹窗**
   - 弹窗形式，不使用独立页面
   - 支持登录/注册切换
   - 表单验证

2. **AI反诈助手**
   - 右下角悬浮球入口
   - 智能问答模式
   - 情景模拟模式（冒充公检法、刷单返利、杀猪盘、虚假网贷）
   - SSE流式响应
   - 会话历史管理

3. **路由守卫**
   - 需登录页面自动弹出登录弹窗
   - 管理端独立登录页

4. **响应式设计**
   - 支持桌面、平板、手机

## 运行说明

### 环境要求
- Node.js >= 20.19.0
- MySQL 8.0+

### 启动后端
```bash
cd backend
npm install
node src/app.js
```
后端运行在 `http://localhost:3000`

### 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在 `http://localhost:5173`

### 默认管理员账号
- 用户名：`admin`
- 密码：`admin123`

## 待完成功能

### 管理端页面
管理端页面目前仅创建了占位文件，需要完整实现：
- 管理员首页（数据统计可视化）
- 用户管理
- 管理员管理
- 反诈资讯管理
- 反诈知识库管理
- 反诈课堂管理
- 帖子管理
- 分类管理
- 活动管理
- 活动报名管理
- 反诈自测管理
- 举报管理
- 评论管理
- 公告管理
- 轮播图管理

### 其他待优化
1. 富文本编辑器集成（WangEditor）
2. 图片懒加载
3. 骨架屏加载效果
4. 性能优化（代码分割、CDN）
5. 单元测试
6. E2E测试

## 文件清单

### 后端文件 (34个)
```
backend/
├── package.json
├── src/
│   ├── app.js
│   ├── config/index.js
│   ├── models/
│   │   ├── db.js
│   │   ├── user.model.js
│   │   ├── admin.model.js
│   │   ├── banner.model.js
│   │   ├── antifraud.model.js
│   │   ├── knowledge.model.js
│   │   ├── chapter.model.js
│   │   ├── lesson.model.js
│   │   ├── blog.model.js
│   │   ├── category.model.js
│   │   ├── activity.model.js
│   │   ├── activity_sign.model.js
│   │   ├── quiz.model.js
│   │   ├── question.model.js
│   │   └── report.model.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── logger.middleware.js
│   └── routes/
│       ├── user/
│       │   ├── index.js
│       │   ├── auth.routes.js
│       │   ├── home.routes.js
│       │   ├── news.routes.js
│       │   ├── knowledge.routes.js
│       │   ├── classroom.routes.js
│       │   ├── community.routes.js
│       │   ├── activity.routes.js
│       │   ├── quiz.routes.js
│       │   ├── report.routes.js
│       │   ├── profile.routes.js
│       │   ├── interact.routes.js
│       │   ├── comment.routes.js
│       │   └── ai.routes.js
│       ├── admin/
│       │   ├── index.js
│       │   └── ... (16个路由模块)
│       └── upload/index.js
```

### 前端文件 (50+个)
```
frontend/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── api/
│   │   ├── request.ts
│   │   ├── upload.ts
│   │   └── user/ (13个API模块)
│   ├── assets/styles/main.css
│   ├── components/
│   │   ├── layout/UserLayout.vue
│   │   └── common/
│   │       ├── LoginModal.vue
│   │       └── AiAssistant.vue
│   ├── router/index.ts
│   ├── stores/
│   │   ├── user.ts
│   │   └── app.ts
│   ├── types/index.ts
│   └── views/
│       ├── NotFound.vue
│       ├── user/ (20个页面)
│       └── admin/ (4个占位页面)
```

## 更新日志

### 2024-05-10
- 完成数据库建表（21张表）
- 完成后端API实现（用户端13个模块 + 管理端16个模块）
- 完成前端路由配置
- 完成用户端页面实现（20个页面）
- 完成登录/注册弹窗组件
- 完成AI反诈助手组件
- 配置Vite代理

---

*文档生成时间：2024-05-10*
