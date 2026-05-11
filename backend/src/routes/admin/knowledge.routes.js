const express = require('express');
const router = express.Router();
const KnowledgeModel = require('../../models/knowledge.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/knowledge
 * @desc    Get knowledge list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { type, targetGroup, status, keyword } = req.query;

    const result = await KnowledgeModel.findAll({
      page,
      pageSize,
      type,
      target_group: targetGroup,
      status,
      keyword
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/knowledge
 * @desc    Create knowledge
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, summary, cover, content, type, targetGroup, tags, status } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ code: 400, message: '标题、内容和类型不能为空', data: null });
    }

    const knowledgeId = await KnowledgeModel.create({
      title,
      summary,
      cover,
      content,
      type,
      target_group: targetGroup,
      tags,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { knowledge_id: knowledgeId }
    });
  } catch (error) {
    console.error('Create knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/knowledge/:id
 * @desc    Update knowledge
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, cover, content, type, targetGroup, tags, status } = req.body;

    const knowledge = await KnowledgeModel.findById(id);
    if (!knowledge) {
      return res.status(404).json({ code: 404, message: '知识不存在', data: null });
    }

    await KnowledgeModel.update(id, {
      title,
      summary,
      cover,
      content,
      type,
      target_group: targetGroup,
      tags,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/knowledge/:id
 * @desc    Delete knowledge
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await KnowledgeModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/knowledge/batch
 * @desc    Batch delete knowledge
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的知识', data: null });
    }

    for (const id of ids) {
      await KnowledgeModel.delete(id);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;