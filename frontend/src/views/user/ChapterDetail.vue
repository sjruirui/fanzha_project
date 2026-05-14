<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
import { classroomApi } from '@/api/user/classroom'
import type { Chapter, Lesson } from '@/types'

const route = useRoute()
const router = useRouter()

const chapter = ref<Chapter | null>(null)
const lessons = ref<Lesson[]>([])
const loading = ref(true)

async function fetchData() {
  const chapterId = Number(route.params.id)
  loading.value = true
  try {
    const [chapterData, lessonsData] = await Promise.all([
      classroomApi.getChapters(),
      classroomApi.getChapterLessons(chapterId)
    ])
    chapter.value = chapterData.find(c => c.id === chapterId) || null
    lessons.value = lessonsData
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function goToLesson(id: number) {
  router.push(`/classroom/lesson/${id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="chapter-detail-page container">
    <div v-loading="loading">
      <template v-if="chapter">
        <!-- Chapter Header -->
        <div class="chapter-header card">
          <el-button link @click="router.push('/classroom')">
            <el-icon><ArrowLeft /></el-icon>
            返回章节列表
          </el-button>
          <h1 class="chapter-title">{{ chapter.title }}</h1>
          <p class="chapter-summary">{{ chapter.summary }}</p>
          <div class="chapter-meta">
            <span><el-icon><VideoPlay /></el-icon> {{ chapter.lessonCount }} 课时</span>
          </div>
        </div>

        <!-- Lesson List -->
        <div class="lesson-list card">
          <h3 class="list-title">课时列表</h3>
          <div v-if="lessons.length === 0" class="empty-state">
            <el-empty description="暂无课时" />
          </div>
          <div v-else class="lessons">
            <div
              v-for="(lesson, index) in lessons"
              :key="lesson.id"
              class="lesson-item"
              @click="goToLesson(lesson.id)"
            >
              <div class="lesson-index">{{ index + 1 }}</div>
              <div class="lesson-cover">
                <img :src="lesson.cover || '/placeholder.jpg'" :alt="lesson.title" />
                <div class="play-icon">
                  <el-icon :size="24"><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="lesson-info">
                <div class="lesson-title">{{ lesson.title }}</div>
                <div class="lesson-meta">
                  <span>{{ lesson.summary }}</span>
                  <span class="duration">{{ formatDuration(lesson.duration) }}</span>
                </div>
              </div>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="章节不存在" />
    </div>
  </div>
</template>

<style scoped>
.chapter-detail-page {
  padding: 20px;
  max-width: 900px;
}

.chapter-header {
  margin-bottom: 20px;
}

.chapter-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0;
}

.chapter-summary {
  color: #606266;
  margin-bottom: 12px;
}

.chapter-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.chapter-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-list {
  margin-bottom: 20px;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.lesson-item:hover {
  background: #f5f7fa;
}

.lesson-index {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-cover {
  width: 120px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.lesson-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.lesson-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #909399;
}

.duration {
  color: #409eff;
}

.arrow {
  color: #c0c4cc;
}

@media (max-width: 576px) {
  .lesson-cover {
    width: 100px;
    height: 60px;
  }
}
</style>
