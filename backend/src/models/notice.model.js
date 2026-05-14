const db = require('./db');

class NoticeModel {
  static async create({ title, content, publisher_id, status, published_at }) {
    const [result] = await db.execute(
      `INSERT INTO notice (title, content, publisher_id, status, published_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, publisher_id, status || 1, published_at]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT n.*, a.nickname as publisher_name
       FROM notice n
       LEFT JOIN admin a ON n.publisher_id = a.id
       WHERE n.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, status = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT n.id, n.title, n.content, n.status, n.created_at, n.published_at,
                      a.nickname as publisher_name
               FROM notice n
               LEFT JOIN admin a ON n.publisher_id = a.id
               WHERE 1=1`;
    const params = [];

    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND n.status = ?';
      params.push(parseInt(status));
    }

    sql += ` ORDER BY n.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM notice WHERE 1=1';
    const countParams = [];
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findPublished() {
    const [rows] = await db.execute(
      `SELECT id, title, content, published_at
       FROM notice
       WHERE status = 1
       ORDER BY published_at DESC`
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'content', 'status', 'published_at'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE notice SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM notice WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = NoticeModel;