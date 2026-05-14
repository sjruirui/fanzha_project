const express = require('express');
const router = express.Router();
const { QuizModel, QuestionModel, UserQuizRecordModel } = require('../../models/quiz.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/quiz/levels
 * @desc    Get quiz levels
 * @access  Public
 */
router.get('/levels', async (req, res) => {
  try {
    const rawLevels = await QuizModel.findAllPublished();

    // Transform field names to camelCase
    const levels = rawLevels.map(level => ({
      id: level.id,
      title: level.title,
      description: level.description,
      difficulty: level.difficulty,
      sortOrder: level.sort_order,
      questionCount: 0 // Will be updated below
    }));

    // Get question count for each level
    for (const level of levels) {
      const questions = await QuestionModel.findByQuizId(level.id);
      level.questionCount = questions.length;
    }

    res.json({ code: 200, message: 'success', data: { levels } });
  } catch (error) {
    console.error('Get quiz levels error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/quiz/levels/:id/questions
 * @desc    Get questions for a quiz level
 * @access  Public
 */
router.get('/levels/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await QuizModel.findById(id);

    if (!quiz || quiz.status !== 1) {
      return res.status(404).json({ code: 404, message: '关卡不存在', data: null });
    }

    const rawQuestions = await QuestionModel.findByQuizId(id);

    // Transform field names to camelCase and convert type number to string
    const questions = rawQuestions.map(q => ({
      id: q.id,
      quizId: id,
      title: q.title,
      type: q.type === 2 ? 'multiple' : 'single',
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      sortOrder: q.sort_order
    }));

    res.json({
      code: 200,
      message: 'success',
      data: {
        quiz,
        questions
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/quiz/levels/:id/submit
 * @desc    Submit quiz answers
 * @access  Private
 */
router.post('/levels/:id/submit', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // [{ questionId, answer }, ...]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ code: 400, message: '请提交答案', data: null });
    }

    const quiz = await QuizModel.findById(id);
    if (!quiz || quiz.status !== 1) {
      return res.status(404).json({ code: 404, message: '关卡不存在', data: null });
    }

    // Get all questions with answers
    const questions = await QuestionModel.findByQuizIdWithAnswers(id);
    const totalQuestions = questions.length;

    // Calculate score
    let correctCount = 0;
    const answerRecords = [];

    for (const q of questions) {
      const userAnswer = answers.find(a => a.questionId === q.id);
      // Normalize answers for comparison (sort and uppercase)
      const normalizeAnswer = (ans) => {
        if (!ans) return '';
        return ans.toUpperCase().split(',').map(a => a.trim()).filter(a => a).sort().join(',');
      };
      const userAnsNormalized = normalizeAnswer(userAnswer?.answer);
      const correctAnsNormalized = normalizeAnswer(q.answer);
      const isCorrect = userAnsNormalized === correctAnsNormalized;

      if (isCorrect) {
        correctCount++;
      }

      answerRecords.push({
        questionId: q.id,
        userAnswer: userAnswer?.answer || '',
        correctAnswer: q.answer,
        isCorrect
      });
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 60; // Pass threshold: 60%

    // Save record
    await UserQuizRecordModel.create({
      user_id: req.user.id,
      quiz_id: id,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      answers: JSON.stringify(answerRecords),
      passed
    });

    res.json({
      code: 200,
      message: passed ? '恭喜通关！' : '继续加油！',
      data: {
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        passed,
        answer_records: answerRecords
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/quiz/records
 * @desc    Get user quiz records
 * @access  Private
 */
router.get('/records', authUser, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);

    const result = await UserQuizRecordModel.findByUserId(req.user.id, { page, pageSize });

    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    console.error('Get quiz records error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;