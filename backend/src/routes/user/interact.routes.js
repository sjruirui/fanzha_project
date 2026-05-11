const express = require('express');
const router = express.Router();
const { LikesModel, CollectModel } = require('../../models/interact.model');
const { BlogModel } = require('../../models/community.model');
const { ActivityModel } = require('../../models/activity.model');
const { AntifraudModel } = require('../../models/antifraud.model');
const { KnowledgeModel } = require('../../models/knowledge.model');
const { authUser } = require('../../middleware/auth.middleware');

// Helper to update likes/collects count
const updateTargetCount = async (targetType, targetId, field, delta) => {
  switch (targetType) {
    case 1: // Blog
      await BlogModel[`update${field}Count`](targetId, delta);
      break;
    case 2: // Activity
      await ActivityModel[`update${field}Count`](targetId, delta);
      break;
    case 3: // Antifraud
      // No count field for antifraud
      break;
    case 4: // Knowledge
      // No count field for knowledge
      break;
  }
};

/**
 * @route   POST /api/user/interact/like
 * @desc    Like a target
 * @access  Private
 */
router.post('/like', authUser, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    // Check if already liked
    const existing = await LikesModel.findByUserAndTarget(req.user.id, targetType, targetId);
    if (existing) {
      return res.status(400).json({ code: 400, message: '已点赞', data: null });
    }

    await LikesModel.create({
      user_id: req.user.id,
      target_type: targetType,
      target_id: targetId
    });

    // Update count
    await updateTargetCount(targetType, targetId, 'Likes', 1);

    res.json({ code: 200, message: '点赞成功', data: { success: true } });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/interact/like
 * @desc    Unlike a target
 * @access  Private
 */
router.delete('/like', authUser, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    const deleted = await LikesModel.delete(req.user.id, targetType, targetId);
    if (!deleted) {
      return res.status(400).json({ code: 400, message: '未点赞', data: null });
    }

    // Update count
    await updateTargetCount(targetType, targetId, 'Likes', -1);

    res.json({ code: 200, message: '取消点赞成功', data: { success: true } });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/interact/collect
 * @desc    Collect a target
 * @access  Private
 */
router.post('/collect', authUser, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    // Check if already collected
    const existing = await CollectModel.findByUserAndTarget(req.user.id, targetType, targetId);
    if (existing) {
      return res.status(400).json({ code: 400, message: '已收藏', data: null });
    }

    await CollectModel.create({
      user_id: req.user.id,
      target_type: targetType,
      target_id: targetId
    });

    // Update count
    await updateTargetCount(targetType, targetId, 'Collects', 1);

    res.json({ code: 200, message: '收藏成功', data: { success: true } });
  } catch (error) {
    console.error('Collect error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/interact/collect
 * @desc    Uncollect a target
 * @access  Private
 */
router.delete('/collect', authUser, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    const deleted = await CollectModel.delete(req.user.id, targetType, targetId);
    if (!deleted) {
      return res.status(400).json({ code: 400, message: '未收藏', data: null });
    }

    // Update count
    await updateTargetCount(targetType, targetId, 'Collects', -1);

    res.json({ code: 200, message: '取消收藏成功', data: { success: true } });
  } catch (error) {
    console.error('Uncollect error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/interact/status
 * @desc    Check like/collect status
 * @access  Private
 */
router.get('/status', authUser, async (req, res) => {
  try {
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    const like = await LikesModel.findByUserAndTarget(req.user.id, targetType, targetId);
    const collect = await CollectModel.findByUserAndTarget(req.user.id, targetType, targetId);

    res.json({
      code: 200,
      message: 'success',
      data: {
        isLiked: !!like,
        isCollected: !!collect
      }
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;