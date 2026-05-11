const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');
const newsRoutes = require('./news.routes');
const knowledgeRoutes = require('./knowledge.routes');
const classroomRoutes = require('./classroom.routes');
const communityRoutes = require('./community.routes');
const activityRoutes = require('./activity.routes');
const quizRoutes = require('./quiz.routes');
const reportRoutes = require('./report.routes');
const profileRoutes = require('./profile.routes');
const interactRoutes = require('./interact.routes');
const commentRoutes = require('./comment.routes');
const aiRoutes = require('./ai.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/news', newsRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/classroom', classroomRoutes);
router.use('/community', communityRoutes);
router.use('/activities', activityRoutes);
router.use('/quiz', quizRoutes);
router.use('/reports', reportRoutes);
router.use('/profile', profileRoutes);
router.use('/interact', interactRoutes);
router.use('/comments', commentRoutes);
router.use('/ai', aiRoutes);

module.exports = router;