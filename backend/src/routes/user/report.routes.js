const express = require('express');
const router = express.Router();
const ReportModel = require('../../models/report.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   POST /api/user/reports
 * @desc    Submit a report
 * @access  Private
 */
router.post('/', authUser, async (req, res) => {
  try {
    const { title, type, amount, description, evidence } = req.body;

    if (!title || !type || !description) {
      return res.status(400).json({ code: 400, message: '标题、类型和描述不能为空', data: null });
    }

    const reportId = await ReportModel.create({
      user_id: req.user.id,
      title,
      type,
      amount,
      description,
      evidence: evidence ? JSON.stringify(evidence) : null
    });

    res.status(201).json({
      code: 200,
      message: '举报提交成功',
      data: { report_id: reportId }
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/reports
 * @desc    Get user's reports
 * @access  Private
 */
router.get('/', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);

    const result = await ReportModel.findByUserId(req.user.id, { page, pageSize });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/reports/:id
 * @desc    Get report detail
 * @access  Private
 */
router.get('/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportModel.findById(id);

    if (!report) {
      return res.status(404).json({ code: 404, message: '举报不存在', data: null });
    }

    if (report.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权查看此举报', data: null });
    }

    res.json({ code: 200, message: 'success', data: { report_detail: report } });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;