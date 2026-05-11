<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { quizApi } from '@/api/user/quiz'
import type { Question } from '@/types'

const route = useRoute()
const router = useRouter()

const questions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<Record<number, string>>({})
const loading = ref(true)
const submitted = ref(false)
const result = ref<{ score: number; correctCount: number; passed: boolean } | null>(null)

const currentQuestion = computed(() => questions.value[currentIndex.value])

const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)

const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentIndex.value + 1) / questions.value.length) * 100
})

async function fetchQuestions() {
  const levelId = Number(route.params.id)
  loading.value = true
  try {
    questions.value = await quizApi.getQuestions(levelId)
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function selectOption(option: string) {
  if (submitted.value) return
  answers.value[currentQuestion.value!.id] = option
}

function isSelected(option: string): boolean {
  return answers.value[currentQuestion.value?.id] === option
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

async function submitQuiz() {
  const unanswered = questions.value.filter(q => !answers.value[q.id])
  if (unanswered.length > 0) {
    try {
      await ElMessageBox.confirm(`还有 ${unanswered.length} 题未作答，确定提交吗？`, '提示', {
        confirmButtonText: '确定提交',
        cancelButtonText: '继续作答',
        type: 'warning'
      })
    } catch {
      return
    }
  }

  const levelId = Number(route.params.id)
  const answerList = Object.entries(answers.value).map(([questionId, answer]) => ({
    questionId: Number(questionId),
    answer
  }))

  try {
    result.value = await quizApi.submit(levelId, answerList)
    submitted.value = true
    if (result.value.passed) {
      ElMessage.success('恭喜通关！')
    } else {
      ElMessage.warning(`得分 ${result.value.score} 分，继续加油！`)
    }
  } catch {
    // Error handled
  }
}

function goBack() {
  router.push('/quiz')
}

onMounted(() => {
  fetchQuestions()
})
</script>

<template>
  <div class="quiz-detail-page container">
    <div v-loading="loading" class="quiz-container">
      <template v-if="currentQuestion && !submitted">
        <!-- Progress -->
        <div class="progress-section card">
          <div class="progress-info">
            <span>第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
            <span v-if="result">{{ result.score }} 分</span>
          </div>
          <el-progress :percentage="progress" :stroke-width="10" />
        </div>

        <!-- Question -->
        <div class="question-section card">
          <div class="question-type">
            <el-tag :type="currentQuestion.type === 'single' ? 'primary' : 'success'">
              {{ currentQuestion.type === 'single' ? '单选题' : '多选题' }}
            </el-tag>
          </div>
          <h2 class="question-title">{{ currentQuestion.title }}</h2>

          <!-- Options -->
          <div class="options">
            <div
              v-for="option in ['A', 'B', 'C', 'D']"
              :key="option"
              class="option-item"
              :class="{ selected: isSelected(option) }"
              @click="selectOption(option)"
            >
              <div class="option-label">{{ option }}</div>
              <div class="option-text">{{ currentQuestion[`option${option}` as keyof Question] }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-section card">
          <el-button :disabled="currentIndex === 0" @click="prevQuestion">
            <el-icon><ArrowLeft /></el-icon>
            上一题
          </el-button>
          <div class="nav-dots">
            <span
              v-for="(_, index) in questions"
              :key="index"
              class="dot"
              :class="{ active: index === currentIndex, answered: answers[questions[index]?.id] }"
              @click="currentIndex = index"
            />
          </div>
          <el-button v-if="!isLastQuestion" type="primary" @click="nextQuestion">
            下一题
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-else type="success" @click="submitQuiz">
            提交答卷
          </el-button>
        </div>
      </template>

      <!-- Result -->
      <template v-else-if="submitted && result">
        <div class="result-section card">
          <div class="result-icon">
            <el-icon v-if="result.passed" :size="80" color="#67c23a"><CircleCheck /></el-icon>
            <el-icon v-else :size="80" color="#f56c6c"><CircleClose /></el-icon>
          </div>
          <h2 class="result-title">{{ result.passed ? '恭喜通关！' : '继续加油！' }}</h2>
          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-value">{{ result.score }}</div>
              <div class="stat-label">得分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ result.correctCount }}/{{ questions.length }}</div>
              <div class="stat-label">正确</div>
            </div>
          </div>
          <div class="result-actions">
            <el-button type="primary" @click="goBack">返回关卡列表</el-button>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="暂无题目" />
    </div>
  </div>
</template>

<style scoped>
.quiz-detail-page {
  padding: 20px;
  max-width: 800px;
}

.quiz-container {
  min-height: 500px;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.question-section {
  margin-bottom: 20px;
}

.question-type {
  margin-bottom: 16px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.option-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #606266;
}

.option-item.selected .option-label {
  background: #409eff;
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 15px;
  color: #303133;
}

.nav-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-dots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #409eff;
  transform: scale(1.2);
}

.dot.answered {
  background: #67c23a;
}

.dot.answered.active {
  background: #409eff;
}

.result-section {
  text-align: center;
  padding: 40px;
}

.result-icon {
  margin-bottom: 20px;
}

.result-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 30px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

.result-actions {
  margin-top: 20px;
}
</style>
