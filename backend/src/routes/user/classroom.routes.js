const express = require('express');
const router = express.Router();
const { ChapterModel, LessonModel } = require('../../models/classroom.model');

/**
 * @route   GET /api/user/classroom/chapters
 * @desc    Get all chapters
 * @access  Public
 */
router.get('/chapters', async (req, res) => {
  try {
    const chapters = await ChapterModel.findAllPublished();

    // Get lesson count for each chapter and transform to camelCase
    const result = [];
    for (const chapter of chapters) {
      const lessons = await LessonModel.findByChapterId(chapter.id);
      result.push({
        id: chapter.id,
        title: chapter.title,
        summary: chapter.summary,
        cover: chapter.cover,
        sortOrder: chapter.sort_order,
        status: chapter.status,
        lessonCount: lessons.length,
        createdAt: chapter.created_at
      });
    }

    res.json({ code: 200, message: 'success', data: { chapters: result } });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/classroom/chapters/:id/lessons
 * @desc    Get lessons by chapter
 * @access  Public
 */
router.get('/chapters/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await ChapterModel.findById(id);

    if (!chapter || chapter.status !== 1) {
      return res.status(404).json({ code: 404, message: '章节不存在', data: null });
    }

    const lessons = await LessonModel.findByChapterId(id);

    // Transform to camelCase
    const lessonList = lessons.map(lesson => ({
      id: lesson.id,
      chapterId: lesson.chapter_id,
      title: lesson.title,
      summary: lesson.summary,
      cover: lesson.cover,
      videoUrl: lesson.video_url,
      duration: lesson.duration,
      sortOrder: lesson.sort_order,
      views: lesson.views || 0,
      createdAt: lesson.created_at
    }));

    res.json({ code: 200, message: 'success', data: { lessons: lessonList, chapter } });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/classroom/lessons/:id
 * @desc    Get lesson detail
 * @access  Public
 */
router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await LessonModel.findById(id);

    if (!lesson || lesson.status !== 1) {
      return res.status(404).json({ code: 404, message: '课时不存在', data: null });
    }

    // Transform to camelCase
    const result = {
      id: lesson.id,
      chapterId: lesson.chapter_id,
      title: lesson.title,
      summary: lesson.summary,
      cover: lesson.cover,
      videoUrl: lesson.video_url,
      duration: lesson.duration,
      sortOrder: lesson.sort_order,
      views: lesson.views || 0,
      createdAt: lesson.created_at
    };

    res.json({
      code: 200,
      message: 'success',
      data: result
    });
  } catch (error) {
    console.error('Get lesson detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;