<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { VideoPlay } from '@element-plus/icons-vue'
import { classroomApi } from '@/api/user/classroom'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import type { Chapter } from '@/types'

const router = useRouter()

const chapters = ref<Chapter[]>([])
const loading = ref(true)

async function fetchChapters() {
  try {
    chapters.value = await classroomApi.getChapters()
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function goToChapter(id: number) {
  router.push(`/classroom/chapter/${id}`)
}

onMounted(() => {
  fetchChapters()
})
</script>

<template>
  <div class="classroom-page container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">反诈课堂</h1>
      <p class="page-desc">系统学习反诈知识，提高防骗意识</p>
    </div>

    <!-- Chapter List -->
    <div class="chapter-list">
      <!-- 骨架屏 -->
      <SkeletonCard v-if="loading" :count="6" :cover-height="180" />
      <!-- 内容 -->
      <div v-else-if="chapters.length === 0" class="empty-state">
        <el-empty description="暂无课程章节" />
      </div>
      <div v-else class="chapter-grid">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-card"
          @click="goToChapter(chapter.id)"
        >
          <div class="chapter-cover">
            <img v-lazy="chapter.cover || '/placeholder.jpg'" :alt="chapter.title" />
            <div class="lesson-count">
              <el-icon><VideoPlay /></el-icon>
              {{ chapter.lessonCount }} 课时
            </div>
          </div>
          <div class="chapter-info">
            <div class="chapter-title">{{ chapter.title }}</div>
            <div class="chapter-summary">{{ chapter.summary }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classroom-page {
  padding: 20px;
}

.page-desc {
  color: #909399;
  margin-top: 8px;
}

.chapter-list {
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.chapter-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.chapter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chapter-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.chapter-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.chapter-card:hover .chapter-cover img {
  transform: scale(1.05);
}

.lesson-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chapter-info {
  padding: 16px;
}

.chapter-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.chapter-summary {
  font-size: 13px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 992px) {
  .chapter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .chapter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
