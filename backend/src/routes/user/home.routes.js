const express = require('express');
const router = express.Router();
const BannerModel = require('../../models/banner.model');
const AntifraudModel = require('../../models/antifraud.model');
const KnowledgeModel = require('../../models/knowledge.model');
const { ActivityModel } = require('../../models/activity.model');

/**
 * @route   GET /api/user/home/banners
 * @desc    Get banners for homepage
 * @access  Public
 */
router.get('/banners', async (req, res) => {
  try {
    const banners = await BannerModel.findPublished();
    res.json({ code: 200, message: 'success', data: { banners } });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/home/recommend
 * @desc    Get recommended content for homepage
 * @access  Public
 */
router.get('/recommend', async (req, res) => {
  try {
    const [news, knowledge, activities] = await Promise.all([
      AntifraudModel.getLatest(5),
      KnowledgeModel.getLatest(5),
      ActivityModel.getLatest(3)
    ]);

    res.json({
      code: 200,
      message: 'success',
      data: {
        news,
        knowledge,
        activities
      }
    });
  } catch (error) {
    console.error('Get recommend error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;