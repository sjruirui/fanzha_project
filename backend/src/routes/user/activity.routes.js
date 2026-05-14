const express = require('express');
const router = express.Router();
const { ActivityModel, ActivitySignModel } = require('../../models/activity.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/activities
 * @desc    Get activities list
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { form, keyword } = req.query;

    // Convert form filter string to number
    const formNum = form === 'offline' ? 2 : (form === 'online' ? 1 : '');

    const result = await ActivityModel.findAll({
      page,
      pageSize,
      form: formNum,
      status: 1,
      keyword
    });

    // Transform field names to camelCase and convert form number to string
    const list = result.list.map(activity => ({
      id: activity.id,
      title: activity.title,
      summary: activity.summary,
      cover: activity.cover,
      organizer: activity.organizer,
      form: activity.form === 2 ? 'offline' : 'online',
      address: activity.address,
      startTime: activity.start_time,
      endTime: activity.end_time,
      views: activity.views,
      likes: activity.likes_count,
      comments: activity.comments_count,
      collects: activity.collects_count,
      signs: activity.signs_count,
      status: activity.status,
      createdAt: activity.created_at
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/activities/:id
 * @desc    Get activity detail
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await ActivityModel.findById(id);

    if (!activity || activity.status !== 1) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }

    // Increment views
    await ActivityModel.incrementViews(id);

    res.json({ code: 200, message: 'success', data: { activity_detail: activity } });
  } catch (error) {
    console.error('Get activity detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/activities/:id/sign
 * @desc    Sign up for activity
 * @access  Private
 */
router.post('/:id/sign', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await ActivityModel.findById(id);

    if (!activity || activity.status !== 1) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }

    // Check if already signed up
    const existingSign = await ActivitySignModel.findByUserAndActivity(req.user.id, id);
    if (existingSign) {
      if (existingSign.status === 1) {
        return res.status(400).json({ code: 400, message: '您已报名此活动', data: null });
      } else {
        // Re-sign
        await ActivitySignModel.updateStatus(existingSign.id, 1);
        await ActivityModel.updateSignsCount(id, 1);
        return res.json({ code: 200, message: '报名成功', data: { success: true } });
      }
    }

    await ActivitySignModel.create({
      user_id: req.user.id,
      activity_id: id
    });

    // Update signs count
    await ActivityModel.updateSignsCount(id, 1);

    res.json({ code: 200, message: '报名成功', data: { success: true } });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/activities/:id/sign
 * @desc    Cancel sign up
 * @access  Private
 */
router.delete('/:id/sign', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const sign = await ActivitySignModel.findByUserAndActivity(req.user.id, id);

    if (!sign || sign.status !== 1) {
      return res.status(400).json({ code: 400, message: '您未报名此活动', data: null });
    }

    await ActivitySignModel.updateStatus(sign.id, 0);
    await ActivityModel.updateSignsCount(id, -1);

    res.json({ code: 200, message: '取消报名成功', data: { success: true } });
  } catch (error) {
    console.error('Cancel sign up error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/activities/:id/sign-status
 * @desc    Check sign up status
 * @access  Private
 */
router.get('/:id/sign-status', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const sign = await ActivitySignModel.findByUserAndActivity(req.user.id, id);

    res.json({
      code: 200,
      message: 'success',
      data: { is_signed: sign && sign.status === 1 }
    });
  } catch (error) {
    console.error('Check sign status error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;