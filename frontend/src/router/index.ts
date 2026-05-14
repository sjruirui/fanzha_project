import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useAdminStore } from '@/stores/admin'
import UserLayout from '@/components/layout/UserLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/user/Home.vue')
        },
        {
          path: 'news',
          name: 'News',
          component: () => import('@/views/user/News.vue')
        },
        {
          path: 'news/:id',
          name: 'NewsDetail',
          component: () => import('@/views/user/NewsDetail.vue')
        },
        {
          path: 'knowledge',
          name: 'Knowledge',
          component: () => import('@/views/user/Knowledge.vue')
        },
        {
          path: 'knowledge/:id',
          name: 'KnowledgeDetail',
          component: () => import('@/views/user/KnowledgeDetail.vue')
        },
        {
          path: 'classroom',
          name: 'Classroom',
          component: () => import('@/views/user/Classroom.vue')
        },
        {
          path: 'classroom/chapter/:id',
          name: 'ChapterDetail',
          component: () => import('@/views/user/ChapterDetail.vue')
        },
        {
          path: 'classroom/lesson/:id',
          name: 'LessonDetail',
          component: () => import('@/views/user/LessonDetail.vue')
        },
        {
          path: 'community',
          name: 'Community',
          component: () => import('@/views/user/Community.vue')
        },
        {
          path: 'community/create',
          name: 'CommunityCreate',
          component: () => import('@/views/user/CommunityCreate.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'community/:id',
          name: 'CommunityDetail',
          component: () => import('@/views/user/CommunityDetail.vue')
        },
        {
          path: 'activity',
          name: 'Activity',
          component: () => import('@/views/user/Activity.vue')
        },
        {
          path: 'activity/:id',
          name: 'ActivityDetail',
          component: () => import('@/views/user/ActivityDetail.vue')
        },
        {
          path: 'quiz',
          name: 'Quiz',
          component: () => import('@/views/user/Quiz.vue')
        },
        {
          path: 'quiz/:id',
          name: 'QuizDetail',
          component: () => import('@/views/user/QuizDetail.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'report',
          name: 'Report',
          component: () => import('@/views/user/Report.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'report/history',
          name: 'ReportHistory',
          component: () => import('@/views/user/ReportHistory.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/user/Profile.vue'),
          meta: { requiresAuth: true },
          children: [
            {
              path: '',
              name: 'ProfileInfo',
              component: () => import('@/views/user/ProfileInfo.vue')
            },
            {
              path: 'posts',
              name: 'ProfilePosts',
              component: () => import('@/views/user/ProfilePosts.vue')
            },
            {
              path: 'activities',
              name: 'ProfileActivities',
              component: () => import('@/views/user/ProfileActivities.vue')
            },
            {
              path: 'likes',
              name: 'ProfileLikes',
              component: () => import('@/views/user/ProfileLikes.vue')
            },
            {
              path: 'collects',
              name: 'ProfileCollects',
              component: () => import('@/views/user/ProfileCollects.vue')
            },
            {
              path: 'comments',
              name: 'ProfileComments',
              component: () => import('@/views/user/ProfileComments.vue')
            },
            {
              path: 'reports',
              name: 'ProfileReports',
              component: () => import('@/views/user/ProfileReports.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAdminAuth: true },
      children: [
        {
          path: '',
          name: 'AdminHome',
          component: () => import('@/views/admin/AdminHome.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'login',
          name: 'AdminLogin',
          component: () => import('@/views/admin/AdminLogin.vue'),
          meta: { title: '管理员登录', guest: true }
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/AdminUsers.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'admins',
          name: 'AdminAdmins',
          component: () => import('@/views/admin/AdminAdmins.vue'),
          meta: { title: '管理员管理' }
        },
        {
          path: 'news',
          name: 'AdminNews',
          component: () => import('@/views/admin/AdminNews.vue'),
          meta: { title: '反诈资讯管理' }
        },
        {
          path: 'knowledge',
          name: 'AdminKnowledge',
          component: () => import('@/views/admin/AdminKnowledge.vue'),
          meta: { title: '反诈知识库管理' }
        },
        {
          path: 'classroom',
          name: 'AdminClassroom',
          component: () => import('@/views/admin/AdminClassroom.vue'),
          meta: { title: '反诈课堂管理' }
        },
        {
          path: 'posts',
          name: 'AdminPosts',
          component: () => import('@/views/admin/AdminPosts.vue'),
          meta: { title: '帖子管理' }
        },
        {
          path: 'categories',
          name: 'AdminCategories',
          component: () => import('@/views/admin/AdminCategories.vue'),
          meta: { title: '分类管理' }
        },
        {
          path: 'activities',
          name: 'AdminActivities',
          component: () => import('@/views/admin/AdminActivities.vue'),
          meta: { title: '活动管理' }
        },
        {
          path: 'signups',
          name: 'AdminSignups',
          component: () => import('@/views/admin/AdminSignups.vue'),
          meta: { title: '活动报名管理' }
        },
        {
          path: 'quiz',
          name: 'AdminQuiz',
          component: () => import('@/views/admin/AdminQuiz.vue'),
          meta: { title: '反诈自测管理' }
        },
        {
          path: 'reports',
          name: 'AdminReports',
          component: () => import('@/views/admin/AdminReports.vue'),
          meta: { title: '举报管理' }
        },
        {
          path: 'comments',
          name: 'AdminComments',
          component: () => import('@/views/admin/AdminComments.vue'),
          meta: { title: '评论管理' }
        },
        {
          path: 'notices',
          name: 'AdminNotices',
          component: () => import('@/views/admin/AdminNotices.vue'),
          meta: { title: '公告管理' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

// Route guard
router.beforeEach((to) => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const adminStore = useAdminStore()

  // Check if route requires user authentication
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    appStore.openLoginModal('login')
    return { path: to.redirectedFrom?.path || '/' }
  }

  // Check if route requires admin authentication
  if (to.meta.requiresAdminAuth && !to.meta.guest) {
    if (!adminStore.isLoggedIn) {
      return { path: '/admin/login' }
    }
  }

  // Redirect to admin home if logged in and trying to access login
  if (to.path === '/admin/login' && adminStore.isLoggedIn) {
    return { path: '/admin' }
  }

  return true
})

export default router
