<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/api/request'

const statistics = ref({
  userCount: 0,
  postCount: 0,
  activityCount: 0,
  reportCount: 0
})
const loading = ref(true)

async function fetchStatistics() {
  try {
    const data = await request.get('/admin/statistics')
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
  <div class="admin-home-page">
    <h1 class="page-title">数据统计</h1>

    <div v-loading="loading" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #409eff">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.userCount }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #67c23a">
          <el-icon :size="32"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.postCount }}</div>
          <div class="stat-label">帖子总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #e6a23c">
          <el-icon :size="32"><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.activityCount }}</div>
          <div class="stat-label">活动总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #f56c6c">
          <el-icon :size="32"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.reportCount }}</div>
          <div class="stat-label">举报总数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-home-page {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
