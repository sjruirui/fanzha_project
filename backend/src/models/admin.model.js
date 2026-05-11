const db = require('./db');

class AdminModel {
  // Create admin
  static async create({ username, password, nickname, phone = null, email = null, avatar = null, role }) {
    const [result] = await db.execute(
      `INSERT INTO admin (username, password, nickname, phone, email, avatar, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, password, nickname, phone, email, avatar, role || 1]
    );
    return result.insertId;
  }

  // Find by username
  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, nickname, phone, email, avatar, role, status, created_at, updated_at FROM admin WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find all with pagination
  static async findAll({ page = 1, pageSize = 10, keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT id, username, nickname, phone, email, avatar, role, status, created_at, updated_at FROM admin WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (username LIKE ? OR nickname LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM admin WHERE 1=1';
    const countParams = [];
    if (keyword) {
      countSql += ' AND (username LIKE ? OR nickname LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  // Update admin
  static async update(id, { nickname, phone, email, avatar, role, status }) {
    const fields = [];
    const values = [];

    if (nickname !== undefined) { fields.push('nickname = ?'); values.push(nickname); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
    if (role !== undefined) { fields.push('role = ?'); values.push(role); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE admin SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const [result] = await db.execute(
      'UPDATE admin SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    return result.affectedRows > 0;
  }

  // Delete admin
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM admin WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = AdminModel;
