<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Document, Calendar, Warning, TrendCharts, DataLine, BellFilled } from '@element-plus/icons-vue'
import { adminRequest } from '@/api/adminRequest'

interface Statistics {
  userCount: number
  postCount: number
  activityCount: number
  reportCount: number
  newsCount: number
  knowledgeCount: number
  commentCount: number
  signupCount: number
}

const statistics = ref<Statistics>({
  userCount: 0,
  postCount: 0,
  activityCount: 0,
  reportCount: 0,
  newsCount: 0,
  knowledgeCount: 0,
  commentCount: 0,
  signupCount: 0
})
const loading = ref(true)

const statCards = [
  { key: 'userCount', label: '用户总数', icon: User, color: '#4f46e5', bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' },
  { key: 'postCount', label: '帖子总数', icon: Document, color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { key: 'activityCount', label: '活动总数', icon: Calendar, color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
  { key: 'reportCount', label: '举报总数', icon: Warning, color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
  { key: 'newsCount', label: '资讯总数', icon: TrendCharts, color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
  { key: 'knowledgeCount', label: '知识总数', icon: DataLine, color: '#06b6d4', bg: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' }
]

async function fetchStatistics() {
  loading.value = true
  try {
    const data = await adminRequest.get<Statistics>('/statistics')
    statistics.value = data
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="admin-home" v-loading="loading">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来</h1>
      <p class="welcome-subtitle">反诈宣传平台管理后台</p>
    </div>

    <div class="stats-grid">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        :style="{ background: card.bg }"
      >
        <div class="stat-icon">
          <el-icon :size="28"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics[card.key as keyof Statistics] }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-grid">
        <router-link to="/admin/news" class="action-card">
          <el-icon :size="24"><Document /></el-icon>
          <span>发布资讯</span>
        </router-link>
        <router-link to="/admin/activities" class="action-card">
          <el-icon :size="24"><Calendar /></el-icon>
          <span>创建活动</span>
        </router-link>
        <router-link to="/admin/reports" class="action-card">
          <el-icon :size="24"><Warning /></el-icon>
          <span>处理举报</span>
        </router-link>
        <router-link to="/admin/notices" class="action-card">
          <el-icon :size="24"><BellFilled /></el-icon>
          <span>发布公告</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home {
  padding: 0;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1f36;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 15px;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.quick-actions {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  color: #475569;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-card:hover {
  background: #4f46e5;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.action-card span {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
