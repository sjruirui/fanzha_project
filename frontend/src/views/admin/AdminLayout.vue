<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import {
  HomeFilled,
  User,
  UserFilled,
  Document,
  Reading,
  VideoPlay,
  ChatDotRound,
  Grid,
  Calendar,
  Tickets,
  EditPen,
  Warning,
  ChatLineSquare,
  BellFilled,
  SwitchButton,
  Fold,
  Expand
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const isCollapse = ref(false)

const menuItems = [
  { path: '/admin', title: '首页', icon: HomeFilled },
  { path: '/admin/users', title: '用户管理', icon: User },
  { path: '/admin/admins', title: '管理员管理', icon: UserFilled },
  { path: '/admin/news', title: '反诈资讯管理', icon: Document },
  { path: '/admin/knowledge', title: '反诈知识库管理', icon: Reading },
  { path: '/admin/classroom', title: '反诈课堂管理', icon: VideoPlay },
  { path: '/admin/posts', title: '帖子管理', icon: ChatDotRound },
  { path: '/admin/categories', title: '分类管理', icon: Grid },
  { path: '/admin/activities', title: '活动管理', icon: Calendar },
  { path: '/admin/signups', title: '活动报名管理', icon: Tickets },
  { path: '/admin/quiz', title: '反诈自测管理', icon: EditPen },
  { path: '/admin/reports', title: '举报管理', icon: Warning },
  { path: '/admin/comments', title: '评论管理', icon: ChatLineSquare },
  { path: '/admin/notices', title: '公告管理', icon: BellFilled }
]

const activeMenu = computed(() => route.path)

function handleMenuSelect(path: string) {
  router.push(path)
}

function handleLogout() {
  adminStore.logout()
}

onMounted(() => {
  adminStore.initFromStorage()
})
</script>

<template>
  <div class="admin-layout">
    <el-container class="h-full">
      <!-- Sidebar -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <img src="/logo.svg" alt="Logo" class="logo-img" />
          <span v-if="!isCollapse" class="logo-text">反诈管理后台</span>
        </div>

        <el-scrollbar class="menu-scrollbar">
          <el-menu
            :default-active="activeMenu"
            :collapse="isCollapse"
            :collapse-transition="false"
            background-color="transparent"
            text-color="#a3aed0"
            active-text-color="#fff"
            @select="handleMenuSelect"
          >
            <el-menu-item
              v-for="item in menuItems"
              :key="item.path"
              :index="item.path"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>

        <div class="sidebar-footer">
          <el-button
            text
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <el-icon :size="18">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
        </div>
      </el-aside>

      <!-- Main content -->
      <el-container>
        <!-- Header -->
        <el-header class="header">
          <div class="header-left">
            <h2 class="page-title">{{ route.meta.title || '管理后台' }}</h2>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleLogout">
              <div class="admin-info">
                <el-avatar :size="32" class="avatar">
                  {{ adminStore.adminInfo?.nickname?.charAt(0) || 'A' }}
                </el-avatar>
                <span class="admin-name">{{ adminStore.adminInfo?.nickname || '管理员' }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- Content -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  background: linear-gradient(180deg, #1a1f36 0%, #252d4a 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%) !important;
  color: #fff !important;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.collapse-btn {
  width: 100%;
  color: #a3aed0;
}

.collapse-btn:hover {
  color: #fff;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.admin-info:hover {
  background: #f5f7fa;
}

.avatar {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #fff;
  font-weight: 600;
}

.admin-name {
  font-size: 14px;
  color: #1a1f36;
  font-weight: 500;
}

.main-content {
  padding: 24px;
  background: #f0f2f5;
  overflow-y: auto;
}
</style>
