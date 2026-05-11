<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { classroomApi } from '@/api/user/classroom'
import type { Lesson } from '@/types'

const route = useRoute()
const router = useRouter()

const lesson = ref<Lesson | null>(null)
const loading = ref(true)

async function fetchLesson() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    lesson.value = await classroomApi.getLessonDetail(id)
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

onMounted(() => {
  fetchLesson()
})
</script>

<template>
  <div class="lesson-detail-page container">
    <div v-loading="loading">
      <template v-if="lesson">
        <!-- Back Button -->
        <div class="back-nav">
          <el-button link @click="router.push(`/classroom/chapter/${lesson.chapterId}`)">
            <el-icon><ArrowLeft /></el-icon>
            返回课时列表
          </el-button>
        </div>

        <!-- Video Player -->
        <div class="video-section card">
          <div class="video-player">
            <video
              :src="lesson.videoUrl"
              controls
              controlslist="nodownload"
              :poster="lesson.cover"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>

        <!-- Lesson Info -->
        <div class="lesson-info card">
          <h1 class="lesson-title">{{ lesson.title }}</h1>
          <div class="lesson-meta">
            <span><el-icon><Clock /></el-icon> {{ formatDuration(lesson.duration) }}</span>
            <span><el-icon><View /></el-icon> {{ lesson.views }} 观看</span>
          </div>
          <div v-if="lesson.summary" class="lesson-summary">
            <h3>课程简介</h3>
            <p>{{ lesson.summary }}</p>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="课时不存在" />
    </div>
  </div>
</template>

<style scoped>
.lesson-detail-page {
  padding: 20px;
  max-width: 1000px;
}

.back-nav {
  margin-bottom: 16px;
}

.video-section {
  margin-bottom: 20px;
  padding: 0;
  overflow: hidden;
}

.video-player {
  width: 100%;
  background: #000;
}

.video-player video {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
}

.lesson-info {
  margin-bottom: 20px;
}

.lesson-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.lesson-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}

.lesson-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-summary {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.lesson-summary h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.lesson-summary p {
  color: #606266;
  line-height: 1.8;
}
</style>
