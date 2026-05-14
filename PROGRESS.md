# 项目开发进度文档

## 项目概述

反诈宣传平台是一个综合性的反电信网络诈骗宣传教育平台，集 AI 反诈骗助手、AI 情景模拟、反诈资讯发布、知识科普、互动交流、在线学习、风险测试、案件举报等功能于一体。

## 技术栈

### 前端
- Vue 3.5.32 + TypeScript
- Pinia 3.0.4 (状态管理)
- Vue Router 5.0.4 (路由)
- Element Plus (UI组件库)
- WangEditor (富文本编辑器)
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

### 二、后端 API 实现 (2024-05-10)

根据 `require/04_api_design.md` 完成了后端 API 实现：

#### 用户端 API (13个模块)
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

#### 管理端 API (16个模块)
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

#### 文件上传 API
- 图片上传 `/api/upload/image`
- 视频上传 `/api/upload/video`
- 文件上传 `/api/upload/file`

### 三、前端用户端实现 (2024-05-10)

根据 `require/05_route_design.md` 和 `require/01_user_requirements.md` 完成了前端用户端实现：

#### 用户端页面 (26个)

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

### 四、前端管理端实现 (2024-05-12)

根据 `require/02_admin_requirements.md` 完成了前端管理端实现：

#### 管理端页面 (16个)

| 路由 | 页面 | 说明 |
|------|------|------|
| `/admin/login` | AdminLogin.vue | 管理员登录页 |
| `/admin` | AdminHome.vue | 管理首页 - 数据统计卡片、快捷操作 |
| `/admin/users` | AdminUsers.vue | 用户管理 - 列表、搜索、禁用 |
| `/admin/admins` | AdminAdmins.vue | 管理员管理 - CRUD |
| `/admin/news` | AdminNews.vue | 反诈资讯管理 - CRUD、富文本编辑 |
| `/admin/knowledge` | AdminKnowledge.vue | 知识库管理 - CRUD、富文本编辑 |
| `/admin/classroom` | AdminClassroom.vue | 课堂管理 - 章节/课时双面板 |
| `/admin/posts` | AdminPosts.vue | 帖子管理 - 列表、审核、删除 |
| `/admin/categories` | AdminCategories.vue | 分类管理 - CRUD |
| `/admin/activities` | AdminActivities.vue | 活动管理 - CRUD、富文本编辑 |
| `/admin/signups` | AdminSignups.vue | 报名管理 - 列表、导出 |
| `/admin/quiz` | AdminQuiz.vue | 自测管理 - 关卡/题目双面板 |
| `/admin/reports` | AdminReports.vue | 举报管理 - 列表、详情、处理 |
| `/admin/comments` | AdminComments.vue | 评论管理 - 列表、删除 |
| `/admin/notices` | AdminNotices.vue | 公告管理 - CRUD |

#### 管理端核心功能

1. **独立登录系统**
   - 独立的登录页面 `/admin/login`
   - Token 存储在 localStorage 的 `adminToken` 字段
   - 路由守卫保护管理端页面

2. **管理端布局** (AdminLayout.vue)
   - 深色渐变侧边栏
   - 可折叠菜单
   - 顶部显示管理员信息
   - 退出登录功能

3. **数据统计首页**
   - 统计卡片（用户数、资讯数、活动数、举报数）
   - 快捷操作入口

4. **富文本编辑**
   - 资讯、知识、活动管理使用 WangEditor
   - 支持图片上传

5. **双面板管理**
   - 课堂管理：左侧章节列表，右侧课时列表
   - 自测管理：左侧关卡列表，右侧题目列表

### 五、Bug 修复 (2024-05-12)

修复了以下问题：

1. **用户登录状态问题**
   - 问题：登录后页面仍显示"登录"按钮，需刷新才显示头像
   - 原因：后端返回 `user_info` 字段，前端期望 `userInfo`
   - 修复：统一使用 `user_info` 字段名

2. **用户信息丢失问题**
   - 问题：退出后再次登录，用户基本信息丢失
   - 原因：同上，字段名不匹配
   - 修复：修改 `user.ts` store 中的字段处理

3. **个人资料刷新丢失**
   - 问题：`/profile` 页面刷新后基本信息丢失
   - 原因：Pinia store 初始化时 userInfo 为 null
   - 修复：在 `ProfileInfo.vue` 的 onMounted 中检查并获取用户信息

4. **举报证据链接 404**
   - 问题：点击查看证据跳转到错误 URL
   - 原因：evidence 字段为 JSON 字符串，未正确解析
   - 修复：添加 `parseEvidence` 和 `getEvidenceUrl` 函数处理

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

### AI 助手功能
- AI 反诈助手组件已创建，但功能待完善
- 智能问答模式
- 情景模拟模式

### 待优化项
1. 图片懒加载
2. 骨架屏加载效果
3. 性能优化（代码分割、CDN）
4. 单元测试
5. E2E测试

## 文件清单

### 后端文件
```
backend/
├── package.json
├── src/
│   ├── app.js
│   ├── config/index.js
│   ├── models/ (14个数据模型)
│   ├── middleware/ (认证、错误处理、日志)
│   └── routes/
│       ├── user/ (13个路由模块)
│       ├── admin/ (16个路由模块)
│       └── upload/
└── tests/
```

### 前端文件
```
frontend/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── api/
│   │   ├── request.ts
│   │   ├── adminRequest.ts
│   │   ├── upload.ts
│   │   ├── user/ (13个API模块)
│   │   └── admin/ (13个API模块)
│   ├── assets/styles/main.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── UserLayout.vue
│   │   │   └── AdminLayout.vue
│   │   └── common/
│   │       ├── LoginModal.vue
│   │       └── AiAssistant.vue
│   ├── router/index.ts
│   ├── stores/
│   │   ├── user.ts
│   │   ├── admin.ts
│   │   └── app.ts
│   ├── types/index.ts
│   └── views/
│       ├── NotFound.vue
│       ├── user/ (26个页面)
│       └── admin/ (16个页面)
```

## 更新日志

### 2024-05-12
- 完成管理端前端实现（16个页面）
- 创建管理端 API 模块（13个）
- 创建管理端 Pinia store
- 配置管理端路由和路由守卫
- 集成 WangEditor 富文本编辑器
- 修复用户登录状态显示问题
- 修复个人资料刷新丢失问题
- 修复举报证据链接 404 问题

### 2024-05-10
- 完成数据库建表（21张表）
- 完成后端API实现（用户端13个模块 + 管理端16个模块）
- 完成前端路由配置
- 完成用户端页面实现（26个页面）
- 完成登录/注册弹窗组件
- 完成AI反诈助手组件（基础框架）
- 配置Vite代理

---

*文档更新时间：2024-05-12*
