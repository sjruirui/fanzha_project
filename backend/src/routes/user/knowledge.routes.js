const express = require('express');
const router = express.Router();
const KnowledgeModel = require('../../models/knowledge.model');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/knowledge
 * @desc    Get knowledge list
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { type, targetGroup, keyword } = req.query;

    const result = await KnowledgeModel.findAll({
      page,
      pageSize,
      type,
      target_group: targetGroup,
      status: 1,
      keyword
    });

    // Transform to camelCase
    const list = result.list.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      cover: item.cover,
      content: item.content,
      type: item.type,
      targetGroup: item.target_group,
      tags: item.tags,
      views: item.views,
      status: item.status,
      createdAt: item.created_at
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get knowledge list error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/knowledge/:id
 * @desc    Get knowledge detail
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await KnowledgeModel.findById(id);

    if (!knowledge || knowledge.status !== 1) {
      return res.status(404).json({ code: 404, message: '知识不存在', data: null });
    }

    // Increment views
    await KnowledgeModel.incrementViews(id);

    // Transform to camelCase
    const result = {
      id: knowledge.id,
      title: knowledge.title,
      summary: knowledge.summary,
      cover: knowledge.cover,
      content: knowledge.content,
      type: knowledge.type,
      targetGroup: knowledge.target_group,
      tags: knowledge.tags,
      views: knowledge.views,
      status: knowledge.status,
      createdAt: knowledge.created_at
    };

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get knowledge detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/knowledge/:id/related
 * @desc    Get related knowledge
 * @access  Public
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await KnowledgeModel.findById(id);

    if (!knowledge) {
      return res.status(404).json({ code: 404, message: '知识不存在', data: null });
    }

    const related = await KnowledgeModel.getRelated(id, knowledge.type, 5);

    // Transform to camelCase
    const list = related.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      cover: item.cover,
      type: item.type,
      targetGroup: item.target_group,
      views: item.views,
      createdAt: item.created_at
    }));

    res.json({ code: 200, message: 'success', data: list });
  } catch (error) {
    console.error('Get related knowledge error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;