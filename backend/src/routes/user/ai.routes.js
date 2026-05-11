const express = require('express');
const router = express.Router();
const { AISessionModel, AIMessageModel } = require('../../models/ai.model');
const { authUser } = require('../../middleware/auth.middleware');
const axios = require('axios');
const config = require('../../config');

/**
 * @route   POST /api/user/ai/session
 * @desc    Create AI session
 * @access  Private
 */
router.post('/session', authUser, async (req, res) => {
  try {
    const { mode, scenario } = req.body;

    if (!mode) {
      return res.status(400).json({ code: 400, message: '请选择模式', data: null });
    }

    const result = await AISessionModel.create({
      user_id: req.user.id,
      mode,
      scenario
    });

    res.json({
      code: 200,
      message: 'success',
      data: { session_id: result.session_id }
    });
  } catch (error) {
    console.error('Create AI session error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/ai/chat
 * @desc    Send message to AI (SSE streaming)
 * @access  Private
 */
router.post('/chat', authUser, async (req, res) => {
  try {
    const { sessionId, content } = req.body;

    if (!sessionId || !content) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    // Verify session belongs to user
    const session = await AISessionModel.findBySessionId(sessionId);
    if (!session || session.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无效会话', data: null });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Save user message
    await AIMessageModel.create({
      session_id: session.id,
      role: 1, // User
      content
    });

    // Build prompt based on mode
    let systemPrompt = '';
    if (session.mode === 1) {
      // Smart Q&A mode
      systemPrompt = '你是一个专业的反诈骗助手，帮助用户识别和防范各类诈骗行为。请根据用户的问题提供专业、准确的建议。';
    } else if (session.mode === 2) {
      // Scenario simulation mode
      systemPrompt = `你是一个反诈骗情景模拟助手，正在模拟${session.scenario || '电信诈骗'}场景。请扮演诈骗者的角色，通过对话让用户学会识别诈骗手法。在对话中适当暴露诈骗特征，帮助用户提高警惕。`;
    }

    // Call AI API (通义千问)
    try {
      const response = await axios.post(
        config.ai.apiUrl,
        {
          model: 'qwen-turbo',
          input: {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content }
            ]
          },
          parameters: {
            result_type: 'text'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.ai.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiContent = response.data.output?.text || '抱歉，我暂时无法回答这个问题。';

      // Save AI message
      await AIMessageModel.create({
        session_id: session.id,
        role: 2, // AI
        content: aiContent
      });

      // Send SSE response
      res.write(`data: ${JSON.stringify({ content: aiContent })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (aiError) {
      console.error('AI API error:', aiError.message);
      res.write(`data: ${JSON.stringify({ error: 'AI服务暂时不可用' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: '服务器错误', data: null });
    }
  }
});

/**
 * @route   GET /api/user/ai/session/:sessionId/messages
 * @desc    Get session messages
 * @access  Private
 */
router.get('/session/:sessionId/messages', authUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AISessionModel.findBySessionId(sessionId);
    if (!session || session.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无效会话', data: null });
    }

    const messages = await AIMessageModel.findBySessionId(session.id);

    res.json({ code: 200, message: 'success', data: { messages } });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/ai/session/:sessionId
 * @desc    Clear session
 * @access  Private
 */
router.delete('/session/:sessionId', authUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AISessionModel.findBySessionId(sessionId);
    if (!session || session.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无效会话', data: null });
    }

    await AIMessageModel.deleteBySessionId(session.id);
    await AISessionModel.delete(sessionId);

    res.json({ code: 200, message: '清空成功', data: { success: true } });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;