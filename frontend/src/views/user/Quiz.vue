<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck, Lock } from '@element-plus/icons-vue'
import { quizApi } from '@/api/user/quiz'
import type { QuizLevel } from '@/types'

const router = useRouter()

const levels = ref<QuizLevel[]>([])
const loading = ref(true)

async function fetchLevels() {
  try {
    levels.value = await quizApi.getLevels()
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function goToQuiz(id: number) {
  router.push(`/quiz/${id}`)
}

function getDifficultyColor(difficulty: number) {
  if (difficulty <= 2) return '#67c23a'
  if (difficulty <= 4) return '#e6a23c'
  return '#f56c6c'
}

function getDifficultyText(difficulty: number) {
  if (difficulty <= 2) return '简单'
  if (difficulty <= 4) return '中等'
  return '困难'
}

onMounted(() => {
  fetchLevels()
})
</script>

<template>
  <div class="quiz-page container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">反诈自测</h1>
      <p class="page-desc">通过闯关答题，测试您的防骗能力</p>
    </div>

    <!-- Level List -->
    <div v-loading="loading" class="level-list">
      <div v-if="levels.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无关卡" />
      </div>
      <div v-else class="level-grid">
        <div
          v-for="(level, index) in levels"
          :key="level.id"
          class="level-card"
          :class="{ passed: level.passed }"
          @click="goToQuiz(level.id)"
        >
          <div class="level-index">
            <span>{{ index + 1 }}</span>
          </div>
          <div class="level-info">
            <div class="level-title">{{ level.title }}</div>
            <div class="level-desc">{{ level.description }}</div>
            <div class="level-meta">
              <el-tag
                :color="getDifficultyColor(level.difficulty)"
                effect="dark"
                size="small"
              >
                {{ getDifficultyText(level.difficulty) }}
              </el-tag>
              <span class="question-count">{{ level.questionCount }} 题</span>
            </div>
          </div>
          <div class="level-status">
            <el-icon v-if="level.passed" class="passed-icon"><CircleCheck /></el-icon>
            <el-icon v-else class="lock-icon"><Lock /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  padding: 20px;
}

.page-desc {
  color: #909399;
  margin-top: 8px;
}

.level-list {
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.level-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.level-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.level-card.passed {
  border-color: #67c23a;
}

.level-index {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.level-info {
  flex: 1;
}

.level-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.level-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.level-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-count {
  font-size: 12px;
  color: #909399;
}

.level-status {
  flex-shrink: 0;
}

.passed-icon {
  font-size: 32px;
  color: #67c23a;
}

.lock-icon {
  font-size: 32px;
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .level-grid {
    grid-template-columns: 1fr;
  }
}
</style>
