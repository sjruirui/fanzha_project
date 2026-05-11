const db = require('./db');

class QuizModel {
  static async create({ title, description, difficulty, sort_order, status }) {
    const [result] = await db.execute(
      `INSERT INTO quiz (title, description, difficulty, sort_order, status)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, difficulty || 1, sort_order || 0, status || 1]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM quiz WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll({ page = 1, pageSize = 10, status = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT * FROM quiz WHERE 1=1';
    const params = [];

    if (status !== '' && status !== undefined && status !== null) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }

    sql += ` ORDER BY sort_order ASC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM quiz WHERE 1=1';
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
      'SELECT * FROM quiz WHERE status = 1 ORDER BY sort_order ASC, created_at ASC'
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'description', 'difficulty', 'sort_order', 'status'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE quiz SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM quiz WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

class QuestionModel {
  static async create({ quiz_id, title, type, option_a, option_b, option_c, option_d, answer, explanation, sort_order }) {
    const [result] = await db.execute(
      `INSERT INTO question (quiz_id, title, type, option_a, option_b, option_c, option_d, answer, explanation, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quiz_id, title, type || 1, option_a, option_b, option_c, option_d, answer, explanation, sort_order || 0]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM question WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByQuizId(quiz_id) {
    const [rows] = await db.execute(
      'SELECT id, title, type, option_a, option_b, option_c, option_d, sort_order FROM question WHERE quiz_id = ? ORDER BY sort_order ASC',
      [quiz_id]
    );
    return rows;
  }

  static async findByQuizIdWithAnswers(quiz_id) {
    const [rows] = await db.execute(
      'SELECT * FROM question WHERE quiz_id = ? ORDER BY sort_order ASC',
      [quiz_id]
    );
    return rows;
  }

  static async findAll({ page = 1, pageSize = 10, quiz_id = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = 'SELECT q.*, quiz.title as quiz_title FROM question q LEFT JOIN quiz ON q.quiz_id = quiz.id WHERE 1=1';
    const params = [];

    if (quiz_id) {
      sql += ' AND q.quiz_id = ?';
      params.push(quiz_id);
    }

    sql += ` ORDER BY q.sort_order ASC, q.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM question WHERE 1=1';
    const countParams = [];
    if (quiz_id) {
      countSql += ' AND quiz_id = ?';
      countParams.push(quiz_id);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['quiz_id', 'title', 'type', 'option_a', 'option_b', 'option_c', 'option_d', 'answer', 'explanation', 'sort_order'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.execute(
      `UPDATE question SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM question WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

class UserQuizRecordModel {
  static async create({ user_id, quiz_id, score, total_questions, correct_count, answers, passed }) {
    const [result] = await db.execute(
      `INSERT INTO user_quiz_record (user_id, quiz_id, score, total_questions, correct_count, answers, passed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, quiz_id, score, total_questions, correct_count, answers, passed || 0]
    );
    return result.insertId;
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10 }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    const sql = `SELECT r.*, q.title as quiz_title, q.difficulty
                 FROM user_quiz_record r
                 LEFT JOIN quiz q ON r.quiz_id = q.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(sql, [user_id]);

    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM user_quiz_record WHERE user_id = ?',
      [user_id]
    );

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM user_quiz_record WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = { QuizModel, QuestionModel, UserQuizRecordModel };