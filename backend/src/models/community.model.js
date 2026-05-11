const db = require('./db');

class CategoryModel {
  static async create({ name, description, sort_order }) {
    const [result] = await db.execute(
      `INSERT INTO category (name, description, sort_order)
       VALUES (?, ?, ?)`,
      [name, description, sort_order || 0]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT * FROM category ORDER BY sort_order ASC, created_at ASC'
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'description', 'sort_order'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE category SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM category WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

class BlogModel {
  static async create({ user_id, category_id, title, summary, cover, content, tags }) {
    const [result] = await db.execute(
      `INSERT INTO blog (user_id, category_id, title, summary, cover, content, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id, title, summary, cover, content, tags]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT b.*, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar,
              c.name as category_name
       FROM blog b
       LEFT JOIN user u ON b.user_id = u.id
       LEFT JOIN category c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, category_id = '', status = '', keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT b.id, b.title, b.summary, b.cover, b.tags, b.views, b.likes_count, b.comments_count,
                      b.collects_count, b.status, b.created_at,
                      u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar,
                      c.name as category_name
               FROM blog b
               LEFT JOIN user u ON b.user_id = u.id
               LEFT JOIN category c ON b.category_id = c.id
               WHERE 1=1`;
    const params = [];

    if (category_id) {
      sql += ' AND b.category_id = ?';
      params.push(category_id);
    }
    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND b.status = ?';
      params.push(parseInt(status));
    }
    if (keyword) {
      sql += ' AND (b.title LIKE ? OR b.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM blog WHERE 1=1';
    const countParams = [];
    if (category_id) {
      countSql += ' AND category_id = ?';
      countParams.push(category_id);
    }
    if (status !== '' && status !== undefined && status !== null) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }
    if (keyword) {
      countSql += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT b.id, b.title, b.summary, b.cover, b.tags, b.views, b.likes_count,
                        b.comments_count, b.collects_count, b.status, b.created_at,
                        c.name as category_name
                 FROM blog b
                 LEFT JOIN category c ON b.category_id = c.id
                 WHERE b.user_id = ?
                 ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [user_id]);

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM blog WHERE user_id = ?',
      [user_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['category_id', 'title', 'summary', 'cover', 'content', 'tags', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE blog SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async incrementViews(id) {
    await db.execute(
      'UPDATE blog SET views = views + 1 WHERE id = ?',
      [id]
    );
  }

  static async updateLikesCount(id, delta) {
    await db.execute(
      'UPDATE blog SET likes_count = likes_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async updateCommentsCount(id, delta) {
    await db.execute(
      'UPDATE blog SET comments_count = comments_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async updateCollectsCount(id, delta) {
    await db.execute(
      'UPDATE blog SET collects_count = collects_count + ? WHERE id = ?',
      [delta, id]
    );
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM blog WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM blog WHERE status = 1');
    return rows[0].count;
  }
}

module.exports = { CategoryModel, BlogModel };