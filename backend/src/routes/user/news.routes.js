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

    res.json({ code: 200, message: 'success', data: { news_detail: news } });
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

    res.json({ code: 200, message: 'success', data: { related_news: related } });
  } catch (error) {
    console.error('Get related news error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;