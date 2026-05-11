const db = require('./db');

class CommentModel {
  static async create({ user_id, target_type, target_id, parent_id, reply_to_user_id, content }) {
    const [result] = await db.execute(
      `INSERT INTO comment (user_id, target_type, target_id, parent_id, reply_to_user_id, content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, target_type, target_id, parent_id || null, reply_to_user_id || null, content]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, u.username, u.nickname, u.avatar
       FROM comment c
       LEFT JOIN user u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTarget(target_type, target_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT c.*, u.username, u.nickname, u.avatar,
                       ru.username as reply_to_username, ru.nickname as reply_to_nickname
                FROM comment c
                LEFT JOIN user u ON c.user_id = u.id
                LEFT JOIN user ru ON c.reply_to_user_id = ru.id
                WHERE c.target_type = ? AND c.target_id = ? AND c.parent_id IS NULL AND c.status = 1
                ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [target_type, target_id]);

    // Get replies for each comment
    for (const row of rows) {
      const [replies] = await db.execute(
        `SELECT c.*, u.username, u.nickname, u.avatar,
                ru.username as reply_to_username, ru.nickname as reply_to_nickname
         FROM comment c
         LEFT JOIN user u ON c.user_id = u.id
         LEFT JOIN user ru ON c.reply_to_user_id = ru.id
         WHERE c.parent_id = ? AND c.status = 1
         ORDER BY c.created_at ASC`,
        [row.id]
      );
      row.replies = replies;
    }

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM comment WHERE target_type = ? AND target_id = ? AND parent_id IS NULL AND status = 1',
      [target_type, target_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10, target_type = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT c.*,
                      CASE
                        WHEN c.target_type = 1 THEN (SELECT title FROM blog WHERE id = c.target_id)
                        WHEN c.target_type = 2 THEN (SELECT title FROM activity WHERE id = c.target_id)
                      END as target_title
               FROM comment c
               WHERE c.user_id = ? AND c.status = 1`;
    const params = [user_id];

    if (target_type) {
      sql += ' AND c.target_type = ?';
      params.push(target_type);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM comment WHERE user_id = ? AND status = 1';
    const countParams = [user_id];
    if (target_type) {
      countSql += ' AND target_type = ?';
      countParams.push(target_type);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findAll({ page = 1, pageSize = 10, target_type = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT c.*, u.username, u.nickname,
                      CASE
                        WHEN c.target_type = 1 THEN (SELECT title FROM blog WHERE id = c.target_id)
                        WHEN c.target_type = 2 THEN (SELECT title FROM activity WHERE id = c.target_id)
                      END as target_title
               FROM comment c
               LEFT JOIN user u ON c.user_id = u.id
               WHERE 1=1`;
    const params = [];

    if (target_type) {
      sql += ' AND c.target_type = ?';
      params.push(target_type);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM comment WHERE 1=1';
    const countParams = [];
    if (target_type) {
      countSql += ' AND target_type = ?';
      countParams.push(target_type);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE comment SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM comment WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CommentModel;