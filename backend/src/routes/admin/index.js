const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const statisticsRoutes = require('./statistics.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const newsRoutes = require('./news.routes');
const knowledgeRoutes = require('./knowledge.routes');
const classroomRoutes = require('./classroom.routes');
const postRoutes = require('./post.routes');
const categoryRoutes = require('./category.routes');
const activityRoutes = require('./activity.routes');
const quizRoutes = require('./quiz.routes');
const reportRoutes = require('./report.routes');
const commentRoutes = require('./comment.routes');
const noticeRoutes = require('./notice.routes');
const bannerRoutes = require('./banner.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/users', userRoutes);
router.use('/admins', adminRoutes);
router.use('/news', newsRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/classroom', classroomRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/activities', activityRoutes);
router.use('/quiz', quizRoutes);
router.use('/reports', reportRoutes);
router.use('/comments', commentRoutes);
router.use('/notices', noticeRoutes);
router.use('/banners', bannerRoutes);

module.exports = router;