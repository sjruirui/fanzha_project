<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Clock, View } from '@element-plus/icons-vue'
import { newsApi } from '@/api/user/news'
import type { News } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const news = ref<News | null>(null)
const relatedNews = ref<News[]>([])
const loading = ref(true)

function getImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder.jpg'
  const normalizedPath = path.replace(/\\/g, '/')
  return normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath
}

async function fetchNews() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const [detail, related] = await Promise.all([
      newsApi.getDetail(id),
      newsApi.getRelated(id)
    ])
    news.value = detail
    relatedNews.value = related
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function goToNews(id: number) {
  router.push(`/news/${id}`)
}

// Watch for route param changes to re-fetch data
watch(() => route.params.id, () => {
  fetchNews()
})

onMounted(() => {
  fetchNews()
})
</script>

<template>
  <div class="news-detail-page container">
    <div v-loading="loading">
      <template v-if="news">
        <!-- Article Header -->
        <div class="article-header card">
          <h1 class="article-title">{{ news.title }}</h1>
          <div class="article-meta">
            <span class="author">
              <el-icon><User /></el-icon>
              {{ news.author }}
            </span>
            <span class="date">
              <el-icon><Clock /></el-icon>
              {{ formatDate(news.publishedAt || news.createdAt) }}
            </span>
            <span class="views">
              <el-icon><View /></el-icon>
              {{ news.views }} 阅读
            </span>
            <el-tag v-if="news.type" size="small">{{ news.type }}</el-tag>
          </div>
        </div>

        <!-- Article Content -->
        <div class="article-content card">
          <div class="rich-content" v-html="news.content"></div>
        </div>

        <!-- Tags -->
        <div v-if="news.tags" class="article-tags card">
          <span class="tag-label">标签：</span>
          <el-tag
            v-for="tag in news.tags.split(',')"
            :key="tag"
            class="tag-item"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- Related News -->
        <div v-if="relatedNews.length > 0" class="related-section card">
          <h3 class="section-title">相关资讯</h3>
          <div class="related-list">
            <div
              v-for="item in relatedNews"
              :key="item.id"
              class="related-item"
              @click="goToNews(item.id)"
            >
              <img :src="getImageUrl(item.cover)" :alt="item.title" />
              <div class="related-info">
                <div class="related-title">{{ item.title }}</div>
                <div class="related-date">{{ formatDate(item.createdAt).split(' ')[0] }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="资讯不存在" />
    </div>
  </div>
</template>

<style scoped>
.news-detail-page {
  padding: 20px;
  max-width: 900px;
}

.article-header {
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-content {
  margin-bottom: 20px;
}

.article-tags {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-label {
  color: #606266;
  font-size: 14px;
}

.tag-item {
  cursor: pointer;
}

.related-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.3s;
}

.related-item:hover {
  background: #f5f7fa;
}

.related-item img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.related-info {
  flex: 1;
}

.related-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-date {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 22px;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
  }

  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
