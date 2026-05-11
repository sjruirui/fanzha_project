const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class AISessionModel {
  static async create({ user_id, mode, scenario }) {
    const session_id = uuidv4();
    const [result] = await db.execute(
      `INSERT INTO ai_session (user_id, session_id, mode, scenario)
       VALUES (?, ?, ?, ?)`,
      [user_id, session_id, mode, scenario || null]
    );
    return { id: result.insertId, session_id };
  }

  static async findBySessionId(session_id) {
    const [rows] = await db.execute(
      'SELECT * FROM ai_session WHERE session_id = ?',
      [session_id]
    );
    return rows[0];
  }

  static async findByUserId(user_id) {
    const [rows] = await db.execute(
      'SELECT * FROM ai_session WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return rows;
  }

  static async delete(session_id) {
    const [result] = await db.execute(
      'DELETE FROM ai_session WHERE session_id = ?',
      [session_id]
    );
    return result.affectedRows > 0;
  }
}

class AIMessageModel {
  static async create({ session_id, role, content }) {
    const [result] = await db.execute(
      `INSERT INTO ai_message (session_id, role, content)
       VALUES (?, ?, ?)`,
      [session_id, role, content]
    );
    return result.insertId;
  }

  static async findBySessionId(session_id) {
    const [rows] = await db.execute(
      'SELECT * FROM ai_message WHERE session_id = ? ORDER BY created_at ASC',
      [session_id]
    );
    return rows;
  }

  static async deleteBySessionId(session_id) {
    const [result] = await db.execute(
      'DELETE FROM ai_message WHERE session_id = ?',
      [session_id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = { AISessionModel, AIMessageModel };