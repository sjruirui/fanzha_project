# 数据库设计

## 核心数据表

### 1. 用户表 (user)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| nickname | VARCHAR(50) | | 昵称 |
| phone | VARCHAR(20) | UNIQUE | 手机号 |
| email | VARCHAR(100) | | 邮箱 |
| avatar | VARCHAR(255) | | 头像URL |
| bio | TEXT | | 个人简介 |
| status | TINYINT | DEFAULT 1 | 状态：1-正常，0-禁用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2. 管理员表 (admin)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 管理员ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| nickname | VARCHAR(50) | | 昵称 |
| phone | VARCHAR(20) | | 手机号 |
| email | VARCHAR(100) | | 邵箱 |
| avatar | VARCHAR(255) | | 头像URL |
| role | TINYINT | DEFAULT 1 | 角色：1-普通管理员，2-超级管理员 |
| status | TINYINT | DEFAULT 1 | 状态：1-正常，0-禁用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3. 反诈资讯表 (antifraud)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 资讯ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| summary | TEXT | | 简介 |
| cover | VARCHAR(255) | | 封面图URL |
| content | LONGTEXT | NOT NULL | 富文本内容 |
| type | VARCHAR(50) | NOT NULL | 类型：骗局曝光/新闻动态/案例剖析 |
| tags | VARCHAR(255) | | 标签（逗号分隔） |
| author | VARCHAR(50) | | 作者 |
| publisher_id | INT | FOREIGN KEY (admin.id) | 发布人ID |
| views | INT | DEFAULT 0 | 浏览量 |
| status | TINYINT | DEFAULT 1 | 状态：1-已发布，0-草稿 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| published_at | DATETIME | | 发布时间 |

### 4. 反诈知识库表 (knowledge)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 知识ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| summary | TEXT | | 简介 |
| cover | VARCHAR(255) | | 封面图URL |
| content | LONGTEXT | NOT NULL | 富文本内容 |
| type | VARCHAR(50) | NOT NULL | 类型：防骗指南/诈骗话术集 |
| target_group | VARCHAR(50) | | 人群分类：老年人/学生/财务人员/其他 |
| tags | VARCHAR(255) | | 标签（逗号分隔） |
| views | INT | DEFAULT 0 | 浏览量 |
| status | TINYINT | DEFAULT 1 | 状态：1-已发布，0-草稿 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 5. 课堂章节表 (chapter)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 章节ID |
| title | VARCHAR(200) | NOT NULL | 章节标题 |
| summary | TEXT | | 章节简介 |
| cover | VARCHAR(255) | | 章节封面URL |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| status | TINYINT | DEFAULT 1 | 状态：1-已发布，0-草稿 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 6. 课堂课时表 (lesson)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 课时ID |
| chapter_id | INT | FOREIGN KEY (chapter.id) | 所属章节ID |
| title | VARCHAR(200) | NOT NULL | 课时标题 |
| summary | TEXT | | 课时简介 |
| cover | VARCHAR(255) | | 课时封面URL |
| video_url | VARCHAR(255) | NOT NULL | 视频URL |
| duration | INT | | 视频时长（秒） |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| status | TINYINT | DEFAULT 1 | 状态：1-已发布，0-草稿 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 7. 帖子表 (blog)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 帖子ID |
| user_id | INT | FOREIGN KEY (user.id) | 作者ID |
| category_id | INT | FOREIGN KEY (category.id) | 分类ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| summary | TEXT | | 简介 |
| cover | VARCHAR(255) | | 封面图URL |
| content | LONGTEXT | NOT NULL | 富文本内容 |
| tags | VARCHAR(255) | | 标签（逗号分隔） |
| views | INT | DEFAULT 0 | 浏览量 |
| likes_count | INT | DEFAULT 0 | 点赞数 |
| comments_count | INT | DEFAULT 0 | 评论数 |
| collects_count | INT | DEFAULT 0 | 收藏数 |
| status | TINYINT | DEFAULT 1 | 状态：1-正常，0-待审核，2-已删除 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 8. 帖子分类表 (category)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名称 |
| description | TEXT | | 分类描述 |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 9. 活动表 (activity)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 活动ID |
| title | VARCHAR(200) | NOT NULL | 活动标题 |
| summary | TEXT | | 活动简介 |
| cover | VARCHAR(255) | | 封面图URL |
| content | LONGTEXT | NOT NULL | 活动详情 |
| organizer | VARCHAR(100) | | 主办方 |
| form | TINYINT | DEFAULT 1 | 形式：1-线上，2-线下 |
| address | VARCHAR(255) | | 活动地址 |
| start_time | DATETIME | NOT NULL | 开始时间 |
| end_time | DATETIME | NOT NULL | 结束时间 |
| views | INT | DEFAULT 0 | 浏览量 |
| likes_count | INT | DEFAULT 0 | 点赞数 |
| comments_count | INT | DEFAULT 0 | 评论数 |
| collects_count | INT | DEFAULT 0 | 收藏数 |
| signs_count | INT | DEFAULT 0 | 报名数 |
| status | TINYINT | DEFAULT 1 | 状态：1-正常，0-已取消 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 10. 活动报名表 (activity_sign)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 报名ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| activity_id | INT | FOREIGN KEY (activity.id) | 活动ID |
| status | TINYINT | DEFAULT 1 | 状态：1-已报名，0-已取消 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 报名时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 11. 测试关卡表 (quiz)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 关卡ID |
| title | VARCHAR(200) | NOT NULL | 关卡标题 |
| description | TEXT | | 关卡描述 |
| difficulty | TINYINT | DEFAULT 1 | 难度：1-简单，2-中等，3-困难 |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| status | TINYINT | DEFAULT 1 | 状态：1-启用，0-禁用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 12. 测试题目表 (question)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 题目ID |
| quiz_id | INT | FOREIGN KEY (quiz.id) | 所属关卡ID |
| title | TEXT | NOT NULL | 题目内容 |
| type | TINYINT | DEFAULT 1 | 类型：1-单选，2-多选 |
| option_a | VARCHAR(255) | NOT NULL | 选项A |
| option_b | VARCHAR(255) | NOT NULL | 选项B |
| option_c | VARCHAR(255) | | 选项C |
| option_d | VARCHAR(255) | | 选项D |
| answer | VARCHAR(10) | NOT NULL | 正确答案（如A或ABCD） |
| explanation | TEXT | | 答案解析 |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 13. 用户答题记录表 (user_quiz_record)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 记录ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| quiz_id | INT | FOREIGN KEY (quiz.id) | 关卡ID |
| score | INT | | 得分 |
| total_questions | INT | | 总题数 |
| correct_count | INT | | 正确数 |
| answers | TEXT | | 用户答案记录（JSON格式） |
| passed | TINYINT | DEFAULT 0 | 是否通关：1-通关，0-未通关 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 答题时间 |

### 14. 举报表 (report)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 举报ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| title | VARCHAR(200) | NOT NULL | 举报标题 |
| type | VARCHAR(50) | NOT NULL | 举报类型：电信诈骗/网络诈骗/投资诈骗等 |
| amount | DECIMAL(10,2) | | 受骗金额 |
| description | TEXT | NOT NULL | 详细描述 |
| evidence | TEXT | | 证据材料URL（JSON数组） |
| status | TINYINT | DEFAULT 0 | 状态：0-待处理，1-处理中，2-已处理 |
| remark | TEXT | | 处理备注 |
| handler_id | INT | FOREIGN KEY (admin.id) | 处理人ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| handled_at | DATETIME | | 处理时间 |

### 15. 评论表 (comment)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论ID |
| user_id | INT | FOREIGN KEY (user.id) | 评论用户ID |
| target_type | TINYINT | NOT NULL | 目标类型：1-帖子，2-活动 |
| target_id | INT | NOT NULL | 目标ID |
| parent_id | INT | FOREIGN KEY (comment.id) | 父评论ID（用于回复） |
| reply_to_user_id | INT | FOREIGN KEY (user.id) | 回复的用户ID |
| content | TEXT | NOT NULL | 评论内容 |
| status | TINYINT | DEFAULT 1 | 状态：1-正常，0-已删除 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 16. 点赞表 (likes)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 点赞ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| target_type | TINYINT | NOT NULL | 目标类型：1-帖子，2-活动，3-资讯，4-知识 |
| target_id | INT | NOT NULL | 目标ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 点赞时间 |

**唯一索引**: (user_id, target_type, target_id)

### 17. 收藏表 (collect)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 收藏ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| target_type | TINYINT | NOT NULL | 目标类型：1-帖子，2-活动，3-资讯，4-知识 |
| target_id | INT | NOT NULL | 目标ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |

**唯一索引**: (user_id, target_type, target_id)

### 18. 公告表 (notice)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 公告ID |
| title | VARCHAR(200) | NOT NULL | 公告标题 |
| content | TEXT | NOT NULL | 公告内容 |
| publisher_id | INT | FOREIGN KEY (admin.id) | 发布人ID |
| status | TINYINT | DEFAULT 1 | 状态：1-已发布，0-草稿 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| published_at | DATETIME | | 发布时间 |

### 19. AI会话表 (ai_session)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 会话ID |
| user_id | INT | FOREIGN KEY (user.id) | 用户ID |
| session_id | VARCHAR(100) | UNIQUE, NOT NULL | 会话唯一标识 |
| mode | TINYINT | NOT NULL | 模式：1-智能问答，2-情景模拟 |
| scenario | VARCHAR(50) | | 情景类型（情景模拟时使用） |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 20. AI消息表 (ai_message)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 消息ID |
| session_id | INT | FOREIGN KEY (ai_session.id) | 会话ID |
| role | TINYINT | NOT NULL | 角色：1-用户，2-AI |
| content | TEXT | NOT NULL | 消息内容 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 21. 轮播图表 (banner)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 轮播图ID |
| title | VARCHAR(200) | | 标题 |
| image | VARCHAR(255) | NOT NULL | 图片URL |
| link | VARCHAR(255) | | 链接地址 |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| status | TINYINT | DEFAULT 1 | 状态：1-显示，0-隐藏 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |