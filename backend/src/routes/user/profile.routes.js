const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user.model');
const { BlogModel } = require('../../models/community.model');
const { ActivitySignModel } = require('../../models/activity.model');
const { LikesModel, CollectModel } = require('../../models/interact.model');
const CommentModel = require('../../models/comment.model');
const ReportModel = require('../../models/report.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/', authUser, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: { user_info: user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authUser, async (req, res) => {
  try {
    const { nickname, avatar, bio } = req.body;

    await UserModel.update(req.user.id, { nickname, avatar, bio });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/user/profile/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', authUser, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '请输入旧密码和新密码', data: null });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '新密码至少6位', data: null });
    }

    const user = await UserModel.findByUsername(req.user.username);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '旧密码错误', data: null });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, hashedPassword);

    res.json({ code: 200, message: '密码修改成功', data: { success: true } });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/posts
 * @desc    Get user's posts
 * @access  Private
 */
router.get('/posts', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const result = await BlogModel.findByUserId(req.user.id, { page, pageSize });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/activities
 * @desc    Get user's activities
 * @access  Private
 */
router.get('/activities', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const result = await ActivitySignModel.findByUserId(req.user.id, { page, pageSize });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/likes
 * @desc    Get user's likes
 * @access  Private
 */
router.get('/likes', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { targetType } = req.query;

    const result = await LikesModel.findByUserId(req.user.id, { page, pageSize, target_type: targetType });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/collects
 * @desc    Get user's collects
 * @access  Private
 */
router.get('/collects', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { targetType } = req.query;

    const result = await CollectModel.findByUserId(req.user.id, { page, pageSize, target_type: targetType });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user collects error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/comments
 * @desc    Get user's comments
 * @access  Private
 */
router.get('/comments', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { targetType } = req.query;

    const result = await CommentModel.findByUserId(req.user.id, { page, pageSize, target_type: targetType });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/profile/reports
 * @desc    Get user's reports
 * @access  Private
 */
router.get('/reports', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);

    const result = await ReportModel.findByUserId(req.user.id, { page, pageSize });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;