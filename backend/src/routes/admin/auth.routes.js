const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const AdminModel = require('../../models/admin.model');
const { generateToken, authAdmin } = require('../../middleware/auth.middleware');

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    const admin = await AdminModel.findByUsername(username);
    if (!admin) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    if (admin.status !== 1) {
      return res.status(400).json({ code: 400, message: '账号已被禁用', data: null });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin'
    });

    const { password: _, ...adminInfo } = admin;

    res.json({
      code: 200,
      message: '登录成功',
      data: { token, admin_info: adminInfo }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/admin/auth/info
 * @desc    Get current admin info
 * @access  Private
 */
router.get('/info', authAdmin, async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在', data: null });
    }

    res.json({ code: 200, message: 'success', data: { admin_info: admin } });
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Admin logout
 * @access  Private
 */
router.post('/logout', authAdmin, (req, res) => {
  res.json({ code: 200, message: '退出成功', data: { success: true } });
});

module.exports = router;