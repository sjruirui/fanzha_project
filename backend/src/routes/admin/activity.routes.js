const express = require('express');
const router = express.Router();
const { ActivityModel, ActivitySignModel } = require('../../models/activity.model');
const { authAdmin } = require('../../middleware/auth.middleware');
const { validatePagination } = require('../../middleware/validation.middleware');

/**
 * @route   GET /api/admin/activities
 * @desc    Get activities list
 * @access  Private (Admin)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);
    const { form, status, keyword } = req.query;

    // Convert form filter string to number
    const formNum = form === 'offline' ? 2 : (form === 'online' ? 1 : '');

    const result = await ActivityModel.findAll({
      page,
      pageSize,
      form: formNum,
      status,
      keyword
    });

    // Transform field names to camelCase and convert form number to string
    const list = result.list.map(activity => {
      // Format datetime to string format for frontend
      const formatDateTime = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      return {
        id: activity.id,
        title: activity.title,
        summary: activity.summary,
        cover: activity.cover,
        content: activity.content,
        organizer: activity.organizer,
        form: activity.form === 2 ? 'offline' : 'online',
        address: activity.address,
        startTime: formatDateTime(activity.start_time),
        endTime: formatDateTime(activity.end_time),
        views: activity.views,
        likes: activity.likes_count,
        comments: activity.comments_count,
        collects: activity.collects_count,
        signs: activity.signs_count,
        status: activity.status,
        createdAt: activity.created_at
      };
    });

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   POST /api/admin/activities
 * @desc    Create activity
 * @access  Private (Admin)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, summary, cover, content, organizer, form, address, startTime, endTime, status } = req.body;

    if (!title || !content || !startTime || !endTime) {
      return res.status(400).json({ code: 400, message: '标题、内容、开始时间和结束时间不能为空', data: null });
    }

    // Convert form string to number: online -> 1, offline -> 2
    const formNum = form === 'offline' ? 2 : 1;

    const activityId = await ActivityModel.create({
      title,
      summary,
      cover,
      content,
      organizer,
      form: formNum,
      address,
      start_time: startTime,
      end_time: endTime,
      status
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: { activity_id: activityId }
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   PUT /api/admin/activities/:id
 * @desc    Update activity
 * @access  Private (Admin)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, cover, content, organizer, form, address, startTime, endTime, status } = req.body;

    const activity = await ActivityModel.findById(id);
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }

    // Convert form string to number: online -> 1, offline -> 2
    // If form is already a number, use it directly
    let formNum = form;
    if (typeof form === 'string') {
      formNum = form === 'offline' ? 2 : 1;
    }

    // Build update data, only include non-empty fields
    const updateData = {};
    if (title !== undefined && title !== '') updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (cover !== undefined) updateData.cover = cover;
    if (content !== undefined && content !== '') updateData.content = content;
    if (organizer !== undefined) updateData.organizer = organizer;
    if (formNum !== undefined) updateData.form = formNum;
    if (address !== undefined) updateData.address = address;
    if (startTime !== undefined && startTime !== '') updateData.start_time = startTime;
    if (endTime !== undefined && endTime !== '') updateData.end_time = endTime;
    if (status !== undefined) updateData.status = status;

    await ActivityModel.update(id, updateData);

    res.json({ code: 200, message: '更新成功', data: { success: true } });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/activities/:id
 * @desc    Delete activity
 * @access  Private (Admin)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await ActivityModel.delete(id);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/activities/batch
 * @desc    Batch delete activities
 * @access  Private (Admin)
 */
router.delete('/batch', authAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要删除的活动', data: null });
    }

    for (const id of ids) {
      await ActivityModel.delete(id);
    }

    res.json({ code: 200, message: '批量删除成功', data: { success: true } });
  } catch (error) {
    console.error('Batch delete activities error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   GET /api/admin/activities/:id/signups
 * @desc    Get activity signups
 * @access  Private (Admin)
 */
router.get('/:id/signups', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page, pageSize } = validatePagination(req.query.page, req.query.pageSize);

    const result = await ActivitySignModel.findByActivity(id, { page, pageSize });

    // Transform field names to camelCase and nest user info
    const list = result.list.map(signup => ({
      id: signup.id,
      activityId: signup.activity_id,
      userId: signup.user_id,
      createdAt: signup.created_at,
      user: {
        id: signup.user_id,
        username: signup.username,
        nickname: signup.nickname,
        phone: signup.phone
      }
    }));

    res.json({ code: 200, message: 'success', data: { list, total: result.total, page: result.page, pageSize: result.pageSize } });
  } catch (error) {
    console.error('Get signups error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

/**
 * @route   DELETE /api/admin/activities/:id/signups/:signId
 * @desc    Delete signup record
 * @access  Private (Admin)
 */
router.delete('/:id/signups/:signId', authAdmin, async (req, res) => {
  try {
    const { id, signId } = req.params;

    await ActivitySignModel.delete(signId);
    await ActivityModel.updateSignsCount(id, -1);

    res.json({ code: 200, message: '删除成功', data: { success: true } });
  } catch (error) {
    console.error('Delete signup error:', error);
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;