const express = require('express');
const router = express.Router();
const { ChapterModel, LessonModel } = require('../../models/classroom.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

// Chapter routes
router.get('/chapters', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { status } = req.query;

    const result = await ChapterModel.findAll({ page, pageSize, status });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.post('/chapters', authAdmin, async (req, res) => {
  try {
    const { title, summary, cover, sortOrder, status } = req.body;

    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const chapterId = await ChapterModel.create({
      title,
      summary,
      cover,
      sort_order: sortOrder,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { chapter_id: chapterId }
    });
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.put('/chapters/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, cover, sortOrder, status } = req.body;

    const chapter = await ChapterModel.findById(id);
    if (!chapter) {
      return res.status(404).json({ code: 404, message: '章节不存在', data: null });
    }

    await ChapterModel.update(id, {
      title,
      summary,
      cover,
      sort_order: sortOrder,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.delete('/chapters/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await ChapterModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

// Lesson routes
router.get('/lessons', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { chapterId, status } = req.query;

    const result = await LessonModel.findAll({
      page,
      pageSize,
      chapter_id: chapterId,
      status
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.post('/lessons', authAdmin, async (req, res) => {
  try {
    const { chapterId, title, summary, cover, videoUrl, duration, sortOrder, status } = req.body;

    if (!chapterId || !title || !videoUrl) {
      return res.status(400).json({ code: 400, message: '章节、标题和视频不能为空', data: null });
    }

    const lessonId = await LessonModel.create({
      chapter_id: chapterId,
      title,
      summary,
      cover,
      video_url: videoUrl,
      duration,
      sort_order: sortOrder,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { lesson_id: lessonId }
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.put('/lessons/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId, title, summary, cover, videoUrl, duration, sortOrder, status } = req.body;

    const lesson = await LessonModel.findById(id);
    if (!lesson) {
      return res.status(404).json({ code: 404, message: '课时不存在', data: null });
    }

    await LessonModel.update(id, {
      chapter_id: chapterId,
      title,
      summary,
      cover,
      video_url: videoUrl,
      duration,
      sort_order: sortOrder,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.delete('/lessons/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await LessonModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;