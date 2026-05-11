const express = require('express');
const router = express.Router();
const ReportModel = require('../../models/report.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/reports
 * @desc    Get reports list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { type, status } = req.query;

    const result = await ReportModel.findAll({
      page,
      pageSize,
      type,
      status
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/admin/reports/:id
 * @desc    Get report detail
 * @access  Private (Admin)
 */
router.get('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportModel.findById(id);

    if (!report) {
      return res.status(404).json({ code: 404, message: '举报不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: { report_detail: report } });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/reports/:id
 * @desc    Handle report
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (status === undefined) {
      return res.status(400).json({ code: 400, message: '请选择处理状态', data: null });
    }

    const report = await ReportModel.findById(id);
    if (!report) {
      return res.status(404).json({ code: 404, message: '举报不存在', data: null });
    }

    await ReportModel.update(id, {
      status,
      remark,
      handler_id: req.admin.id,
      handled_at: new Date()
    });

    res.json({ code: 200, message: '处理成功', data: { success: true } });
  } catch (error) {
    console.error('Handle report error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/reports/:id
 * @desc    Delete report
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await ReportModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;