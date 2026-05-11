const db = require('./db');

class LikesModel {
  static async create({ user_id, target_type, target_id }) {
    const [result] = await db.execute(
      `INSERT INTO likes (user_id, target_type, target_id)
       VALUES (?, ?, ?)`,
      [user_id, target_type, target_id]
    );
    return result.insertId;
  }

  static async findByUserAndTarget(user_id, target_type, target_id) {
    const [rows] = await db.execute(
      'SELECT * FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [user_id, target_type, target_id]
    );
    return rows[0];
  }

  static async delete(user_id, target_type, target_id) {
    const [result] = await db.execute(
      'DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [user_id, target_type, target_id]
    );
    return result.affectedRows > 0;
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10, target_type = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    // Query likes with separate queries for each target type
    let sql = `SELECT l.id, l.target_type, l.target_id, l.created_at
               FROM likes l
               WHERE l.user_id = ?`;
    const params = [user_id];

    if (target_type) {
      sql += ' AND l.target_type = ?';
      params.push(target_type);
    }

    sql += ` ORDER BY l.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    // Fetch target info for each like
    const list = await Promise.all(rows.map(async (row) => {
      let targetInfo = null;
      try {
        switch (row.target_type) {
          case 1: {
            const [blogs] = await db.execute('SELECT id, title, cover, created_at FROM blog WHERE id = ?', [row.target_id]);
            if (blogs[0]) targetInfo = { type: 'blog', ...blogs[0] };
            break;
          }
          case 2: {
            const [activities] = await db.execute('SELECT id, title, cover, created_at FROM activity WHERE id = ?', [row.target_id]);
            if (activities[0]) targetInfo = { type: 'activity', ...activities[0] };
            break;
          }
          case 3: {
            const [news] = await db.execute('SELECT id, title, cover, created_at FROM antifraud WHERE id = ?', [row.target_id]);
            if (news[0]) targetInfo = { type: 'antifraud', ...news[0] };
            break;
          }
          case 4: {
            const [knowledge] = await db.execute('SELECT id, title, cover, created_at FROM knowledge WHERE id = ?', [row.target_id]);
            if (knowledge[0]) targetInfo = { type: 'knowledge', ...knowledge[0] };
            break;
          }
        }
      } catch (e) {
        // Target may not exist
      }
      return {
        id: row.id,
        target_type: row.target_type,
        target_id: row.target_id,
        created_at: row.created_at,
        target_info: targetInfo
      };
    }));

    let countSql = 'SELECT COUNT(*) as total FROM likes WHERE user_id = ?';
    const countParams = [user_id];
    if (target_type) {
      countSql += ' AND target_type = ?';
      countParams.push(target_type);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list, total: countResult[0].total, page, pageSize };
  }
}

class CollectModel {
  static async create({ user_id, target_type, target_id }) {
    const [result] = await db.execute(
      `INSERT INTO collect (user_id, target_type, target_id)
       VALUES (?, ?, ?)`,
      [user_id, target_type, target_id]
    );
    return result.insertId;
  }

  static async findByUserAndTarget(user_id, target_type, target_id) {
    const [rows] = await db.execute(
      'SELECT * FROM collect WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [user_id, target_type, target_id]
    );
    return rows[0];
  }

  static async delete(user_id, target_type, target_id) {
    const [result] = await db.execute(
      'DELETE FROM collect WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [user_id, target_type, target_id]
    );
    return result.affectedRows > 0;
  }

  static async findByUserId(user_id, { page = 1, pageSize = 10, target_type = '' }) {
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit || 0;

    let sql = `SELECT c.id, c.target_type, c.target_id, c.created_at
               FROM collect c
               WHERE c.user_id = ?`;
    const params = [user_id];

    if (target_type) {
      sql += ' AND c.target_type = ?';
      params.push(target_type);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    // Fetch target info for each collect
    const list = await Promise.all(rows.map(async (row) => {
      let targetInfo = null;
      try {
        switch (row.target_type) {
          case 1: {
            const [blogs] = await db.execute('SELECT id, title, summary, cover FROM blog WHERE id = ?', [row.target_id]);
            if (blogs[0]) targetInfo = { type: 'blog', ...blogs[0] };
            break;
          }
          case 2: {
            const [activities] = await db.execute('SELECT id, title, summary, cover FROM activity WHERE id = ?', [row.target_id]);
            if (activities[0]) targetInfo = { type: 'activity', ...activities[0] };
            break;
          }
          case 3: {
            const [news] = await db.execute('SELECT id, title, summary, cover FROM antifraud WHERE id = ?', [row.target_id]);
            if (news[0]) targetInfo = { type: 'antifraud', ...news[0] };
            break;
          }
          case 4: {
            const [knowledge] = await db.execute('SELECT id, title, summary, cover FROM knowledge WHERE id = ?', [row.target_id]);
            if (knowledge[0]) targetInfo = { type: 'knowledge', ...knowledge[0] };
            break;
          }
        }
      } catch (e) {
        // Target may not exist
      }
      return {
        id: row.id,
        target_type: row.target_type,
        target_id: row.target_id,
        created_at: row.created_at,
        target_info: targetInfo
      };
    }));

    let countSql = 'SELECT COUNT(*) as total FROM collect WHERE user_id = ?';
    const countParams = [user_id];
    if (target_type) {
      countSql += ' AND target_type = ?';
      countParams.push(target_type);
    }
    const [countResult] = await db.execute(countSql, countParams);

    return { list, total: countResult[0].total, page, pageSize };
  }
}

module.exports = { LikesModel, CollectModel };