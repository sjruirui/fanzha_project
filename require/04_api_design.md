# RESTful API 设计

## API 基础信息

- **基础路径**: `/api`
- **用户端路径**: `/api/user`
- **管理端路径**: `/api/admin`
- **认证方式**: JWT Token
- **响应格式**: JSON

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 用户端 API

### 1. 认证模块

#### 用户登录
- **POST** `/api/user/auth/login`
- **请求体**: `{ username, password }`
- **响应**: `{ token, user_info }`

#### 用户注册
- **POST** `/api/user/auth/register`
- **请求体**: `{ username, phone, password }`
- **响应**: `{ token, user_info }`

#### 获取用户信息
- **GET** `/api/user/auth/info`
- **请求头**: `Authorization: Bearer <token>`
- **响应**: `{ user_info }`

#### 退出登录
- **POST** `/api/user/auth/logout`
- **响应**: `{ success }`

### 2. 首页模块

#### 获取轮播图
- **GET** `/api/user/home/banners`
- **响应**: `{ banners[] }`

#### 获取推荐内容
- **GET** `/api/user/home/recommend`
- **响应**: `{ news[], knowledge[], activities[] }`

### 3. 反诈资讯模块

#### 获取资讯列表
- **GET** `/api/user/news`
- **参数**: `page, pageSize, type, keyword`
- **响应**: `{ list[], total, page, pageSize }`

#### 获取资讯详情
- **GET** `/api/user/news/:id`
- **响应**: `{ id, title, summary, cover, content, type, tags, author, views, status, createdAt, publishedAt }`

#### 获取相关资讯
- **GET** `/api/user/news/:id/related`
- **响应**: `[{ id, title, summary, cover, type, views, createdAt }]`

### 4. 反诈知识库模块

#### 获取知识列表
- **GET** `/api/user/knowledge`
- **参数**: `page, pageSize, type, targetGroup, keyword`
- **响应**: `{ list[], total, page, pageSize }`

#### 获取知识详情
- **GET** `/api/user/knowledge/:id`
- **响应**: `{ id, title, summary, cover, content, type, targetGroup, tags, views, status, createdAt }`

#### 获取相关知识
- **GET** `/api/user/knowledge/:id/related`
- **响应**: `[{ id, title, summary, cover, type, targetGroup, views, createdAt }]`

### 5. 反诈课堂模块

#### 获取章节列表
- **GET** `/api/user/classroom/chapters`
- **响应**: `{ chapters: [{ id, title, summary, cover, sortOrder, status, lessonCount, createdAt }] }`

#### 获取章节课时列表
- **GET** `/api/user/classroom/chapters/:id/lessons`
- **响应**: `{ lessons: [{ id, chapterId, title, summary, cover, videoUrl, duration, sortOrder, views, createdAt }], chapter }`

#### 获取课时详情
- **GET** `/api/user/classroom/lessons/:id`
- **响应**: `{ id, chapterId, title, summary, cover, videoUrl, duration, sortOrder, views, createdAt }`

### 6. 交流互动模块

#### 获取帖子分类
- **GET** `/api/user/community/categories`
- **响应**: `{ categories[] }`

#### 获取帖子列表
- **GET** `/api/user/community/posts`
- **参数**: `page, pageSize, categoryId, keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, tags, views, likes, comments, collects, status, createdAt, categoryName, author: { nickname, avatar }`

#### 获取帖子详情
- **GET** `/api/user/community/posts/:id`
- **响应**: `{ post_detail }`

#### 发布帖子
- **POST** `/api/user/community/posts`
- **请求体**: `{ categoryId, title, summary, cover, content, tags }`
- **响应**: `{ post_id }`

#### 编辑帖子
- **PUT** `/api/user/community/posts/:id`
- **请求体**: `{ categoryId, title, summary, cover, content, tags }`
- **响应**: `{ success }`

#### 删除帖子
- **DELETE** `/api/user/community/posts/:id`
- **响应**: `{ success }`

### 7. 活动中心模块

#### 获取活动列表
- **GET** `/api/user/activities`
- **参数**: `page, pageSize, form(online/offline), keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, organizer, form(online/offline), address, startTime, endTime, views, likes, comments, collects, signs, status, createdAt`

#### 获取活动详情
- **GET** `/api/user/activities/:id`
- **响应**: `{ activity_detail }`

#### 报名活动
- **POST** `/api/user/activities/:id/sign`
- **响应**: `{ success }`

#### 取消报名
- **DELETE** `/api/user/activities/:id/sign`
- **响应**: `{ success }`

#### 检查报名状态
- **GET** `/api/user/activities/:id/sign-status`
- **响应**: `{ is_signed }`

### 8. 反诈自测模块

#### 获取关卡列表
- **GET** `/api/user/quiz/levels`
- **响应**: `{ levels: [{ id, title, description, difficulty, sortOrder, questionCount }] }`

#### 获取关卡题目
- **GET** `/api/user/quiz/levels/:id/questions`
- **响应**: `{ quiz, questions: [{ id, quizId, title, type(single/multiple), optionA, optionB, optionC, optionD, sortOrder }] }`

#### 提交答题结果
- **POST** `/api/user/quiz/levels/:id/submit`
- **请求体**: `{ answers: [{ questionId, answer }] }`
- **响应**: `{ score, correct_count, total_questions, passed, answer_records }`

#### 获取答题记录
- **GET** `/api/user/quiz/records`
- **响应**: `{ list[], total, page, pageSize }`

### 9. 诈骗举报模块

#### 提交举报
- **POST** `/api/user/reports`
- **请求体**: `{ title, type, amount, description, evidence[] }`
- **响应**: `{ report_id }`

#### 获取举报历史
- **GET** `/api/user/reports`
- **参数**: `page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`

#### 获取举报详情
- **GET** `/api/user/reports/:id`
- **响应**: `{ report_detail }`

### 10. 个人中心模块

#### 获取个人资料
- **GET** `/api/user/profile`
- **响应**: `{ user_info }`

#### 更新个人资料
- **PUT** `/api/user/profile`
- **请求体**: `{ nickname, avatar, bio }`
- **响应**: `{ success }`

#### 修改密码
- **PUT** `/api/user/profile/password`
- **请求体**: `{ oldPassword, newPassword }`
- **响应**: `{ success }`

#### 获取我的帖子
- **GET** `/api/user/profile/posts`
- **参数**: `page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`

#### 获取我的活动
- **GET** `/api/user/profile/activities`
- **参数**: `page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, activityId, createdAt, activity: { id, title, cover, form, startTime, endTime, address }`

#### 获取我的点赞
- **GET** `/api/user/profile/likes`
- **参数**: `page, pageSize, targetType(post/activity/news/knowledge)`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, targetType, targetId, targetTitle, targetCover, createdAt`

#### 获取我的收藏
- **GET** `/api/user/profile/collects`
- **参数**: `page, pageSize, targetType(post/activity/news/knowledge)`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, targetType, targetId, targetTitle, targetCover, createdAt`

#### 获取我的评论
- **GET** `/api/user/profile/comments`
- **参数**: `page, pageSize, targetType`
- **响应**: `{ list[], total, page, pageSize }`

#### 获取我的举报
- **GET** `/api/user/profile/reports`
- **参数**: `page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`

### 11. 点赞/收藏模块

#### 点赞
- **POST** `/api/user/interact/like`
- **请求体**: `{ targetType, targetId }`
- **说明**: targetType: 1-帖子, 2-活动, 3-资讯, 4-知识
- **响应**: `{ success }`

#### 取消点赞
- **DELETE** `/api/user/interact/like`
- **请求体**: `{ targetType, targetId }`
- **响应**: `{ success }`

#### 收藏
- **POST** `/api/user/interact/collect`
- **请求体**: `{ targetType, targetId }`
- **响应**: `{ success }`

#### 取消收藏
- **DELETE** `/api/user/interact/collect`
- **请求体**: `{ targetType, targetId }`
- **响应**: `{ success }`

#### 检查点赞/收藏状态
- **GET** `/api/user/interact/status`
- **参数**: `targetType, targetId`
- **响应**: `{ isLiked, isCollected }`

### 12. 评论模块

#### 获取评论列表
- **GET** `/api/user/comments`
- **参数**: `targetType, targetId, page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, userId, targetType, targetId, parentId, replyToUserId, replyToUsername, content, createdAt, user: { id, nickname, avatar }, replies[]`

#### 发表评论
- **POST** `/api/user/comments`
- **请求体**: `{ targetType, targetId, parentId, replyToUserId, content }`
- **响应**: `{ comment_id }`

#### 删除评论
- **DELETE** `/api/user/comments/:id`
- **响应**: `{ success }`

### 13. AI助手模块

#### 创建会话
- **POST** `/api/user/ai/session`
- **请求体**: `{ mode, scenario }`
- **说明**: mode: 'chat'-智能问答, 'scenario'-情景模拟; scenario: 'gongjia'-冒充公检法, 'shuadan'-刷单返利, 'shazhu'-杀猪盘, 'wangdai'-虚假网贷
- **响应**: `{ session_id }`

#### 发送消息（SSE流式响应）
- **POST** `/api/user/ai/chat`
- **请求体**: `{ sessionId, content }`
- **响应**: SSE流式数据

#### 获取会话历史
- **GET** `/api/user/ai/session/:sessionId/messages`
- **响应**: `{ messages[] }`

#### 清空会话
- **DELETE** `/api/user/ai/session/:sessionId`
- **响应**: `{ success }`

### 14. 公告模块

#### 获取公告列表
- **GET** `/api/user/notice/list`
- **响应**: `{ list: [{ id, title, content, publishedAt }] }`

#### 获取公告详情
- **GET** `/api/user/notice/:id`
- **响应**: `{ id, title, content, publishedAt, publisherName }`

---

## 管理端 API

### 1. 管理员认证模块

#### 管理员登录
- **POST** `/api/admin/auth/login`
- **请求体**: `{ username, password }`
- **响应**: `{ token, admin_info }`

#### 获取管理员信息
- **GET** `/api/admin/auth/info`
- **请求头**: `Authorization: Bearer <token>`
- **响应**: `{ admin_info }`

#### 退出登录
- **POST** `/api/admin/auth/logout`
- **响应**: `{ success }`

### 2. 统计模块

#### 获取统计数据
- **GET** `/api/admin/statistics`
- **响应**: `{ userCount, postCount, activityCount, reportCount, pendingReportCount, newsCount, knowledgeCount, trendData }`
- **trendData**: `[{ date, new_users, new_posts, new_reports }]` (最近7天)

### 3. 用户管理模块

#### 获取用户列表
- **GET** `/api/admin/users`
- **参数**: `page, pageSize, keyword`
- **响应**: `{ list[], total, page, pageSize }`

#### 新增用户
- **POST** `/api/admin/users`
- **请求体**: `{ username, password, nickname, phone, email }`
- **响应**: `{ user_id }`

#### 编辑用户
- **PUT** `/api/admin/users/:id`
- **请求体**: `{ nickname, phone, email, avatar, bio, status }`
- **响应**: `{ success }`

#### 删除用户
- **DELETE** `/api/admin/users/:id`
- **响应**: `{ success }`

#### 批量删除用户
- **DELETE** `/api/admin/users/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

### 4. 管理员管理模块

#### 获取管理员列表
- **GET** `/api/admin/admins`
- **参数**: `page, pageSize, keyword`
- **响应**: `{ list[], total, page, pageSize }`

#### 新增管理员
- **POST** `/api/admin/admins`
- **请求体**: `{ username, password, nickname, phone, email, role }`
- **说明**: role: 0-超级管理员, 1-普通管理员
- **响应**: `{ admin_id }`

#### 编辑管理员
- **PUT** `/api/admin/admins/:id`
- **请求体**: `{ nickname, phone, email, avatar, role, status }`
- **响应**: `{ success }`

#### 删除管理员
- **DELETE** `/api/admin/admins/:id`
- **响应**: `{ success }`

### 5. 反诈资讯管理模块

#### 获取资讯列表
- **GET** `/api/admin/news`
- **参数**: `page, pageSize, type, status, keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, content, type, tags, author, views, status, createdAt, publishedAt`

#### 新增资讯
- **POST** `/api/admin/news`
- **请求体**: `{ title, summary, cover, content, type, tags, author, status, publishedAt }`
- **响应**: `{ news_id }`

#### 编辑资讯
- **PUT** `/api/admin/news/:id`
- **请求体**: `{ title, summary, cover, content, type, tags, author, status, publishedAt }`
- **响应**: `{ success }`

#### 删除资讯
- **DELETE** `/api/admin/news/:id`
- **响应**: `{ success }`

#### 批量删除资讯
- **DELETE** `/api/admin/news/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

### 6. 反诈知识库管理模块

#### 获取知识列表
- **GET** `/api/admin/knowledge`
- **参数**: `page, pageSize, type, targetGroup, status, keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, content, type, targetGroup, tags, views, status, createdAt`

#### 新增知识
- **POST** `/api/admin/knowledge`
- **请求体**: `{ title, summary, cover, content, type, targetGroup, tags, status }`
- **响应**: `{ knowledge_id }`

#### 编辑知识
- **PUT** `/api/admin/knowledge/:id`
- **请求体**: `{ title, summary, cover, content, type, targetGroup, tags, status }`
- **响应**: `{ success }`

#### 删除知识
- **DELETE** `/api/admin/knowledge/:id`
- **响应**: `{ success }`

#### 批量删除知识
- **DELETE** `/api/admin/knowledge/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

### 7. 反诈课堂管理模块

#### 获取章节列表
- **GET** `/api/admin/classroom/chapters`
- **参数**: `page, pageSize, status`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, sortOrder, status, lessonCount, createdAt`

#### 新增章节
- **POST** `/api/admin/classroom/chapters`
- **请求体**: `{ title, summary, cover, sortOrder, status }`
- **响应**: `{ chapter_id }`

#### 编辑章节
- **PUT** `/api/admin/classroom/chapters/:id`
- **请求体**: `{ title, summary, cover, sortOrder, status }`
- **响应**: `{ success }`

#### 删除章节
- **DELETE** `/api/admin/classroom/chapters/:id`
- **响应**: `{ success }`

#### 获取课时列表
- **GET** `/api/admin/classroom/lessons`
- **参数**: `page, pageSize, chapterId, status`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, chapterId, title, summary, cover, videoUrl, duration, sortOrder, status, views, chapterTitle, createdAt`

#### 新增课时
- **POST** `/api/admin/classroom/lessons`
- **请求体**: `{ chapterId, title, summary, cover, videoUrl, duration, sortOrder, status }`
- **响应**: `{ lesson_id }`

#### 编辑课时
- **PUT** `/api/admin/classroom/lessons/:id`
- **请求体**: `{ chapterId, title, summary, cover, videoUrl, duration, sortOrder, status }`
- **响应**: `{ success }`

#### 删除课时
- **DELETE** `/api/admin/classroom/lessons/:id`
- **响应**: `{ success }`

### 8. 帖子管理模块

#### 获取帖子列表
- **GET** `/api/admin/posts`
- **参数**: `page, pageSize, categoryId, status, keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, content, tags, views, likes, comments, collects, status, createdAt, categoryId, categoryName, userId, author: { id, nickname, avatar }`

#### 编辑帖子
- **PUT** `/api/admin/posts/:id`
- **请求体**: `{ categoryId, title, summary, cover, content, tags, status }`
- **响应**: `{ success }`

#### 删除帖子
- **DELETE** `/api/admin/posts/:id`
- **响应**: `{ success }`

#### 批量删除帖子
- **DELETE** `/api/admin/posts/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

#### 审核帖子
- **PUT** `/api/admin/posts/:id/audit`
- **请求体**: `{ status }`
- **说明**: status: 0-待审核, 1-已通过, 2-已拒绝
- **响应**: `{ success }`

### 9. 分类管理模块

#### 获取分类列表
- **GET** `/api/admin/categories`
- **响应**: `{ categories[] }`

#### 新增分类
- **POST** `/api/admin/categories`
- **请求体**: `{ name, description, sortOrder }`
- **响应**: `{ category_id }`

#### 编辑分类
- **PUT** `/api/admin/categories/:id`
- **请求体**: `{ name, description, sortOrder }`
- **响应**: `{ success }`

#### 删除分类
- **DELETE** `/api/admin/categories/:id`
- **响应**: `{ success }`

### 10. 活动管理模块

#### 获取活动列表
- **GET** `/api/admin/activities`
- **参数**: `page, pageSize, form(online/offline), status, keyword`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, summary, cover, content, organizer, form(online/offline), address, startTime, endTime, views, likes, comments, collects, signs, status, createdAt`

#### 新增活动
- **POST** `/api/admin/activities`
- **请求体**: `{ title, summary, cover, content, organizer, form(online/offline), address, startTime, endTime, status }`
- **响应**: `{ activity_id }`

#### 编辑活动
- **PUT** `/api/admin/activities/:id`
- **请求体**: `{ title, summary, cover, content, organizer, form(online/offline), address, startTime, endTime, status }`
- **响应**: `{ success }`

#### 删除活动
- **DELETE** `/api/admin/activities/:id`
- **响应**: `{ success }`

#### 批量删除活动
- **DELETE** `/api/admin/activities/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

### 11. 活动报名管理模块

#### 获取报名列表
- **GET** `/api/admin/activities/:id/signups`
- **参数**: `page, pageSize`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, activityId, userId, createdAt, user: { id, username, nickname, phone }`

#### 删除报名记录
- **DELETE** `/api/admin/activities/:id/signups/:signId`
- **响应**: `{ success }`

### 12. 反诈自测管理模块

#### 获取关卡列表
- **GET** `/api/admin/quiz/levels`
- **参数**: `page, pageSize, status`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, description, difficulty, sortOrder, status, questionCount, createdAt`

#### 新增关卡
- **POST** `/api/admin/quiz/levels`
- **请求体**: `{ title, description, difficulty, sortOrder, status }`
- **响应**: `{ level_id }`

#### 编辑关卡
- **PUT** `/api/admin/quiz/levels/:id`
- **请求体**: `{ title, description, difficulty, sortOrder, status }`
- **响应**: `{ success }`

#### 删除关卡
- **DELETE** `/api/admin/quiz/levels/:id`
- **响应**: `{ success }`

#### 获取题目列表
- **GET** `/api/admin/quiz/questions`
- **参数**: `page, pageSize, quizId`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, quizId, quizTitle, title, type(single/multiple), optionA, optionB, optionC, optionD, answer, explanation, sortOrder`

#### 新增题目
- **POST** `/api/admin/quiz/questions`
- **请求体**: `{ quizId, title, type(single/multiple), optionA, optionB, optionC, optionD, answer, explanation, sortOrder }`
- **响应**: `{ question_id }`

#### 编辑题目
- **PUT** `/api/admin/quiz/questions/:id`
- **请求体**: `{ quizId, title, type(single/multiple), optionA, optionB, optionC, optionD, answer, explanation, sortOrder }`
- **响应**: `{ success }`

#### 删除题目
- **DELETE** `/api/admin/quiz/questions/:id`
- **响应**: `{ success }`

### 13. 举报管理模块

#### 获取举报列表
- **GET** `/api/admin/reports`
- **参数**: `page, pageSize, type, status`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, type, amount, status, createdAt, handledAt, username, nickname, phone`

#### 获取举报详情
- **GET** `/api/admin/reports/:id`
- **响应**: `{ report_detail }`
- **详情字段**: `id, title, type, amount, description, evidence, status, remark, createdAt, handledAt, userId, username, nickname, phone, email, handlerId, handlerName`

#### 处理举报
- **PUT** `/api/admin/reports/:id`
- **请求体**: `{ status, remark }`
- **说明**: status: 0-待处理, 1-处理中, 2-已处理, 3-已驳回
- **响应**: `{ success }`

#### 删除举报
- **DELETE** `/api/admin/reports/:id`
- **响应**: `{ success }`

### 14. 评论管理模块

#### 获取评论列表
- **GET** `/api/admin/comments`
- **参数**: `page, pageSize, targetType`
- **响应**: `{ list[], total, page, pageSize }`

#### 删除评论
- **DELETE** `/api/admin/comments/:id`
- **响应**: `{ success }`

#### 批量删除评论
- **DELETE** `/api/admin/comments/batch`
- **请求体**: `{ ids[] }`
- **响应**: `{ success }`

### 15. 公告管理模块

#### 获取公告列表
- **GET** `/api/admin/notices`
- **参数**: `page, pageSize, status`
- **响应**: `{ list[], total, page, pageSize }`
- **列表项字段**: `id, title, content, status, createdAt, publishedAt, publisherName`

#### 新增公告
- **POST** `/api/admin/notices`
- **请求体**: `{ title, content, status, publishedAt }`
- **响应**: `{ notice_id }`

#### 编辑公告
- **PUT** `/api/admin/notices/:id`
- **请求体**: `{ title, content, status, publishedAt }`
- **响应**: `{ success }`

#### 删除公告
- **DELETE** `/api/admin/notices/:id`
- **响应**: `{ success }`

### 16. 轮播图管理模块

#### 获取轮播图列表
- **GET** `/api/admin/banners`
- **响应**: `{ banners[] }`

#### 新增轮播图
- **POST** `/api/admin/banners`
- **请求体**: `{ title, image, link, sortOrder, status }`
- **响应**: `{ banner_id }`

#### 编辑轮播图
- **PUT** `/api/admin/banners/:id`
- **请求体**: `{ title, image, link, sortOrder, status }`
- **响应**: `{ success }`

#### 删除轮播图
- **DELETE** `/api/admin/banners/:id`
- **响应**: `{ success }`

---

## 文件上传 API

### 上传文件
- **POST** `/api/upload/:type`
- **参数**: `type` - 上传类型: `image`, `video`, `file`
- **请求体**: FormData (file字段)
- **响应**: `{ url }`

---

## 数据类型说明

### targetType 目标类型
| 值 | 说明 |
|----|------|
| 1 | 帖子 |
| 2 | 活动 |
| 3 | 资讯 |
| 4 | 知识 |

### status 状态值
| 模块 | 值 | 说明 |
|------|----|----- |
| 通用 | 0 | 禁用/待审核/待处理 |
| 通用 | 1 | 启用/已通过/已发布 |
| 帖子 | 2 | 已拒绝 |
| 举报 | 1 | 处理中 |
| 举报 | 2 | 已处理 |
| 举报 | 3 | 已驳回 |

### form 活动形式
| 值 | 说明 |
|----|------|
| online | 线上活动 |
| offline | 线下活动 |

### question type 题目类型
| 值 | 说明 |
|----|------|
| single | 单选题 |
| multiple | 多选题 |

### admin role 管理员角色
| 值 | 说明 |
|----|------|
| 0 | 超级管理员 |
| 1 | 普通管理员 |
