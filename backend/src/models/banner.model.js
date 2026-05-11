const db = require('./db');

class BannerModel {
  static async create({ title, image, link, sort_order, status }) {
    const [result] = await db.execute(
      `INSERT INTO banner (title, image, link, sort_order, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, image, link, sort_order || 0, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM banner WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT * FROM banner ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  }

  static async findPublished() {
    const [rows] = await db.execute(
      'SELECT id, title, image, link FROM banner WHERE status = 1 ORDER BY sort_order ASC'
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'image', 'link', 'sort_order', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE banner SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM banner WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BannerModel;