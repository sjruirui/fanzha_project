import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
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
      name: 'AdminLayout',
      component: () => import('@/views/admin/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'AdminHome',
          component: () => import('@/views/admin/AdminHome.vue')
        },
        {
          path: 'login',
          name: 'AdminLogin',
          component: () => import('@/views/admin/AdminLogin.vue')
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
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const appStore = useAppStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    appStore.openLoginModal('login')
    next({ path: to.redirectedFrom?.path || '/' })
    return
  }

  next()
})

export default router
