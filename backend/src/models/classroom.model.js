const db = require('./db');

class ChapterModel {
  static async create({ title, summary, cover, sort_order, status }) {
    const [result] = await db.execute(
      `INSERT INTO chapter (title, summary, cover, sort_order, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, summary, cover, sort_order || 0, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM chapter WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, status = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT * FROM chapter WHERE 1=1';
    const params = [];

    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }

    sql += ` ORDER BY sort_order ASC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM chapter WHERE 1=1';
    const countParams = [];
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findAllPublished() {
    const [rows] = await db.execute(
      'SELECT * FROM chapter WHERE status = 1 ORDER BY sort_order ASC, created_at ASC'
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'summary', 'cover', 'sort_order', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE chapter SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM chapter WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

class LessonModel {
  static async create({ chapter_id, title, summary, cover, video_url, duration, sort_order, status }) {
    const [result] = await db.execute(
      `INSERT INTO lesson (chapter_id, title, summary, cover, video_url, duration, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [chapter_id, title, summary, cover, video_url, duration, sort_order || 0, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT l.*, c.title as chapter_title FROM lesson l LEFT JOIN chapter c ON l.chapter_id = c.id WHERE l.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, chapter_id = '', status = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT l.*, c.title as chapter_title FROM lesson l LEFT JOIN chapter c ON l.chapter_id = c.id WHERE 1=1';
    const params = [];

    if (chapter_id) {
      sql += ' AND l.chapter_id = ?';
      params.push(chapter_id);
    }
    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND l.status = ?';
      params.push(parseInt(status));
    }

    sql += ` ORDER BY l.sort_order ASC, l.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM lesson WHERE 1=1';
    const countParams = [];
    if (chapter_id) {
      countSql += ' AND chapter_id = ?';
      countParams.push(chapter_id);
    }
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findByChapterId(chapter_id) {
    const [rows] = await db.execute(
      'SELECT * FROM lesson WHERE chapter_id = ? AND status = 1 ORDER BY sort_order ASC, created_at ASC',
      [chapter_id]
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['chapter_id', 'title', 'summary', 'cover', 'video_url', 'duration', 'sort_order', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE lesson SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM lesson WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = { ChapterModel, LessonModel };
