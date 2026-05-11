const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const AdminModel = require('../../models/admin.model');
const { authAdmin, isSuperAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/admins
 * @desc    Get admins list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { keyword } = req.query;

    const result = await AdminModel.findAll({ page, pageSize, keyword });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/admins
 * @desc    Create admin
 * @access  Private (Super Admin)
 */
router.post('/', authAdmin, isSuperAdmin, async (req, res) => {
  try {
    const { username, password, nickname, phone, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    const existing = await AdminModel.findByUsername(username);
    if (existing) {
      return res.status(400).json({ code: 400, message: '用户名已存在', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = await AdminModel.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      phone,
      email,
      role: role || 1
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { admin_id: adminId }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/admins/:id
 * @desc    Update admin
 * @access  Private (Super Admin)
 */
router.put('/:id', authAdmin, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, phone, email, avatar, role, status } = req.body;

    const admin = await AdminModel.findById(id);
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在', data: null });
    }

    await AdminModel.update(id, { nickname, phone, email, avatar, role, status });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Delete admin
 * @access  Private (Super Admin)
 */
router.delete('/:id', authAdmin, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ code: 400, message: '不能删除自己', data: null });
    }

    const admin = await AdminModel.findById(id);
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在', data: null });
    }

    await AdminModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;