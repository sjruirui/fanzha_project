const express = require('express');
const router = express.Router();
const { CategoryModel } = require('../../models/community.model');
const { authAdmin } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();

    res.json({ code: 200, message: 'success', data: { categories } });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create category
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ code: 400, message: '分类名称不能为空', data: null });
    }

    const categoryId = await CategoryModel.create({
      name,
      description,
      sort_order: sortOrder
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { category_id: categoryId }
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '分类名称已存在', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在', data: null });
    }

    await CategoryModel.update(id, {
      name,
      description,
      sort_order: sortOrder
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await CategoryModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;