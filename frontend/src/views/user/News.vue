<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { newsApi } from '@/api/user/news'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import type { News } from '@/types'

const route = useRoute()
const router = useRouter()

const newsList = ref<News[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

const types = [
  { label: '全部', value: 0 },
  { label: '骗局曝光', value: 'expose' },
  { label: '新闻动态', value: 'news' },
  { label: '案例剖析', value: 'case' }
]
const activeType = ref<number | string>(0)
const keyword = ref('')

async function fetchNews() {
  loading.value = true
  try {
    const res = await newsApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      type: activeType.value || undefined,
      keyword: keyword.value
    })
    newsList.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleTypeChange(type: number | string) {
  activeType.value = type
  page.value = 1
  fetchNews()
}

function handleSearch() {
  page.value = 1
  fetchNews()
}

function handlePageChange(val: number) {
  page.value = val
  fetchNews()
}

function goToDetail(id: number) {
  router.push(`/news/${id}`)
}

watch(() => route.query, (query) => {
  if (query.keyword) {
    keyword.value = query.keyword as string
  }
  if (query.type) {
    activeType.value = query.type as string
  }
  fetchNews()
}, { immediate: true })

onMounted(() => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string
  }
  if (route.query.type) {
    activeType.value = route.query.type as string
  }
  fetchNews()
})
</script>

<template>
  <div class="news-page container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">反诈资讯</h1>
    </div>

    <!-- Filter Section -->
    <div class="filter-section card">
      <div class="filter-tabs">
        <el-radio-group v-model="activeType" @change="handleTypeChange">
          <el-radio-button v-for="t in types" :key="t.value" :value="t.value">
            {{ t.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索资讯"
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

    <!-- News List -->
    <div class="news-list">
      <!-- 骨架屏 -->
      <SkeletonCard v-if="loading" :count="6" :cover-height="180" />
      <!-- 内容 -->
      <div v-else-if="newsList.length === 0" class="empty-state">
        <el-empty description="暂无资讯" />
      </div>
      <div v-else class="news-grid">
        <div
          v-for="news in newsList"
          :key="news.id"
          class="news-card"
          @click="goToDetail(news.id)"
        >
          <div class="news-cover">
            <img v-lazy="news.cover || '/placeholder.jpg'" :alt="news.title" />
            <el-tag v-if="news.type" class="news-type" size="small">
              {{ types.find(t => t.value === news.type)?.label || news.type }}
            </el-tag>
          </div>
          <div class="news-info">
            <div class="news-title">{{ news.title }}</div>
            <div class="news-summary">{{ news.summary }}</div>
            <div class="news-meta">
              <span class="author">{{ news.author }}</span>
              <span class="views">{{ news.views }} 阅读</span>
              <span class="date">{{ news.publishedAt?.split('T')[0] }}</span>
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
.news-page {
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

.news-list {
  min-height: 400px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.news-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.news-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-card:hover .news-cover img {
  transform: scale(1.05);
}

.news-type {
  position: absolute;
  top: 10px;
  left: 10px;
}

.news-info {
  padding: 16px;
}

.news-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-summary {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 992px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .news-grid {
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
