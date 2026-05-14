<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Calendar, Star, CollectionTag, ChatDotRound, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('/profile')

const menuItems = [
  { path: '/profile', title: '个人资料', icon: User },
  { path: '/profile/posts', title: '我的帖子', icon: Document },
  { path: '/profile/activities', title: '我的活动', icon: Calendar },
  { path: '/profile/likes', title: '我的点赞', icon: Star },
  { path: '/profile/collects', title: '我的收藏', icon: CollectionTag },
  { path: '/profile/comments', title: '我的评论', icon: ChatDotRound },
  { path: '/profile/reports', title: '我的举报', icon: Warning }
]

function handleMenuSelect(path: string) {
  router.push(path)
}

onMounted(() => {
  activeMenu.value = router.currentRoute.value.path
})
</script>

<template>
  <div class="profile-page container">
    <div class="profile-layout">
      <!-- Sidebar -->
      <div class="profile-sidebar card">
        <div class="user-info">
          <el-avatar :size="64" :src="userStore.userInfo?.avatar || undefined">
            {{ userStore.userInfo?.nickname?.charAt(0) || userStore.userInfo?.username?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</div>
          <div class="user-id">ID: {{ userStore.userInfo?.id }}</div>
        </div>
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
        >
          <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- Content -->
      <div class="profile-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 20px;
}

.profile-layout {
  display: flex;
  gap: 20px;
}

.profile-sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 20px;
}

.user-info {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-top: 12px;
}

.user-id {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.el-menu {
  border-right: none;
}

.profile-content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }
}
</style>
