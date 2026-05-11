const db = require('./db');

class ReportModel {
  static async create({ user_id, title, type, amount, description, evidence }) {
    const [result] = await db.execute(
      `INSERT INTO report (user_id, title, type, amount, description, evidence, status)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [user_id, title, type, amount, description, evidence]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username, u.nickname, u.phone, u.email,
              h.username as handler_name
       FROM report r
       LEFT JOIN user u ON r.user_id = u.id
       LEFT JOIN admin h ON r.handler_id = h.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, type = '', status = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT r.id, r.title, r.type, r.amount, r.status, r.created_at, r.handled_at,
                      u.username, u.nickname, u.phone
               FROM report r
               LEFT JOIN user u ON r.user_id = u.id
               WHERE 1=1`;
    const params = [];

    if (type) {
      sql += ' AND r.type = ?';
      params.push(type);
    }
    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND r.status = ?';
      params.push(parseInt(status));
    }

    sql += ` ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM report WHERE 1=1';
    const countParams = [];
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT id, title, type, amount, status, created_at, handled_at
                 FROM report
                 WHERE user_id = ?
                 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [user_id]);

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM report WHERE user_id = ?',
      [user_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['status', 'remark', 'handler_id', 'handled_at'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE report SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM report WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM report');
    return rows[0].count;
  }

  static async getPendingCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM report WHERE status = 0');
    return rows[0].count;
  }
}

module.exports = ReportModel;