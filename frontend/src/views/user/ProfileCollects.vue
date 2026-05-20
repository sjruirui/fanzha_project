<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '@/api/user/profile'
import type { CollectItem } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const collects = ref<CollectItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const activeType = ref<number | string>(0)

const types = [
  { label: '全部', value: 0 },
  { label: '帖子', value: 'post' },
  { label: '活动', value: 'activity' }
]

function getImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder.jpg'
  // Convert backslashes to forward slashes for URL
  const normalizedPath = path.replace(/\\/g, '/')
  // Ensure path starts with /
  return normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath
}

async function fetchCollects() {
  loading.value = true
  try {
    const res = await profileApi.getCollects({
      page: page.value,
      pageSize: pageSize.value,
      targetType: activeType.value || undefined
    })
    collects.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function goToDetail(item: CollectItem) {
  if (item.targetType === 'post') {
    router.push(`/community/${item.targetId}`)
  } else if (item.targetType === 'activity') {
    router.push(`/activity/${item.targetId}`)
  }
}

function handlePageChange(val: number) {
  page.value = val
  fetchCollects()
}

watch(activeType, () => {
  page.value = 1
  fetchCollects()
})

onMounted(() => {
  fetchCollects()
})
</script>

<template>
  <div class="profile-collects-page card">
    <div class="header">
      <h3 class="section-title">我的收藏</h3>
      <el-radio-group v-model="activeType" size="small">
        <el-radio-button v-for="t in types" :key="t.value" :value="t.value">
          {{ t.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="collect-list">
      <div v-if="collects.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无收藏记录" />
      </div>
      <div v-else class="items">
        <div v-for="item in collects" :key="item.id" class="collect-item" @click="goToDetail(item)">
          <div class="item-cover">
            <img :src="getImageUrl(item.targetCover)" :alt="item.targetTitle" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.targetTitle }}</div>
            <div class="item-meta">
              <el-tag size="small" effect="plain">
                {{ item.targetType === 'post' ? '帖子' : '活动' }}
              </el-tag>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.collect-list {
  min-height: 300px;
}

.items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.collect-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.collect-item:hover {
  background: #f5f7fa;
}

.item-cover {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 576px) {
  .items {
    grid-template-columns: 1fr;
  }
}
</style>
