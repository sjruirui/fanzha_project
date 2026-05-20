<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import LoginModal from '@/components/common/LoginModal.vue'
import AiAssistant from '@/components/common/AiAssistant.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/news')) return '/news'
  if (path.startsWith('/knowledge')) return '/knowledge'
  if (path.startsWith('/classroom')) return '/classroom'
  if (path.startsWith('/community')) return '/community'
  if (path.startsWith('/activity')) return '/activity'
  if (path.startsWith('/quiz')) return '/quiz'
  if (path.startsWith('/report')) return '/report'
  return '/'
})

const menuItems = [
  { path: '/', title: '首页' },
  { path: '/news', title: '反诈资讯' },
  { path: '/knowledge', title: '反诈知识库' },
  { path: '/classroom', title: '反诈课堂' },
  { path: '/community', title: '交流互动' },
  { path: '/activity', title: '活动中心' },
  { path: '/quiz', title: '反诈自测' },
  { path: '/report', title: '诈骗举报' }
]

function handleMenuSelect(path: string) {
  router.push(path)
}

function handleLogin() {
  appStore.openLoginModal('login')
}

function handleRegister() {
  appStore.openLoginModal('register')
}

function handleProfile() {
  router.push('/profile')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // User cancelled
  }
}

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    await userStore.getUserInfo()
  }
})
</script>

<template>
  <el-container class="layout-container">
    <!-- Header -->
    <el-header class="header">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo" @click="router.push('/')">
          <span class="logo-text">反诈宣传平台</span>
        </div>

        <!-- Navigation -->
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          @select="handleMenuSelect"
        >
          <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
            {{ item.title }}
          </el-menu-item>
        </el-menu>

        <!-- User Area -->
        <div class="user-area">
          <template v-if="userStore.isLoggedIn && userStore.userInfo">
            <el-dropdown @command="(cmd: string) => cmd === 'profile' ? handleProfile() : handleLogout()">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo.avatar || undefined">
                  {{ userStore.userInfo.nickname?.charAt(0) || userStore.userInfo.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" plain @click="handleLogin">登录</el-button>
            <el-button @click="handleRegister">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- Main Content -->
    <el-main class="main">
      <router-view />
    </el-main>

    <!-- Footer -->
    <el-footer class="footer">
      <div class="footer-content container">
        <div class="footer-info">
          <p>反诈宣传平台 - 提高全民防骗意识</p>
          <p>Copyright © 2024 All Rights Reserved</p>
        </div>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系方式</a>
          <a href="#">帮助中心</a>
        </div>
      </div>
    </el-footer>

    <!-- Login Modal -->
    <LoginModal />

    <!-- AI Assistant -->
    <AiAssistant />
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  cursor: pointer;
  margin-right: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.el-menu {
  flex: 1;
  border-bottom: none;
}

.el-menu-item {
  font-size: 15px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #303133;
}

.main {
  flex: 1;
  padding: 20px 0;
  background: #f5f7fa;
}

.footer {
  background: #303133;
  color: #fff;
  height: auto;
  padding: 30px 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #909399;
}

.footer-links a {
  color: #fff;
  margin-left: 20px;
  font-size: 13px;
}

.footer-links a:hover {
  color: #409eff;
}
</style>
