const express = require('express');
const router = express.Router();
const AntifraudModel = require('../../models/antifraud.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/news
 * @desc    Get news list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { type, status, keyword } = req.query;

    const result = await AntifraudModel.findAll({
      page,
      pageSize,
      type,
      status,
      keyword
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/news
 * @desc    Create news
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, summary, cover, content, type, tags, author, status, publishedAt } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ code: 400, message: '标题、内容和类型不能为空', data: null });
    }

    const newsId = await AntifraudModel.create({
      title,
      summary,
      cover,
      content,
      type,
      tags,
      author,
      publisher_id: req.admin.id,
      status,
      published_at: status == 1 ? new Date() : publishedAt
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { news_id: newsId }
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/news/:id
 * @desc    Update news
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, cover, content, type, tags, author, status, publishedAt } = req.body;

    const news = await AntifraudModel.findById(id);
    if (!news) {
      return res.status(404).json({ code: 404, message: '资讯不存在', data: null });
    }

    const updateData = { title, summary, cover, content, type, tags, author, status };
    if (status == 1 && news.status != 1) {
      updateData.published_at = new Date();
    } else if (publishedAt) {
      updateData.published_at = publishedAt;
    }

    await AntifraudModel.update(id, updateData);

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/news/:id
 * @desc    Delete news
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await AntifraudModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/news/batch
 * @desc    Batch delete news
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的资讯', data: null });
    }

    for (const id of ids) {
      await AntifraudModel.delete(id);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;