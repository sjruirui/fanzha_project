const express = require('express');
const router = express.Router();
const BannerModel = require('../../models/banner.model');
const { authAdmin } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/admin/banners
 * @desc    Get all banners
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const banners = await BannerModel.findAll();

    res.json({ code: 200, message: 'success', data: { banners } });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/banners
 * @desc    Create banner
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, image, link, sortOrder, status } = req.body;

    if (!image) {
      return res.status(400).json({ code: 400, message: '图片不能为空', data: null });
    }

    const bannerId = await BannerModel.create({
      title,
      image,
      link,
      sort_order: sortOrder,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { banner_id: bannerId }
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/banners/:id
 * @desc    Update banner
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, link, sortOrder, status } = req.body;

    const banner = await BannerModel.findById(id);
    if (!banner) {
      return res.status(404).json({ code: 404, message: '轮播图不存在', data: null });
    }

    await BannerModel.update(id, {
      title,
      image,
      link,
      sort_order: sortOrder,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/banners/:id
 * @desc    Delete banner
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await BannerModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;