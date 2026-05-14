const express = require('express');
const router = express.Router();
const { CategoryModel, BlogModel } = require('../../models/community.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/community/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json({ code: 200, message: 'success', data: { categories } });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/community/posts
 * @desc    Get posts list
 * @access  Public
 */
router.get('/posts', async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { categoryId, keyword } = req.query;

    const result = await BlogModel.findAll({
      page,
      pageSize,
      category_id: categoryId,
      status: 1, // Only approved posts
      keyword
    });

    // Transform field names to camelCase
    const list = result.list.map(post => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      cover: post.cover,
      tags: post.tags,
      views: post.views,
      likes: post.likes_count,
      comments: post.comments_count,
      collects: post.collects_count,
      status: post.status,
      createdAt: post.created_at,
      categoryName: post.category_name,
      author: {
        nickname: post.author_nickname,
        avatar: post.author_avatar
      }
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get posts list error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/community/posts/:id
 * @desc    Get post detail
 * @access  Public
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogModel.findById(id);

    if (!post || post.status !== 1) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    // Increment views
    await BlogModel.incrementViews(id);

    res.json({ code: 200, message: 'success', data: { post_detail: post } });
  } catch (error) {
    console.error('Get post detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/community/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/posts', authUser, async (req, res) => {
  try {
    const { categoryId, title, summary, cover, content, tags } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ code: 400, message: '标题、内容和分类不能为空', data: null });
    }

    const postId = await BlogModel.create({
      user_id: req.user.id,
      category_id: categoryId,
      title,
      summary,
      cover,
      content,
      tags
    });

    res.status(201).json({
      code: 200,
      message: '发布成功，等待审核',
      data: { post_id: postId }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/user/community/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/posts/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogModel.findById(id);

    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权修改此帖子', data: null });
    }

    const { categoryId, title, summary, cover, content, tags } = req.body;

    await BlogModel.update(id, {
      category_id: categoryId,
      title,
      summary,
      cover,
      content,
      tags,
      status: 0 // Reset to pending review
    });

    res.json({ code: 200, message: '修改成功，等待审核', data: { success: true } });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/community/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/posts/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogModel.findById(id);

    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权删除此帖子', data: null });
    }

    await BlogModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;