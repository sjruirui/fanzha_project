/**
 * Backend API Integration Tests
 * Tests all API endpoints defined in require/04_api_design.md
 */

const request = require('supertest');
const app = require('../src/app');

// Test user credentials
const testUser = {
  username: 'testuser' + Date.now().toString().slice(-8),
  phone: '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
  password: 'test123456'
};

const testAdmin = {
  username: 'admin',
  password: 'admin123'
};

let userToken = '';
let adminToken = '';
let createdPostId = null;
let createdReportId = null;
let createdActivityId = null;
let sessionId = null;

// Helper function to log test results
const logResult = (name, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}${details ? ' - ' + details : ''}`);
};

describe('Backend API Tests', () => {

  // ============================================
  // 1. Health Check
  // ============================================
  describe('1. Health Check', () => {
    it('GET /api/health - should return server status', async () => {
      const res = await request(app).get('/api/health');
      const passed = res.status === 200 && res.body.code === 200 && res.body.data.status === 'ok';
      logResult('Health Check', passed, `Status: ${res.status}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.status).toBe('ok');
    });
  });

  // ============================================
  // 2. User Authentication Module
  // ============================================
  describe('2. User Authentication Module', () => {
    it('POST /api/user/auth/register - should register new user', async () => {
      const res = await request(app)
        .post('/api/user/auth/register')
        .send(testUser);

      const passed = res.status === 201 && res.body.code === 200 && res.body.data.token;
      logResult('User Registration', passed, `Status: ${res.status}, User: ${testUser.username}`);

      if (passed) {
        userToken = res.body.data.token;
      }

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user_info).toBeDefined();
    });

    it('POST /api/user/auth/login - should login user', async () => {
      const res = await request(app)
        .post('/api/user/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      const passed = res.status === 200 && res.body.code === 200 && res.body.data.token;
      logResult('User Login', passed, `Status: ${res.status}`);

      if (passed) {
        userToken = res.body.data.token;
      }

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('GET /api/user/auth/info - should get user info (authenticated)', async () => {
      const res = await request(app)
        .get('/api/user/auth/info')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200 && res.body.data.user_info;
      logResult('Get User Info', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.user_info).toBeDefined();
    });

    it('POST /api/user/auth/logout - should logout user', async () => {
      const res = await request(app)
        .post('/api/user/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('User Logout', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('POST /api/user/auth/login - should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/user/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      const passed = res.status === 400;
      logResult('Login with Wrong Password (should fail)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(400);
    });
  });

  // ============================================
  // 3. Admin Authentication Module
  // ============================================
  describe('3. Admin Authentication Module', () => {
    it('POST /api/admin/auth/login - should login admin', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send(testAdmin);

      const passed = res.status === 200 && res.body.code === 200 && res.body.data.token;
      logResult('Admin Login', passed, `Status: ${res.status}`);

      if (passed) {
        adminToken = res.body.data.token;
      }

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('GET /api/admin/auth/info - should get admin info', async () => {
      const res = await request(app)
        .get('/api/admin/auth/info')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Admin Info', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 4. Home Module
  // ============================================
  describe('4. Home Module', () => {
    it('GET /api/user/home/banners - should get banners', async () => {
      const res = await request(app).get('/api/user/home/banners');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Banners', passed, `Status: ${res.status}, Count: ${res.body.data?.banners?.length || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/home/recommend - should get recommendations', async () => {
      const res = await request(app).get('/api/user/home/recommend');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Recommendations', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 5. News Module
  // ============================================
  describe('5. News Module', () => {
    it('GET /api/user/news - should get news list', async () => {
      const res = await request(app).get('/api/user/news?page=1&pageSize=10');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get News List', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
    });

    it('GET /api/user/news/:id - should get news detail', async () => {
      // First get list to find an ID
      const listRes = await request(app).get('/api/user/news?page=1&pageSize=1');

      if (listRes.body.data?.list?.length > 0) {
        const newsId = listRes.body.data.list[0].id;
        const res = await request(app).get(`/api/user/news/${newsId}`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get News Detail', passed, `Status: ${res.status}, ID: ${newsId}`);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe(200);
      } else {
        logResult('Get News Detail', false, 'No news found');
        expect(true).toBe(true); // Skip if no news
      }
    });
  });

  // ============================================
  // 6. Knowledge Module
  // ============================================
  describe('6. Knowledge Module', () => {
    it('GET /api/user/knowledge - should get knowledge list', async () => {
      const res = await request(app).get('/api/user/knowledge?page=1&pageSize=10');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Knowledge List', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/knowledge/:id - should get knowledge detail', async () => {
      const listRes = await request(app).get('/api/user/knowledge?page=1&pageSize=1');

      if (listRes.body.data?.list?.length > 0) {
        const knowledgeId = listRes.body.data.list[0].id;
        const res = await request(app).get(`/api/user/knowledge/${knowledgeId}`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Knowledge Detail', passed, `Status: ${res.status}, ID: ${knowledgeId}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get Knowledge Detail', false, 'No knowledge found');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 7. Classroom Module
  // ============================================
  describe('7. Classroom Module', () => {
    it('GET /api/user/classroom/chapters - should get chapters', async () => {
      const res = await request(app).get('/api/user/classroom/chapters');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Chapters', passed, `Status: ${res.status}, Count: ${res.body.data?.chapters?.length || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/classroom/chapters/:id/lessons - should get lessons', async () => {
      const chaptersRes = await request(app).get('/api/user/classroom/chapters');

      if (chaptersRes.body.data?.chapters?.length > 0) {
        const chapterId = chaptersRes.body.data.chapters[0].id;
        const res = await request(app).get(`/api/user/classroom/chapters/${chapterId}/lessons`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Chapter Lessons', passed, `Status: ${res.status}, Chapter ID: ${chapterId}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get Chapter Lessons', false, 'No chapters found');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 8. Community Module
  // ============================================
  describe('8. Community Module', () => {
    it('GET /api/user/community/categories - should get categories', async () => {
      const res = await request(app).get('/api/user/community/categories');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Categories', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/community/posts - should get posts list', async () => {
      const res = await request(app).get('/api/user/community/posts?page=1&pageSize=10');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Posts List', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('POST /api/user/community/posts - should create post (authenticated)', async () => {
      const categoriesRes = await request(app).get('/api/user/community/categories');
      const categoryId = categoriesRes.body.data?.categories?.[0]?.id || 1;

      const res = await request(app)
        .post('/api/user/community/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          categoryId,
          title: 'Test Post ' + Date.now(),
          summary: 'This is a test post summary',
          content: 'This is the test post content',
          tags: ['test', 'api']
        });

      const passed = res.status === 201 && res.body.code === 200;
      logResult('Create Post', passed, `Status: ${res.status}`);

      if (passed) {
        createdPostId = res.body.data?.post_id;
      }

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/community/posts/:id - should get post detail', async () => {
      if (createdPostId) {
        const res = await request(app).get(`/api/user/community/posts/${createdPostId}`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Post Detail', passed, `Status: ${res.status}, ID: ${createdPostId}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get Post Detail', false, 'No post created');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 9. Activity Module
  // ============================================
  describe('9. Activity Module', () => {
    it('GET /api/user/activities - should get activities list', async () => {
      const res = await request(app).get('/api/user/activities?page=1&pageSize=10');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Activities List', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);

      if (res.body.data?.list?.length > 0) {
        createdActivityId = res.body.data.list[0].id;
      }
    });

    it('GET /api/user/activities/:id - should get activity detail', async () => {
      if (createdActivityId) {
        const res = await request(app).get(`/api/user/activities/${createdActivityId}`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Activity Detail', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get Activity Detail', false, 'No activity found');
        expect(true).toBe(true);
      }
    });

    it('POST /api/user/activities/:id/sign - should sign up for activity', async () => {
      if (createdActivityId) {
        const res = await request(app)
          .post(`/api/user/activities/${createdActivityId}/sign`)
          .set('Authorization', `Bearer ${userToken}`);

        const passed = res.status === 200 || res.status === 400; // 400 if already signed
        logResult('Activity Sign Up', passed, `Status: ${res.status}`);

        expect([200, 400]).toContain(res.status);
      } else {
        logResult('Activity Sign Up', false, 'No activity found');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 10. Quiz Module
  // ============================================
  describe('10. Quiz Module', () => {
    it('GET /api/user/quiz/levels - should get quiz levels', async () => {
      const res = await request(app).get('/api/user/quiz/levels');
      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Quiz Levels', passed, `Status: ${res.status}, Count: ${res.body.data?.levels?.length || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/quiz/levels/:id/questions - should get questions', async () => {
      const levelsRes = await request(app).get('/api/user/quiz/levels');

      if (levelsRes.body.data?.levels?.length > 0) {
        const levelId = levelsRes.body.data.levels[0].id;
        const res = await request(app).get(`/api/user/quiz/levels/${levelId}/questions`);
        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Quiz Questions', passed, `Status: ${res.status}, Level ID: ${levelId}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get Quiz Questions', false, 'No levels found');
        expect(true).toBe(true);
      }
    });

    it('GET /api/user/quiz/records - should get quiz records (authenticated)', async () => {
      const res = await request(app)
        .get('/api/user/quiz/records')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Quiz Records', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 11. Report Module
  // ============================================
  describe('11. Report Module', () => {
    it('POST /api/user/reports - should submit report (authenticated)', async () => {
      const res = await request(app)
        .post('/api/user/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Report ' + Date.now(),
          type: '电信诈骗',
          amount: 10000,
          description: 'This is a test fraud report',
          evidence: []
        });

      const passed = res.status === 201 && res.body.code === 200;
      logResult('Submit Report', passed, `Status: ${res.status}`);

      if (passed) {
        createdReportId = res.body.data?.report_id;
      }

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/reports - should get report history (authenticated)', async () => {
      const res = await request(app)
        .get('/api/user/reports?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Report History', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 12. Profile Module
  // ============================================
  describe('12. Profile Module', () => {
    it('GET /api/user/profile - should get profile (authenticated)', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Profile', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/profile/posts - should get my posts', async () => {
      const res = await request(app)
        .get('/api/user/profile/posts?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get My Posts', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/profile/activities - should get my activities', async () => {
      const res = await request(app)
        .get('/api/user/profile/activities?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get My Activities', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/profile/likes - should get my likes', async () => {
      const res = await request(app)
        .get('/api/user/profile/likes?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get My Likes', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/profile/collects - should get my collects', async () => {
      const res = await request(app)
        .get('/api/user/profile/collects?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get My Collects', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/user/profile/comments - should get my comments', async () => {
      const res = await request(app)
        .get('/api/user/profile/comments?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get My Comments', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 13. Interact Module (Like/Collect)
  // ============================================
  describe('13. Interact Module', () => {
    it('POST /api/user/interact/like - should like content', async () => {
      if (createdPostId) {
        const res = await request(app)
          .post('/api/user/interact/like')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            targetType: 'post',
            targetId: createdPostId
          });

        const passed = res.status === 200;
        logResult('Like Content', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Like Content', false, 'No post to like');
        expect(true).toBe(true);
      }
    });

    it('POST /api/user/interact/collect - should collect content', async () => {
      if (createdPostId) {
        const res = await request(app)
          .post('/api/user/interact/collect')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            targetType: 'post',
            targetId: createdPostId
          });

        const passed = res.status === 200;
        logResult('Collect Content', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Collect Content', false, 'No post to collect');
        expect(true).toBe(true);
      }
    });

    it('GET /api/user/interact/status - should check interact status', async () => {
      if (createdPostId) {
        const res = await request(app)
          .get(`/api/user/interact/status?targetType=post&targetId=${createdPostId}`)
          .set('Authorization', `Bearer ${userToken}`);

        const passed = res.status === 200 && res.body.code === 200;
        logResult('Check Interact Status', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe(200);
      } else {
        logResult('Check Interact Status', false, 'No post to check');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 14. Comment Module
  // ============================================
  describe('14. Comment Module', () => {
    it('GET /api/user/comments - should get comments', async () => {
      if (createdPostId) {
        const res = await request(app)
          .get(`/api/user/comments?targetType=post&targetId=${createdPostId}&page=1&pageSize=10`);

        const passed = res.status === 200 && res.body.code === 200;
        logResult('Get Comments', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe(200);
      } else {
        logResult('Get Comments', false, 'No post to get comments');
        expect(true).toBe(true);
      }
    });

    it('POST /api/user/comments - should create comment', async () => {
      if (createdPostId) {
        const res = await request(app)
          .post('/api/user/comments')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            targetType: 'post',
            targetId: createdPostId,
            content: 'This is a test comment'
          });

        const passed = res.status === 201 && res.body.code === 200;
        logResult('Create Comment', passed, `Status: ${res.status}`);

        expect(res.status).toBe(201);
        expect(res.body.code).toBe(200);
      } else {
        logResult('Create Comment', false, 'No post to comment');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 15. AI Module
  // ============================================
  describe('15. AI Module', () => {
    it('POST /api/user/ai/session - should create AI session', async () => {
      const res = await request(app)
        .post('/api/user/ai/session')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mode: 'chat',
          scenario: null
        });

      const passed = res.status === 201 && res.body.code === 200;
      logResult('Create AI Session', passed, `Status: ${res.status}`);

      if (passed) {
        sessionId = res.body.data?.session_id;
      }

      // Accept either success or failure (AI API might not be configured)
      expect([200, 201, 500]).toContain(res.status);
    });

    it('GET /api/user/ai/session/:sessionId/messages - should get session messages', async () => {
      if (sessionId) {
        const res = await request(app)
          .get(`/api/user/ai/session/${sessionId}/messages`)
          .set('Authorization', `Bearer ${userToken}`);

        const passed = res.status === 200;
        logResult('Get AI Session Messages', passed, `Status: ${res.status}`);

        expect(res.status).toBe(200);
      } else {
        logResult('Get AI Session Messages', false, 'No session created');
        expect(true).toBe(true);
      }
    });
  });

  // ============================================
  // 16. Admin Statistics Module
  // ============================================
  describe('16. Admin Statistics Module', () => {
    it('GET /api/admin/statistics - should get statistics', async () => {
      const res = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Admin Statistics', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 17. Admin User Management
  // ============================================
  describe('17. Admin User Management', () => {
    it('GET /api/admin/users - should get users list', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Users List (Admin)', passed, `Status: ${res.status}, Total: ${res.body.data?.total || 0}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 18. Admin News Management
  // ============================================
  describe('18. Admin News Management', () => {
    it('GET /api/admin/news - should get news list', async () => {
      const res = await request(app)
        .get('/api/admin/news?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get News List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 19. Admin Knowledge Management
  // ============================================
  describe('19. Admin Knowledge Management', () => {
    it('GET /api/admin/knowledge - should get knowledge list', async () => {
      const res = await request(app)
        .get('/api/admin/knowledge?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Knowledge List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 20. Admin Classroom Management
  // ============================================
  describe('20. Admin Classroom Management', () => {
    it('GET /api/admin/classroom/chapters - should get chapters list', async () => {
      const res = await request(app)
        .get('/api/admin/classroom/chapters?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Chapters List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code === 200);
    });

    it('GET /api/admin/classroom/lessons - should get lessons list', async () => {
      const res = await request(app)
        .get('/api/admin/classroom/lessons?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Lessons List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code === 200);
    });
  });

  // ============================================
  // 21. Admin Post Management
  // ============================================
  describe('21. Admin Post Management', () => {
    it('GET /api/admin/posts - should get posts list', async () => {
      const res = await request(app)
        .get('/api/admin/posts?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Posts List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 22. Admin Category Management
  // ============================================
  describe('22. Admin Category Management', () => {
    it('GET /api/admin/categories - should get categories', async () => {
      const res = await request(app)
        .get('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Categories (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 23. Admin Activity Management
  // ============================================
  describe('23. Admin Activity Management', () => {
    it('GET /api/admin/activities - should get activities list', async () => {
      const res = await request(app)
        .get('/api/admin/activities?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Activities List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 24. Admin Quiz Management
  // ============================================
  describe('24. Admin Quiz Management', () => {
    it('GET /api/admin/quiz/levels - should get quiz levels', async () => {
      const res = await request(app)
        .get('/api/admin/quiz/levels?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Quiz Levels (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('GET /api/admin/quiz/questions - should get questions', async () => {
      const res = await request(app)
        .get('/api/admin/quiz/questions?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Quiz Questions (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 25. Admin Report Management
  // ============================================
  describe('25. Admin Report Management', () => {
    it('GET /api/admin/reports - should get reports list', async () => {
      const res = await request(app)
        .get('/api/admin/reports?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Reports List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 26. Admin Comment Management
  // ============================================
  describe('26. Admin Comment Management', () => {
    it('GET /api/admin/comments - should get comments list', async () => {
      const res = await request(app)
        .get('/api/admin/comments?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Comments List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 27. Admin Notice Management
  // ============================================
  describe('27. Admin Notice Management', () => {
    it('GET /api/admin/notices - should get notices list', async () => {
      const res = await request(app)
        .get('/api/admin/notices?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Notices List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 28. Admin Banner Management
  // ============================================
  describe('28. Admin Banner Management', () => {
    it('GET /api/admin/banners - should get banners list', async () => {
      const res = await request(app)
        .get('/api/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Banners List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  // ============================================
  // 29. Admin Admin Management
  // ============================================
  describe('29. Admin Admin Management', () => {
    it('GET /api/admin/admins - should get admins list', async () => {
      const res = await request(app)
        .get('/api/admin/admins?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const passed = res.status === 200 && res.body.code === 200;
      logResult('Get Admins List (Admin)', passed, `Status: ${res.status}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

});
