const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user.model');
const AdminModel = require('../../models/admin.model');
const { generateToken, authUser } = require('../../middleware/auth.middleware');
const { isUsername, isPassword, isPhone, validateRequired } = require('../../middleware/validation.middleware');

/**
 * @route   POST /api/user/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    if (user.status !== 1) {
      return res.status(400).json({ code: 400, message: '账号已被禁用', data: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    const token = generateToken({ id: user.id, username: user.username, type: 'user' });

    const { password: _, ...userInfo } = user;

    res.json({
      code: 200,
      message: '登录成功',
      data: { token, user_info: userInfo }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/auth/register
 * @desc    User registration
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    // Validation
    const errors = validateRequired(req.body, ['username', 'phone', 'password']);
    if (errors.length > 0) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: errors });
    }

    if (!isUsername(username)) {
      return res.status(400).json({ code: 400, message: '用户名需要3-20位字母数字下划线', data: null });
    }

    if (!isPhone(phone)) {
      return res.status(400).json({ code: 400, message: '请输入正确的手机号', data: null });
    }

    if (!isPassword(password)) {
      return res.status(400).json({ code: 400, message: '密码至少6位', data: null });
    }

    // Check if exists
    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ code: 400, message: '用户名已存在', data: null });
    }

    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ code: 400, message: '手机号已注册', data: null });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      username,
      phone,
      password: hashedPassword,
      nickname: username
    });

    const user = await UserModel.findById(userId);
    const token = generateToken({ id: user.id, username: user.username, type: 'user' });

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: { token, user_info: user }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/auth/info
 * @desc    Get current user info
 * @access  Private
 */
router.get('/info', authUser, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: { user_info: user } });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', authUser, (req, res) => {
  res.json({ code: 200, message: '退出成功', data: { success: true } });
});

module.exports = router;