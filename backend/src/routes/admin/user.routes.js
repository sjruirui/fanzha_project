const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination, isPassword } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/users
 * @desc    Get users list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { keyword } = req.query;

    const result = await UserModel.findAll({ page, pageSize, keyword });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create user
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { username, password, nickname, phone, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    // Check if exists
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return res.status(400).json({ code: 400, message: '用户名已存在', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      phone,
      email
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { user_id: userId }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, phone, email, avatar, bio, status } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    await UserModel.update(id, { nickname, phone, email, avatar, bio, status });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    await UserModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/users/batch
 * @desc    Batch delete users
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的用户', data: null });
    }

    for (const id of ids) {
      await UserModel.delete(id);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete users error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;