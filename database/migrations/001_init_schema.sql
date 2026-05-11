-- 反诈宣传平台数据库初始化脚本
-- 创建时间: 2026-05-10

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `bio` TEXT COMMENT '个人简介',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- 2. 管理员表
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `phone` VARCHAR(20) COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `role` TINYINT DEFAULT 1 COMMENT '角色：1-普通管理员，2-超级管理员',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ----------------------------
-- 3. 反诈资讯表
-- ----------------------------
DROP TABLE IF EXISTS `antifraud`;
CREATE TABLE `antifraud` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '资讯ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `summary` TEXT COMMENT '简介',
  `cover` VARCHAR(255) COMMENT '封面图URL',
  `content` LONGTEXT NOT NULL COMMENT '富文本内容',
  `type` VARCHAR(50) NOT NULL COMMENT '类型：骗局曝光/新闻动态/案例剖析',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `author` VARCHAR(50) COMMENT '作者',
  `publisher_id` INT COMMENT '发布人ID',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已发布，0-草稿',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_at` DATETIME COMMENT '发布时间',
  FOREIGN KEY (`publisher_id`) REFERENCES `admin`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反诈资讯表';

-- ----------------------------
-- 4. 反诈知识库表
-- ----------------------------
DROP TABLE IF EXISTS `knowledge`;
CREATE TABLE `knowledge` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '知识ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `summary` TEXT COMMENT '简介',
  `cover` VARCHAR(255) COMMENT '封面图URL',
  `content` LONGTEXT NOT NULL COMMENT '富文本内容',
  `type` VARCHAR(50) NOT NULL COMMENT '类型：防骗指南/诈骗话术集',
  `target_group` VARCHAR(50) COMMENT '人群分类：老年人/学生/财务人员/其他',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已发布，0-草稿',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反诈知识库表';

-- ----------------------------
-- 5. 课堂章节表
-- ----------------------------
DROP TABLE IF EXISTS `chapter`;
CREATE TABLE `chapter` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '章节ID',
  `title` VARCHAR(200) NOT NULL COMMENT '章节标题',
  `summary` TEXT COMMENT '章节简介',
  `cover` VARCHAR(255) COMMENT '章节封面URL',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已发布，0-草稿',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课堂章节表';

-- ----------------------------
-- 6. 课堂课时表
-- ----------------------------
DROP TABLE IF EXISTS `lesson`;
CREATE TABLE `lesson` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '课时ID',
  `chapter_id` INT COMMENT '所属章节ID',
  `title` VARCHAR(200) NOT NULL COMMENT '课时标题',
  `summary` TEXT COMMENT '课时简介',
  `cover` VARCHAR(255) COMMENT '课时封面URL',
  `video_url` VARCHAR(255) NOT NULL COMMENT '视频URL',
  `duration` INT COMMENT '视频时长（秒）',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已发布，0-草稿',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课堂课时表';

-- ----------------------------
-- 7. 帖子分类表
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) UNIQUE NOT NULL COMMENT '分类名称',
  `description` TEXT COMMENT '分类描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子分类表';

-- ----------------------------
-- 8. 帖子表
-- ----------------------------
DROP TABLE IF EXISTS `blog`;
CREATE TABLE `blog` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` INT COMMENT '作者ID',
  `category_id` INT COMMENT '分类ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `summary` TEXT COMMENT '简介',
  `cover` VARCHAR(255) COMMENT '封面图URL',
  `content` LONGTEXT NOT NULL COMMENT '富文本内容',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `likes_count` INT DEFAULT 0 COMMENT '点赞数',
  `comments_count` INT DEFAULT 0 COMMENT '评论数',
  `collects_count` INT DEFAULT 0 COMMENT '收藏数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-待审核，2-已删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- ----------------------------
-- 9. 活动表
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
  `title` VARCHAR(200) NOT NULL COMMENT '活动标题',
  `summary` TEXT COMMENT '活动简介',
  `cover` VARCHAR(255) COMMENT '封面图URL',
  `content` LONGTEXT NOT NULL COMMENT '活动详情',
  `organizer` VARCHAR(100) COMMENT '主办方',
  `form` TINYINT DEFAULT 1 COMMENT '形式：1-线上，2-线下',
  `address` VARCHAR(255) COMMENT '活动地址',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `likes_count` INT DEFAULT 0 COMMENT '点赞数',
  `comments_count` INT DEFAULT 0 COMMENT '评论数',
  `collects_count` INT DEFAULT 0 COMMENT '收藏数',
  `signs_count` INT DEFAULT 0 COMMENT '报名数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-已取消',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- ----------------------------
-- 10. 活动报名表
-- ----------------------------
DROP TABLE IF EXISTS `activity_sign`;
CREATE TABLE `activity_sign` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '报名ID',
  `user_id` INT COMMENT '用户ID',
  `activity_id` INT COMMENT '活动ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已报名，0-已取消',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';

-- ----------------------------
-- 11. 测试关卡表
-- ----------------------------
DROP TABLE IF EXISTS `quiz`;
CREATE TABLE `quiz` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '关卡ID',
  `title` VARCHAR(200) NOT NULL COMMENT '关卡标题',
  `description` TEXT COMMENT '关卡描述',
  `difficulty` TINYINT DEFAULT 1 COMMENT '难度：1-简单，2-中等，3-困难',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测试关卡表';

-- ----------------------------
-- 12. 测试题目表
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '题目ID',
  `quiz_id` INT COMMENT '所属关卡ID',
  `title` TEXT NOT NULL COMMENT '题目内容',
  `type` TINYINT DEFAULT 1 COMMENT '类型：1-单选，2-多选',
  `option_a` VARCHAR(255) NOT NULL COMMENT '选项A',
  `option_b` VARCHAR(255) NOT NULL COMMENT '选项B',
  `option_c` VARCHAR(255) COMMENT '选项C',
  `option_d` VARCHAR(255) COMMENT '选项D',
  `answer` VARCHAR(10) NOT NULL COMMENT '正确答案（如A或ABCD）',
  `explanation` TEXT COMMENT '答案解析',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测试题目表';

-- ----------------------------
-- 13. 用户答题记录表
-- ----------------------------
DROP TABLE IF EXISTS `user_quiz_record`;
CREATE TABLE `user_quiz_record` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `user_id` INT COMMENT '用户ID',
  `quiz_id` INT COMMENT '关卡ID',
  `score` INT COMMENT '得分',
  `total_questions` INT COMMENT '总题数',
  `correct_count` INT COMMENT '正确数',
  `answers` TEXT COMMENT '用户答案记录（JSON格式）',
  `passed` TINYINT DEFAULT 0 COMMENT '是否通关：1-通关，0-未通关',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户答题记录表';

-- ----------------------------
-- 14. 举报表
-- ----------------------------
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '举报ID',
  `user_id` INT COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '举报标题',
  `type` VARCHAR(50) NOT NULL COMMENT '举报类型：电信诈骗/网络诈骗/投资诈骗等',
  `amount` DECIMAL(10,2) COMMENT '受骗金额',
  `description` TEXT NOT NULL COMMENT '详细描述',
  `evidence` TEXT COMMENT '证据材料URL（JSON数组）',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-处理中，2-已处理',
  `remark` TEXT COMMENT '处理备注',
  `handler_id` INT COMMENT '处理人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `handled_at` DATETIME COMMENT '处理时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`handler_id`) REFERENCES `admin`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';

-- ----------------------------
-- 15. 评论表
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `user_id` INT COMMENT '评论用户ID',
  `target_type` TINYINT NOT NULL COMMENT '目标类型：1-帖子，2-活动',
  `target_id` INT NOT NULL COMMENT '目标ID',
  `parent_id` INT COMMENT '父评论ID（用于回复）',
  `reply_to_user_id` INT COMMENT '回复的用户ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-已删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`),
  FOREIGN KEY (`reply_to_user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ----------------------------
-- 16. 点赞表
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `user_id` INT COMMENT '用户ID',
  `target_type` TINYINT NOT NULL COMMENT '目标类型：1-帖子，2-活动，3-资讯，4-知识',
  `target_id` INT NOT NULL COMMENT '目标ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ----------------------------
-- 17. 收藏表
-- ----------------------------
DROP TABLE IF EXISTS `collect`;
CREATE TABLE `collect` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT COMMENT '用户ID',
  `target_type` TINYINT NOT NULL COMMENT '目标类型：1-帖子，2-活动，3-资讯，4-知识',
  `target_id` INT NOT NULL COMMENT '目标ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ----------------------------
-- 18. 公告表
-- ----------------------------
DROP TABLE IF EXISTS `notice`;
CREATE TABLE `notice` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID',
  `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `publisher_id` INT COMMENT '发布人ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-已发布，0-草稿',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_at` DATETIME COMMENT '发布时间',
  FOREIGN KEY (`publisher_id`) REFERENCES `admin`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ----------------------------
-- 19. AI会话表
-- ----------------------------
DROP TABLE IF EXISTS `ai_session`;
CREATE TABLE `ai_session` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
  `user_id` INT COMMENT '用户ID',
  `session_id` VARCHAR(100) UNIQUE NOT NULL COMMENT '会话唯一标识',
  `mode` TINYINT NOT NULL COMMENT '模式：1-智能问答，2-情景模拟',
  `scenario` VARCHAR(50) COMMENT '情景类型（情景模拟时使用）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI会话表';

-- ----------------------------
-- 20. AI消息表
-- ----------------------------
DROP TABLE IF EXISTS `ai_message`;
CREATE TABLE `ai_message` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `session_id` INT COMMENT '会话ID',
  `role` TINYINT NOT NULL COMMENT '角色：1-用户，2-AI',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`session_id`) REFERENCES `ai_session`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI消息表';

-- ----------------------------
-- 21. 轮播图表
-- ----------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '轮播图ID',
  `title` VARCHAR(200) COMMENT '标题',
  `image` VARCHAR(255) NOT NULL COMMENT '图片URL',
  `link` VARCHAR(255) COMMENT '链接地址',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-显示，0-隐藏',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- ----------------------------
-- 插入默认超级管理员
-- 密码: admin123 (使用 bcrypt 加密)
-- ----------------------------
INSERT INTO `admin` (`username`, `password`, `nickname`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '超级管理员', 2, 1);

-- ----------------------------
-- 插入默认帖子分类
-- ----------------------------
INSERT INTO `category` (`name`, `description`, `sort_order`) VALUES
('防骗经验', '分享防骗经验和心得', 1),
('案例分析', '真实诈骗案例分析', 2),
('求助咨询', '遇到可疑情况求助', 3),
('反诈宣传', '反诈宣传活动分享', 4);

SET FOREIGN_KEY_CHECKS = 1;
