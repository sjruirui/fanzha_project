const express = require('express');
const router = express.Router();
const NoticeModel = require('../../models/notice.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/notices
 * @desc    Get notices list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { status } = req.query;

    const result = await NoticeModel.findAll({ page, pageSize, status });

    // Transform to camelCase
    const list = result.list.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      status: item.status,
      createdAt: item.created_at,
      publishedAt: item.published_at,
      publisherName: item.publisher_name
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/notices
 * @desc    Create notice
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, content, status, publishedAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空', data: null });
    }

    const noticeId = await NoticeModel.create({
      title,
      content,
      publisher_id: req.admin.id,
      status,
      published_at: status == 1 ? new Date() : publishedAt
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { notice_id: noticeId }
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/notices/:id
 * @desc    Update notice
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, publishedAt } = req.body;

    const notice = await NoticeModel.findById(id);
    if (!notice) {
      return res.status(404).json({ code: 404, message: '公告不存在', data: null });
    }

    const updateData = { title, content, status };
    if (status == 1 && notice.status != 1) {
      updateData.published_at = new Date();
    } else if (publishedAt) {
      updateData.published_at = publishedAt;
    }

    await NoticeModel.update(id, updateData);

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/notices/:id
 * @desc    Delete notice
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await NoticeModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;