<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Location } from '@element-plus/icons-vue'
import { profileApi } from '@/api/user/profile'
import type { Activity } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const activities = ref<{ id: number; activityId: number; activity: Activity; createdAt: string }[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function getImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder.jpg'
  // Convert backslashes to forward slashes for URL
  const normalizedPath = path.replace(/\\/g, '/')
  // Ensure path starts with /
  return normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath
}

async function fetchActivities() {
  loading.value = true
  try {
    const res = await profileApi.getActivities({ page: page.value, pageSize: pageSize.value })
    activities.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function goToDetail(id: number) {
  router.push(`/activity/${id}`)
}

function handlePageChange(val: number) {
  page.value = val
  fetchActivities()
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="profile-activities-page card">
    <h3 class="section-title">我的活动</h3>

    <div v-loading="loading" class="activity-list">
      <div v-if="activities.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无报名活动">
          <el-button type="primary" @click="router.push('/activity')">浏览活动</el-button>
        </el-empty>
      </div>
      <div v-else class="activities">
        <div
          v-for="item in activities"
          :key="item.id"
          class="activity-item"
          @click="goToDetail(item.activity.id)"
        >
          <div class="activity-cover">
            <img :src="getImageUrl(item.activity.cover)" :alt="item.activity.title" />
          </div>
          <div class="activity-info">
            <div class="activity-title">{{ item.activity.title }}</div>
            <div class="activity-meta">
              <span><el-icon><Calendar /></el-icon> {{ formatDate(item.activity.startTime) }}</span>
              <span><el-icon><Location /></el-icon> {{ item.activity.address || '线上活动' }}</span>
            </div>
            <div class="sign-time">报名时间：{{ formatDate(item.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.activity-list {
  min-height: 300px;
}

.activities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.activity-item:hover {
  background: #f5f7fa;
}

.activity-cover {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.activity-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sign-time {
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
