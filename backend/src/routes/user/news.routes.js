const express = require('express');
const router = express.Router();
const AntifraudModel = require('../../models/antifraud.model');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/news
 * @desc    Get news list
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { type, keyword } = req.query;

    const result = await AntifraudModel.findAll({
      page,
      pageSize,
      type,
      status: 1, // Only published
      keyword
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get news list error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/news/:id
 * @desc    Get news detail
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const news = await AntifraudModel.findById(id);

    if (!news || news.status !== 1) {
      return res.status(404).json({ code: 404, message: '资讯不存在', data: null });
    }

    // Increment views
    await AntifraudModel.incrementViews(id);

    // Transform to camelCase
    const result = {
      id: news.id,
      title: news.title,
      summary: news.summary,
      cover: news.cover,
      content: news.content,
      type: news.type,
      tags: news.tags,
      author: news.author,
      views: news.views,
      status: news.status,
      createdAt: news.created_at,
      publishedAt: news.published_at
    };

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/news/:id/related
 * @desc    Get related news
 * @access  Public
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const news = await AntifraudModel.findById(id);

    if (!news) {
      return res.status(404).json({ code: 404, message: '资讯不存在', data: null });
    }

    const related = await AntifraudModel.getRelated(id, news.type, 5);

    // Transform to camelCase
    const list = related.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      cover: item.cover,
      type: item.type,
      views: item.views,
      createdAt: item.created_at
    }));

    res.json({ code: 200, message: 'success', data: list });
  } catch (error) {
    console.error('Get related news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;