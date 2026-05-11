const express = require('express');
const router = express.Router();
const { QuizModel, QuestionModel } = require('../../models/quiz.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

// Quiz level routes
router.get('/levels', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { status } = req.query;

    const result = await QuizModel.findAll({ page, pageSize, status });

    // Get question count for each quiz
    for (const quiz of result.list) {
      const questions = await QuestionModel.findByQuizId(quiz.id);
      quiz.question_count = questions.length;
    }

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get quiz levels error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.post('/levels', authAdmin, async (req, res) => {
  try {
    const { title, description, difficulty, sortOrder, status } = req.body;

    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const quizId = await QuizModel.create({
      title,
      description,
      difficulty,
      sort_order: sortOrder,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { level_id: quizId }
    });
  } catch (error) {
    console.error('Create quiz level error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.put('/levels/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, sortOrder, status } = req.body;

    const quiz = await QuizModel.findById(id);
    if (!quiz) {
      return res.status(404).json({ code: 404, message: '关卡不存在', data: null });
    }

    await QuizModel.update(id, {
      title,
      description,
      difficulty,
      sort_order: sortOrder,
      status
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update quiz level error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.delete('/levels/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await QuizModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete quiz level error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

// Question routes
router.get('/questions', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { quizId } = req.query;

    const result = await QuestionModel.findAll({
      page,
      pageSize,
      quiz_id: quizId
    });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.post('/questions', authAdmin, async (req, res) => {
  try {
    const { quizId, title, type, optionA, optionB, optionC, optionD, answer, explanation, sortOrder } = req.body;

    if (!quizId || !title || !optionA || !optionB || !answer) {
      return res.status(400).json({ code: 400, message: '关卡、题目、选项A、选项B和答案不能为空', data: null });
    }

    const questionId = await QuestionModel.create({
      quiz_id: quizId,
      title,
      type,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      answer,
      explanation,
      sort_order: sortOrder
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { question_id: questionId }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.put('/questions/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { quizId, title, type, optionA, optionB, optionC, optionD, answer, explanation, sortOrder } = req.body;

    const question = await QuestionModel.findById(id);
    if (!question) {
      return res.status(404).json({ code: 404, message: '题目不存在', data: null });
    }

    await QuestionModel.update(id, {
      quiz_id: quizId,
      title,
      type,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      answer,
      explanation,
      sort_order: sortOrder
    });

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

router.delete('/questions/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await QuestionModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;