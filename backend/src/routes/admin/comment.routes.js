const express = require('express');
const router = express.Router();
const CommentModel = require('../../models/comment.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/comments
 * @desc    Get comments list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { targetType } = req.query;

    const result = await CommentModel.findAll({
      page,
      pageSize,
      target_type: targetType
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/comments/:id
 * @desc    Delete comment
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await CommentModel.updateStatus(id, 0);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/comments/batch
 * @desc    Batch delete comments
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的评论', data: null });
    }

    for (const id of ids) {
      await CommentModel.updateStatus(id, 0);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete comments error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;