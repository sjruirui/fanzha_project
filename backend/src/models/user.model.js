const db = require('./db');

class UserModel {
  // Create user
  static async create({ username, password, nickname, phone, email = null, avatar = null, bio = null }) {
    const [result] = await db.execute(
      `INSERT INTO user (username, password, nickname, phone, email, avatar, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, password, nickname, phone, email, avatar, bio]
    );
    return result.insertId;
  }

  // Find by username
  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Find by phone
  static async findByPhone(phone) {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE phone = ?',
      [phone]
    );
    return rows[0];
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, nickname, phone, email, avatar, bio, status, created_at, updated_at FROM user WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find all with pagination
  static async findAll({ page = 1, pageSize = 10, keyword = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT id, username, nickname, phone, email, avatar, bio, status, created_at, updated_at FROM user WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (username LIKE ? OR nickname LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM user WHERE 1=1';
    const countParams = [];
    if (keyword) {
      countSql += ' AND (username LIKE ? OR nickname LIKE ? OR phone LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  // Update user
  static async update(id, { nickname, phone, email, avatar, bio, status }) {
    const fields = [];
    const values = [];

    if (nickname !== undefined) { fields.push('nickname = ?'); values.push(nickname); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const [result] = await db.execute(
      'UPDATE user SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM user WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get user count
  static async getCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM user');
    return rows[0].count;
  }
}

module.exports = UserModel;
