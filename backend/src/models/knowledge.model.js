const db = require('./db');

class KnowledgeModel {
  static async create({ title, summary, cover, content, type, target_group, tags, status }) {
    const [result] = await db.execute(
      `INSERT INTO knowledge (title, summary, cover, content, type, target_group, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, cover, content, type, target_group, tags, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM knowledge WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, type = '', target_group = '', status = '', keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT id, title, summary, cover, type, target_group, tags, views, status, created_at FROM knowledge WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (target_group) {
      sql += ' AND target_group = ?';
      params.push(target_group);
    }
    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    if (keyword) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM knowledge WHERE 1=1';
    const countParams = [];
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }
    if (target_group) {
      countSql += ' AND target_group = ?';
      countParams.push(target_group);
    }
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    if (keyword) {
      countSql += ' AND (title LIKE ? OR summary LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'summary', 'cover', 'content', 'type', 'target_group', 'tags', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE knowledge SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async incrementViews(id) {
    await db.execute(
      'UPDATE knowledge SET views = views + 1 WHERE id = ?',
      [id]
    );
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM knowledge WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getRelated(id, type, limit = 5) {
    const [rows] = await db.execute(
      'SELECT id, title, summary, cover, type, views, created_at FROM knowledge WHERE type = ? AND id != ? AND status = 1 ORDER BY created_at DESC LIMIT ?',
      [type, id, limit]
    );
    return rows;
  }

  static async getLatest(limit = 5) {
    const limitVal = parseInt(limit) || 5;
    const [rows] = await db.execute(
      `SELECT id, title, summary, cover, type, target_group, views, created_at FROM knowledge WHERE status = 1 ORDER BY created_at DESC LIMIT ${limitVal}`
    );
    return rows;
  }
}

module.exports = KnowledgeModel;
