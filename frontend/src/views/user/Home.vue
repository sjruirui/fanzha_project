<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { homeApi } from '@/api/user/home'
import { newsApi } from '@/api/user/news'
import type { Banner, News } from '@/types'

const router = useRouter()

const banners = ref<Banner[]>([])
const recommendNews = ref<News[]>([])
const loading = ref(true)

const quickLinks = [
  { title: '反诈资讯', desc: '了解最新骗局', icon: 'Document', path: '/news', color: '#409eff' },
  { title: '反诈课堂', desc: '观看反诈视频', icon: 'VideoPlay', path: '/classroom', color: '#67c23a' },
  { title: '反诈自测', desc: '测试防骗能力', icon: 'EditPen', path: '/quiz', color: '#e6a23c' },
  { title: '在线举报', desc: '上报诈骗案件', icon: 'Warning', path: '/report', color: '#f56c6c' }
]

onMounted(async () => {
  try {
    const [bannerData, recommendData] = await Promise.all([
      homeApi.getBanners(),
      homeApi.getRecommend()
    ])
    banners.value = bannerData
    recommendNews.value = recommendData.news?.slice(0, 6) || []
  } catch {
    // Error handled by API
  } finally {
    loading.value = false
  }
})

function goToLink(link: string) {
  if (link.startsWith('http')) {
    window.open(link, '_blank')
  } else {
    router.push(link)
  }
}
</script>

<template>
  <div class="home-page">
    <!-- Banner Carousel -->
    <div class="banner-section">
      <el-carousel height="400px" :interval="5000">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" @click="goToLink(banner.link)">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-title">{{ banner.title }}</div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- Quick Links -->
    <div class="container">
      <div class="quick-links">
        <div
          v-for="link in quickLinks"
          :key="link.path"
          class="quick-link-item"
          @click="router.push(link.path)"
        >
          <div class="link-icon" :style="{ background: link.color }">
            <el-icon :size="32"><component :is="link.icon" /></el-icon>
          </div>
          <div class="link-info">
            <div class="link-title">{{ link.title }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Recommended News -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">推荐资讯</h2>
          <el-button type="primary" link @click="router.push('/news')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div v-loading="loading" class="news-grid">
          <div
            v-for="news in recommendNews"
            :key="news.id"
            class="news-card"
            @click="router.push(`/news/${news.id}`)"
          >
            <div class="news-cover">
              <img :src="news.cover || '/placeholder.jpg'" :alt="news.title" />
            </div>
            <div class="news-info">
              <div class="news-title">{{ news.title }}</div>
              <div class="news-meta">
                <span>{{ news.author }}</span>
                <span>{{ news.views }} 阅读</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.banner-section {
  margin-bottom: 30px;
}

.banner-item {
  height: 100%;
  cursor: pointer;
  position: relative;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.quick-link-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.link-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.link-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.link-desc {
  font-size: 13px;
  color: #909399;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
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
  height: 160px;
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

.news-info {
  padding: 16px;
}

.news-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 992px) {
  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .quick-links {
    grid-template-columns: 1fr;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
