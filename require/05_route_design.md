# 路由架构设计

## 路由分离策略

本项目采用**路由前缀分离**策略，用户端和管理端共享同一个 Vue 应用，通过路由前缀 `/admin` 区分：

| 端     | 路由前缀 | 说明                       |
| ------ | -------- | -------------------------- |
| 用户端 | `/`      | 面向普通用户的所有功能页面 |
| 管理端 | `/admin` | 面向管理员的后台管理页面   |

## 用户端路由设计

```
/                    → 首页
/news                → 反诈资讯列表
/news/:id            → 资讯详情
/knowledge           → 知识库列表
/knowledge/:id       → 知识详情
/classroom           → 反诈课堂（章节列表）
/classroom/chapter/:id → 节课时列表
/classroom/lesson/:id  → 课时视频播放
/community           → 交流互动（帖子列表）
/community/create    → 发布帖子
/community/:id       → 帖子详情
/activity            → 活动中心列表
/activity/:id        → 活动详情
/quiz                → 反诈自测（关卡列表）
/quiz/:id            → 答题页面
/report              → 诈骗举报
/report/history      → 举报历史
/profile             → 个人中心
/profile/posts       → 我的帖子
/profile/activities  → 我的活动
/profile/likes       → 我的点赞
/profile/collects    → 我的收藏
/profile/comments    → 我的评论
/profile/reports     → 我的举报
```

**注**：登录/注册采用弹窗形式，不设独立路由

## 管理端路由设计

```
/admin                        → 管理员首页（数据统计）
/admin/login                  → 管理员登录

/admin/users                  → 用户管理
/admin/users/create           → 新增用户
/admin/users/:id/edit         → 编辑用户

/admin/admins                 → 管理员管理
/admin/admins/create          → 新增管理员
/admin/admins/:id/edit        → 编辑管理员

/admin/news                   → 资讯管理
/admin/news/create            → 新增资讯
/admin/news/:id/edit          → 编辑资讯

/admin/knowledge              → 知识库管理
/admin/knowledge/create       → 新增知识
/admin/knowledge/:id/edit     → 编辑知识

/admin/classroom              → 课堂管理
/admin/classroom/chapters     → 章节管理
/admin/classroom/chapters/create    → 新增章节
/admin/classroom/chapters/:id/edit  → 编辑章节
/admin/classroom/lessons      → 课时管理
/admin/classroom/lessons/create     → 新增课时
/admin/classroom/lessons/:id/edit   → 编辑课时

/admin/posts                  → 帖子管理
/admin/posts/:id/edit         → 编辑帖子

/admin/categories             → 分类管理
/admin/categories/create      → 新增分类
/admin/categories/:id/edit    → 编辑分类

/admin/activities             → 活动管理
/admin/activities/create      → 新增活动
/admin/activities/:id/edit    → 编辑活动
/admin/activities/:id/signups → 报名管理

/admin/quiz                   → 自测管理
/admin/quiz/levels            → 关卡管理
/admin/quiz/levels/create     → 新增关卡
/admin/quiz/questions         → 题目管理
/admin/quiz/questions/create  → 新增题目

/admin/reports                → 举报管理
/admin/reports/:id            → 举报详情处理

/admin/comments               → 评论管理

/admin/notices                → 公告管理
/admin/notices/create         → 新增公告
/admin/notices/:id/edit       → 编辑公告

/admin/banners                → 轮播图管理
/admin/banners/create         → 新增轮播图
/admin/banners/:id/edit       → 编辑轮播图
```

## 路由守卫设计

### 用户端路由守卫

```javascript
// 需登录页面
const authRequiredPages = [
  '/profile',
  '/profile/posts',
  '/profile/activities',
  '/profile/likes',
  '/profile/collects',
  '/profile/comments',
  '/profile/reports',
  '/community/create',
  '/report'
]

// 路由守卫逻辑
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.user.isLoggedIn
  
  if (authRequiredPages.some(path => to.path.startsWith(path))) {
    if (!isLoggedIn) {
      // 显示登录弹窗，不跳转路由
      store.commit('showLoginModal')
      next(from.path || '/')
    } else {
      next()
    }
  } else {
    next()
  }
})
```

### 管理端路由守卫

```javascript
// 管理端路由守卫
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const isAdminLoggedIn = store.state.admin.isLoggedIn
    
    if (to.path === '/admin/login') {
      if (isAdminLoggedIn) {
        next('/admin')
      } else {
        next()
      }
    } else {
      if (!isAdminLoggedIn) {
        next('/admin/login')
      } else {
        next()
      }
    }
  } else {
    next()
  }
})
```

## 路由懒加载配置

```javascript
// 用户端路由
const userRoutes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/news',
    component: () => import('@/views/News.vue')
  },
  {
    path: '/news/:id',
    component: () => import('@/views/NewsDetail.vue')
  },
  {
    path: '/knowledge',
    component: () => import('@/views/Knowledge.vue')
  },
  {
    path: '/knowledge/:id',
    component: () => import('@/views/KnowledgeDetail.vue')
  },
  {
    path: '/classroom',
    component: () => import('@/views/Classroom.vue')
  },
  {
    path: '/classroom/chapter/:id',
    component: () => import('@/views/ChapterDetail.vue')
  },
  {
    path: '/classroom/lesson/:id',
    component: () => import('@/views/LessonDetail.vue')
  },
  {
    path: '/community',
    component: () => import('@/views/Community.vue')
  },
  {
    path: '/community/create',
    component: () => import('@/views/CommunityCreate.vue')
  },
  {
    path: '/community/:id',
    component: () => import('@/views/CommunityDetail.vue')
  },
  {
    path: '/activity',
    component: () => import('@/views/Activity.vue')
  },
  {
    path: '/activity/:id',
    component: () => import('@/views/ActivityDetail.vue')
  },
  {
    path: '/quiz',
    component: () => import('@/views/Quiz.vue')
  },
  {
    path: '/quiz/:id',
    component: () => import('@/views/QuizDetail.vue')
  },
  {
    path: '/report',
    component: () => import('@/views/Report.vue')
  },
  {
    path: '/report/history',
    component: () => import('@/views/ReportHistory.vue')
  },
  {
    path: '/profile',
    component: () => import('@/views/Profile.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/ProfileInfo.vue')
      },
      {
        path: 'posts',
        component: () => import('@/views/ProfilePosts.vue')
      },
      {
        path: 'activities',
        component: () => import('@/views/ProfileActivities.vue')
      },
      {
        path: 'likes',
        component: () => import('@/views/ProfileLikes.vue')
      },
      {
        path: 'collects',
        component: () => import('@/views/ProfileCollects.vue')
      },
      {
        path: 'comments',
        component: () => import('@/views/ProfileComments.vue')
      },
      {
        path: 'reports',
        component: () => import('@/views/ProfileReports.vue')
      }
    ]
  }
]

// 管理端路由
const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/admin/AdminHome.vue')
      },
      {
        path: 'users',
        component: () => import('@/views/admin/UserManage.vue')
      },
      {
        path: 'users/create',
        component: () => import('@/views/admin/UserCreate.vue')
      },
      {
        path: 'users/:id/edit',
        component: () => import('@/views/admin/UserEdit.vue')
      },
      // ... 其他管理端路由
    ]
  },
  {
    path: '/admin/login',
    component: () => import('@/views/admin/AdminLogin.vue')
  }
]
```