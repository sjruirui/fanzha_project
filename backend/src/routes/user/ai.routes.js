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
      data: { sessionId: result.session_id }
    });
  } catch (error) {
    console.error('Create AI session error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/user/ai/chat
 * @desc    Send message to AI (SSE streaming)
 * @access  Private
 */
router.get('/chat', authUser, async (req, res) => {
  try {
    const { sessionId, content } = req.query;

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
    res.setHeader('X-Accel-Buffering', 'no');

    // Save user message
    await AIMessageModel.create({
      session_id: session.id,
      role: 1, // User
      content
    });

    // Get conversation history
    const historyMessages = await AIMessageModel.findBySessionId(session.id);

    // Build messages array for AI
    const messages = [];

    // System prompt based on mode
    let systemPrompt = '';
    if (session.mode === 'chat') {
      systemPrompt = '你是一个专业的反诈骗助手，帮助用户识别和防范各类诈骗行为。请根据用户的问题提供专业、准确的建议。回答要简洁明了，不要过于冗长。';
    } else if (session.mode === 'scenario') {
      const scenarioNames = {
        'gongjia': '冒充公检法诈骗',
        'shuadan': '刷单返利诈骗',
        'shazhu': '杀猪盘诈骗',
        'wangdai': '虚假网贷诈骗'
      };
      const scenarioName = scenarioNames[session.scenario] || '电信诈骗';
      systemPrompt = `你是一个反诈骗情景模拟助手，正在模拟"${scenarioName}"场景。

请扮演诈骗者的角色，通过对话让用户学会识别诈骗手法。要求：
1. 用自然、真实的语气进行对话，模拟真实的诈骗场景
2. 在对话中适当暴露诈骗特征（如：要求转账、索要银行卡信息、诱导点击链接等）
3. 如果用户表现出警惕或识破诈骗，要给予正面反馈并解释该诈骗的典型特征
4. 不要过于明显地暴露诈骗意图，要像真实诈骗者一样循序渐进
5. 每次回复控制在100字以内，保持对话流畅

现在开始模拟${scenarioName}场景，你可以先主动发起对话。`;
    }
    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history (limit to last 10 messages to avoid token limit)
    const recentHistory = historyMessages.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 1 ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({ role: 'user', content });

    // Call AI API (通义千问 - OpenAI compatible format)
    try {
      const response = await axios.post(
        `${config.ai.apiUrl}/chat/completions`,
        {
          model: 'qwen-turbo',
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${config.ai.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 60000
        }
      );

      let fullContent = '';

      // Handle streaming response
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      });

      response.data.on('end', async () => {
        // Save AI message
        if (fullContent) {
          await AIMessageModel.create({
            session_id: session.id,
            role: 2, // AI
            content: fullContent
          });
        }
        res.end();
      });

      response.data.on('error', (err) => {
        console.error('Stream error:', err);
        res.write(`data: ${JSON.stringify({ error: 'AI服务响应异常' })}\n\n`);
        res.end();
      });

    } catch (aiError) {
      console.error('AI API error:', aiError.response?.data || aiError.message);
      res.write(`data: ${JSON.stringify({ error: 'AI服务暂时不可用，请稍后重试' })}\n\n`);
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