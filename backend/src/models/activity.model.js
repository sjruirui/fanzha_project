const db = require('./db');

class ActivityModel {
  static async create({ title, summary, cover, content, organizer, form, address, start_time, end_time, status }) {
    const [result] = await db.execute(
      `INSERT INTO activity (title, summary, cover, content, organizer, form, address, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, cover, content, organizer, form || 1, address, start_time, end_time, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM activity WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, form = '', status = '', keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT * FROM activity WHERE 1=1';
    const params = [];

    if (form) {
      sql += ' AND form = ?';
      params.push(form);
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

    let countSql = 'SELECT COUNT(*) as total FROM activity WHERE 1=1';
    const countParams = [];
    if (form) {
      countSql += ' AND form = ?';
      countParams.push(form);
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
    const allowedFields = ['title', 'summary', 'cover', 'content', 'organizer', 'form', 'address', 'start_time', 'end_time', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE activity SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async incrementViews(id) {
    await db.execute(
      'UPDATE activity SET views = views + 1 WHERE id = ?',
      [id]
    );
  }

  static async updateLikesCount(id, delta) {
    await db.execute(
      'UPDATE activity SET likes_count = likes_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async updateCommentsCount(id, delta) {
    await db.execute(
      'UPDATE activity SET comments_count = comments_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async updateCollectsCount(id, delta) {
    await db.execute(
      'UPDATE activity SET collects_count = collects_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async updateSignsCount(id, delta) {
    await db.execute(
      'UPDATE activity SET signs_count = signs_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM activity WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getLatest(limit = 5) {
    const limitVal = parseInt(limit) || 5;
    const [rows] = await db.execute(
      `SELECT id, title, summary, cover, form, start_time, end_time, signs_count FROM activity WHERE status = 1 ORDER BY created_at DESC LIMIT ${limitVal}`
    );
    return rows;
  }

  static async getCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM activity WHERE status = 1');
    return rows[0].count;
  }
}

class ActivitySignModel {
  static async create({ user_id, activity_id }) {
    const [result] = await db.execute(
      `INSERT INTO activity_sign (user_id, activity_id, status)
       VALUES (?, ?, 1)`,
      [user_id, activity_id]
    );
    return result.insertId;
  }

  static async findByUserAndActivity(user_id, activity_id) {
    const [rows] = await db.execute(
      'SELECT * FROM activity_sign WHERE user_id = ? AND activity_id = ?',
      [user_id, activity_id]
    );
    return rows[0];
  }

  static async findByActivity(activity_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT s.*, u.username, u.nickname, u.phone, u.email
                 FROM activity_sign s
                 LEFT JOIN user u ON s.user_id = u.id
                 WHERE s.activity_id = ?
                 ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [activity_id]);

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM activity_sign WHERE activity_id = ?',
      [activity_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT s.*, a.title, a.cover, a.form, a.start_time, a.end_time, a.address
                 FROM activity_sign s
                 LEFT JOIN activity a ON s.activity_id = a.id
                 WHERE s.user_id = ? AND s.status = 1
                 ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [user_id]);

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM activity_sign WHERE user_id = ? AND status = 1',
      [user_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE activity_sign SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM activity_sign WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = { ActivityModel, ActivitySignModel };
