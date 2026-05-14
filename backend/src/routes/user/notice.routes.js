const express = require('express');
const router = express.Router();
const NoticeModel = require('../../models/notice.model');

// 获取已发布公告列表
router.get('/list', async (req, res) => {
  try {
    const notices = await NoticeModel.findPublished();
    const list = notices.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      publishedAt: item.published_at
    }));
    res.json({ code: 200, message: 'success', data: { list } });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取公告详情
router.get('/:id', async (req, res) => {
  try {
    const notice = await NoticeModel.findById(req.params.id);
    if (!notice || notice.status !== 1) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: notice.id,
        title: notice.title,
        content: notice.content,
        publishedAt: notice.published_at,
        publisherName: notice.publisher_name
      }
    });
  } catch (error) {
    console.error('Get notice detail error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
