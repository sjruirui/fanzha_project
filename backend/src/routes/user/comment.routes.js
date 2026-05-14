const express = require('express');
const router = express.Router();
const CommentModel = require('../../models/comment.model');
const { BlogModel } = require('../../models/community.model');
const { ActivityModel } = require('../../models/activity.model');
const { authUser } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/user/comments
 * @desc    Get comments by target
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    const result = await CommentModel.findByTarget(targetType, targetId, { page, pageSize });

    // Transform field names to camelCase
    const list = result.list.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      targetType: comment.target_type,
      targetId: comment.target_id,
      parentId: comment.parent_id,
      replyToUserId: comment.reply_to_user_id,
      replyToUsername: comment.reply_to_nickname || comment.reply_to_username,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: comment.user_id,
        nickname: comment.nickname,
        avatar: comment.avatar
      },
      replies: comment.replies?.map(reply => ({
        id: reply.id,
        userId: reply.user_id,
        targetType: reply.target_type,
        targetId: reply.target_id,
        parentId: reply.parent_id,
        replyToUserId: reply.reply_to_user_id,
        replyToUsername: reply.reply_to_nickname || reply.reply_to_username,
        content: reply.content,
        createdAt: reply.created_at,
        user: {
          id: reply.user_id,
          nickname: reply.nickname,
          avatar: reply.avatar
        }
      })) || []
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/user/comments
 * @desc    Create a comment
 * @access  Private
 */
router.post('/', authUser, async (req, res) => {
  try {
    const { targetType, targetId, parentId, replyToUserId, content } = req.body;

    if (!targetType || !targetId || !content) {
      return res.status(400).json({ code: 400, message: '参数错误', data: null });
    }

    const commentId = await CommentModel.create({
      user_id: req.user.id,
      target_type: targetType,
      target_id: targetId,
      parent_id: parentId,
      reply_to_user_id: replyToUserId,
      content
    });

    // Update comments count
    if (targetType == 1) {
      await BlogModel.updateCommentsCount(targetId, 1);
    } else if (targetType == 2) {
      await ActivityModel.updateCommentsCount(targetId, 1);
    }

    res.status(201).json({
      code: 200,
      message: '评论成功',
      data: { comment_id: commentId }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/user/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在', data: null });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权删除此评论', data: null });
    }

    await CommentModel.updateStatus(id, 0);

    // Update comments count
    if (comment.target_type == 1) {
      await BlogModel.updateCommentsCount(comment.target_id, -1);
    } else if (comment.target_type == 2) {
      await ActivityModel.updateCommentsCount(comment.target_id, -1);
    }

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;