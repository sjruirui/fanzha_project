const express = require('express');
const router = express.Router();
const { BlogModel } = require('../../models/community.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/posts
 * @desc    Get posts list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { categoryId, status, keyword } = req.query;

    const result = await BlogModel.findAll({
      page,
      pageSize,
      category_id: categoryId,
      status,
      keyword
    });

    // Transform field names to camelCase
    const list = result.list.map(post => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover: post.cover,
      content: post.content,
      tags: post.tags,
      views: post.views,
      likes: post.likes_count,
      comments: post.comments_count,
      collects: post.collects_count,
      status: post.status,
      createdAt: post.created_at,
      categoryId: post.category_id,
      categoryName: post.category_name,
      userId: post.user_id,
      author: {
        id: post.user_id,
        nickname: post.author_nickname,
        avatar: post.author_avatar
      }
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/posts/:id
 * @desc    Update post
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, title, summary, cover, content, tags, status } = req.body;

    const post = await BlogModel.findById(id);
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    await BlogModel.update(id, {
      category_id: categoryId,
      title,
      summary,
      cover,
      content,
      tags,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/posts/:id/audit
 * @desc    Audit post
 * @access  Private (Admin)
 */
router.put('/:id/audit', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ code: 400, message: '请选择审核状态', data: null });
    }

    const post = await BlogModel.findById(id);
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    await BlogModel.update(id, { status });

    res.json({ code: 200, message: '审核成功', data: { success: true } });
  } catch (error) {
    console.error('Audit post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/posts/:id
 * @desc    Delete post
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await BlogModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/posts/batch
 * @desc    Batch delete posts
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的帖子', data: null });
    }

    for (const id of ids) {
      await BlogModel.delete(id);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete posts error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;