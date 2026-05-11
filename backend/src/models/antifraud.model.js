const db = require('./db');

class AntifraudModel {
  // Create news
  static async create({ title, summary, cover, content, type, tags, author, publisher_id, status, published_at }) {
    const [result] = await db.execute(
      `INSERT INTO antifraud (title, summary, cover, content, type, tags, author, publisher_id, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, cover, content, type, tags, author, publisher_id, status || 1, published_at]
    );
    return result.insertId;
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT a.*, ad.nickname as publisher_name FROM antifraud a LEFT JOIN admin ad ON a.publisher_id = ad.id WHERE a.id = ?',
      [id]
    );
    return rows[0];
  }

  // Find all with pagination
  static async findAll({ page = 1, pageSize = 10, type = '', status = '', keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT id, title, summary, cover, type, tags, author, views, status, created_at, published_at FROM antifraud WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
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

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM antifraud WHERE 1=1';
    const countParams = [];
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
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

  // Update news
  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'summary', 'cover', 'content', 'type', 'tags', 'author', 'status', 'published_at'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE antifraud SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Increment views
  static async incrementViews(id) {
    await db.execute(
      'UPDATE antifraud SET views = views + 1 WHERE id = ?',
      [id]
    );
  }

  // Delete news
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM antifraud WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get related news
  static async getRelated(id, type, limit = 5) {
    const [rows] = await db.execute(
      'SELECT id, title, summary, cover, type, views, created_at FROM antifraud WHERE type = ? AND id != ? AND status = 1 ORDER BY created_at DESC LIMIT ?',
      [type, id, limit]
    );
    return rows;
  }

  // Get latest news
  static async getLatest(limit = 5) {
    const limitVal = parseInt(limit) || 5;
    const [rows] = await db.execute(
      `SELECT id, title, summary, cover, type, views, created_at FROM antifraud WHERE status = 1 ORDER BY created_at DESC LIMIT ${limitVal}`
    );
    return rows;
  }
}

module.exports = AntifraudModel;
