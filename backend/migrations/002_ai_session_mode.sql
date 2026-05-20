-- 修改 ai_session 表的 mode 字段类型
-- 从 tinyint 改为 varchar(20) 以支持字符串值 'chat' 和 'scenario'

ALTER TABLE ai_session MODIFY COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'chat';
