# 反诈宣传平台

## 项目概述

反诈宣传平台是一个综合性的反电信网络诈骗宣传教育平台，集 AI 反诈骗助手、AI 情景模拟、反诈资讯发布、知识科普、互动交流、在线学习、风险测试、案件举报等功能于一体。

## 技术栈

### 前端
- Vue.js + Pinia + Vue Router
- Element UI 组件库
- WangEditor 富文本编辑器
- SSE (Server-Sent Events) 用于 AI 助手流式响应

### 后端
- Node.js + Express
- MySQL 数据库
- 通义千问 AI 大模型

## 项目结构

```
F:\a_fanzha\
├── fanzha_frontend/     # 前端项目
├── fanzha_backend/      # 后端项目
├── requirements.md      # 需求文档
└── CLAUDE.md           # 本文件
```

## 路由架构

采用路由前缀分离策略，用户端和管理端共享同一个 Vue 应用：

| 端 | 路由前缀 | 说明 |
|---|---|---|
| 用户端 | `/` | 面向普通用户的功能页面 |
| 管理端 | `/admin` | 面向管理员的后台管理页面 |

**注意**：登录/注册采用弹窗形式，不设独立路由。

## 数据库连接

项目配置了 MySQL MCP 服务器，配置文件：`.mcp.json`

- 主机：8.148.85.137:3306
- 数据库：fanzha_project
- 用户：Ruiui

## 开发规范

### 前端开发

使用 `frontend-design` skill 进行前端界面开发：
- 创建 Vue 组件、页面
- 实现响应式布局
- Element UI 组件使用

### 后端开发

使用 `nodejs-backend-patterns` skill 进行后端开发：
- Express 路由设计
- 中间件模式
- API 接口实现
- MySQL 数据库操作

### 子代理开发

使用 `subagent-driven-development` skill：
- 执行包含独立任务的实现计划
- 并行处理多个独立任务
- 提高开发效率

### 测试驱动开发

使用 `test-driven-development` skill：
- 在实现功能前先编写测试
- 确保代码质量和功能正确性

### 代码审查

使用 `requesting-code-review` skill：
- 完成任务或实现主要功能后进行代码审查
- 合并代码前验证工作是否符合要求

### Web 应用测试

使用 `webapp-testing` skill：
- 使用 Playwright 测试本地 Web 应用
- 验证前端功能
- 调试 UI 行为
- 截取浏览器截图

## 核心功能模块

### 用户端
1. 首页 - 轮播图、快捷入口、内容推荐
2. 反诈资讯 - 资讯列表、详情、搜索
3. 反诈知识库 - 知识分类、人群分类、详情
4. 反诈课堂 - 章节化学习、视频播放
5. 交流互动 - 帖子发布、列表、详情、评论
6. 活动中心 - 活动列表、详情、报名
7. 反诈自测 - 闯关答题
8. 诈骗举报 - 在线举报、状态跟踪
9. 个人中心 - 个人资料、帖子、活动、点赞、收藏、评论、举报
10. AI 反诈助手 - 智能问答、情景模拟

### 管理端
1. 管理员首页 - 数据统计、可视化
2. 用户管理
3. 管理员管理
4. 反诈资讯管理
5. 反诈知识库管理
6. 反诈课堂管理
7. 帖子管理
8. 分类管理
9. 活动管理
10. 活动报名管理
11. 反诈自测管理
12. 举报管理
13. 评论管理
14. 公告管理

## 数据库表

核心数据表：user, admin, antifraud, knowledge, chapter, lesson, blog, category, activity, activity_sign, quiz, question, user_quiz_record, report, comment, likes, collect, notice

## 性能优化

- 路由懒加载
- 图片懒加载
- 代码分割
- Gzip 压缩
- CDN 加速
- 缓存策略
- 首屏优化（骨架屏）
