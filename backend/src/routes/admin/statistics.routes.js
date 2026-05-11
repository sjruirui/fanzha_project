const express = require('express');
const router = express.Router();
const UserModel = require('../../models/user.model');
const { BlogModel } = require('../../models/community.model');
const { ActivityModel } = require('../../models/activity.model');
const ReportModel = require('../../models/report.model');
const { authAdmin } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/admin/statistics
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const [userCount, postCount, activityCount, reportCount, pendingReportCount] = await Promise.all([
      UserModel.getCount(),
      BlogModel.getCount(),
      ActivityModel.getCount(),
      ReportModel.getCount(),
      ReportModel.getPendingCount()
    ]);

    // Get trend data for last 7 days using separate queries
    const db = require('../../models/db');

    // Get dates for the last 7 days
    const [dateRows] = await db.execute(`
      SELECT CURDATE() - INTERVAL 6 DAY as date
      UNION SELECT CURDATE() - INTERVAL 5 DAY
      UNION SELECT CURDATE() - INTERVAL 4 DAY
      UNION SELECT CURDATE() - INTERVAL 3 DAY
      UNION SELECT CURDATE() - INTERVAL 2 DAY
      UNION SELECT CURDATE() - INTERVAL 1 DAY
      UNION SELECT CURDATE()
    `);

    const dates = dateRows.map(r => r.date);

    // Get counts for each date
    const trendData = await Promise.all(dates.map(async (date) => {
      const dateStr = date.toISOString().split('T')[0];

      const [[users], [posts], [reports]] = await Promise.all([
        db.execute('SELECT COUNT(*) as count FROM user WHERE DATE(created_at) = ?', [dateStr]),
        db.execute('SELECT COUNT(*) as count FROM blog WHERE DATE(created_at) = ?', [dateStr]),
        db.execute('SELECT COUNT(*) as count FROM report WHERE DATE(created_at) = ?', [dateStr])
      ]);

      return {
        date: dateStr,
        new_users: users[0].count,
        new_posts: posts[0].count,
        new_reports: reports[0].count
      };
    }));

    res.json({
      code: 200,
      message: 'success',
      data: {
        userCount,
        postCount,
        activityCount,
        reportCount,
        pendingReportCount,
        trendData
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;