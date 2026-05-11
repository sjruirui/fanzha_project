<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { activityApi } from '@/api/user/activity'
import type { Activity } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const activities = ref<Activity[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

const forms = [
  { label: '全部', value: '' },
  { label: '线上活动', value: 'online' },
  { label: '线下活动', value: 'offline' }
]
const activeForm = ref('')
const keyword = ref('')

async function fetchActivities() {
  loading.value = true
  try {
    const res = await activityApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      form: activeForm.value,
      keyword: keyword.value
    })
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

function handleSearch() {
  page.value = 1
  fetchActivities()
}

function handlePageChange(val: number) {
  page.value = val
  fetchActivities()
}

function goToDetail(id: number) {
  router.push(`/activity/${id}`)
}

watch(activeForm, () => {
  page.value = 1
  fetchActivities()
})

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="activity-page container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">活动中心</h1>
    </div>

    <!-- Filter Section -->
    <div class="filter-section card">
      <div class="filter-tabs">
        <el-radio-group v-model="activeForm" size="small">
          <el-radio-button v-for="f in forms" :key="f.value" :value="f.value">
            {{ f.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索活动"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Activity List -->
    <div v-loading="loading" class="activity-list">
      <div v-if="activities.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无活动" />
      </div>
      <div v-else class="activity-grid">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
          @click="goToDetail(activity.id)"
        >
          <div class="activity-cover">
            <img :src="activity.cover || '/placeholder.jpg'" :alt="activity.title" />
            <div class="activity-form">
              <el-tag :type="activity.form === 'online' ? 'success' : 'warning'" size="small">
                {{ activity.form === 'online' ? '线上' : '线下' }}
              </el-tag>
            </div>
          </div>
          <div class="activity-info">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(activity.startTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ activity.address || '线上活动' }}</span>
              </div>
            </div>
            <div class="activity-stats">
              <span><el-icon><User /></el-icon> {{ activity.signs }} 人报名</span>
              <span><el-icon><View /></el-icon> {{ activity.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
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
.activity-page {
  padding: 20px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  width: 300px;
}

.activity-list {
  min-height: 400px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.activity-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.activity-cover {
  height: 160px;
  position: relative;
  overflow: hidden;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.activity-card:hover .activity-cover img {
  transform: scale(1.05);
}

.activity-form {
  position: absolute;
  top: 10px;
  right: 10px;
}

.activity-info {
  padding: 16px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.activity-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.activity-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 992px) {
  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}
</style>
