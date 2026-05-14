<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { adminQuizApi } from '@/api/admin/quiz'
import type { QuizLevel, Question } from '@/types'

const levels = ref<QuizLevel[]>([])
const questions = ref<Question[]>([])
const loading = ref(false)
const totalLevels = ref(0)
const totalQuestions = ref(0)
const pageLevels = ref(1)
const pageQuestions = ref(1)
const pageSize = ref(10)
const activeLevel = ref<number | null>(null)

const levelDialogVisible = ref(false)
const questionDialogVisible = ref(false)
const levelDialogTitle = ref('新增关卡')
const questionDialogTitle = ref('新增题目')
const levelFormRef = ref()
const questionFormRef = ref()

const levelForm = ref({
  id: 0,
  title: '',
  description: '',
  difficulty: 1,
  sortOrder: 0,
  status: 1
})

const questionForm = ref({
  id: 0,
  quizId: 0,
  title: '',
  type: 'single',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answer: '',
  explanation: '',
  sortOrder: 0
})

const levelRules = {
  title: [{ required: true, message: '请输入关卡标题', trigger: 'blur' }]
}

const questionRules = {
  quizId: [{ required: true, message: '请选择关卡', trigger: 'change' }],
  title: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  optionA: [{ required: true, message: '请输入选项A', trigger: 'blur' }],
  optionB: [{ required: true, message: '请输入选项B', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }]
}

const difficultyOptions = [
  { value: 1, label: '简单' },
  { value: 2, label: '中等' },
  { value: 3, label: '困难' }
]

async function fetchLevels() {
  loading.value = true
  try {
    const res = await adminQuizApi.getLevels({
      page: pageLevels.value,
      pageSize: pageSize.value
    })
    levels.value = res.list
    totalLevels.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function fetchQuestions(quizId?: number) {
  loading.value = true
  try {
    const res = await adminQuizApi.getQuestions({
      page: pageQuestions.value,
      pageSize: pageSize.value,
      quizId: quizId ?? activeLevel.value ?? undefined
    })
    questions.value = res.list
    totalQuestions.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleLevelPageChange(val: number) {
  pageLevels.value = val
  fetchLevels()
}

function handleQuestionPageChange(val: number) {
  pageQuestions.value = val
  fetchQuestions()
}

function selectLevel(level: QuizLevel) {
  activeLevel.value = level.id
  pageQuestions.value = 1
  fetchQuestions()
}

function openCreateLevelDialog() {
  levelDialogTitle.value = '新增关卡'
  levelForm.value = { id: 0, title: '', description: '', difficulty: 1, sortOrder: 0, status: 1 }
  levelDialogVisible.value = true
}

function openEditLevelDialog(level: QuizLevel) {
  levelDialogTitle.value = '编辑关卡'
  levelForm.value = {
    id: level.id,
    title: level.title,
    description: level.description,
    difficulty: level.difficulty,
    sortOrder: level.sortOrder,
    status: 1
  }
  levelDialogVisible.value = true
}

function openCreateQuestionDialog() {
  questionDialogTitle.value = '新增题目'
  questionForm.value = {
    id: 0,
    quizId: activeLevel.value || 0,
    title: '',
    type: 'single',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answer: '',
    explanation: '',
    sortOrder: 0
  }
  questionDialogVisible.value = true
}

function openEditQuestionDialog(question: Question) {
  questionDialogTitle.value = '编辑题目'
  questionForm.value = {
    id: question.id,
    quizId: question.quizId,
    title: question.title,
    type: question.type,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    answer: question.answer,
    explanation: question.explanation,
    sortOrder: question.sortOrder
  }
  questionDialogVisible.value = true
}

async function handleLevelSubmit() {
  await levelFormRef.value?.validate()
  try {
    if (levelForm.value.id) {
      await adminQuizApi.updateLevel(levelForm.value.id, levelForm.value)
      ElMessage.success('更新成功')
    } else {
      await adminQuizApi.createLevel(levelForm.value)
      ElMessage.success('创建成功')
    }
    levelDialogVisible.value = false
    fetchLevels()
  } catch {
    // Error handled
  }
}

async function handleQuestionSubmit() {
  await questionFormRef.value?.validate()
  try {
    if (questionForm.value.id) {
      await adminQuizApi.updateQuestion(questionForm.value.id, questionForm.value)
      ElMessage.success('更新成功')
    } else {
      await adminQuizApi.createQuestion(questionForm.value)
      ElMessage.success('创建成功')
    }
    questionDialogVisible.value = false
    fetchQuestions()
  } catch {
    // Error handled
  }
}

async function handleDeleteLevel(id: number) {
  await ElMessageBox.confirm('确定要删除该关卡吗？关联题目也会被删除', '提示', { type: 'warning' })
  try {
    await adminQuizApi.deleteLevel(id)
    ElMessage.success('删除成功')
    if (activeLevel.value === id) {
      activeLevel.value = null
      questions.value = []
    }
    fetchLevels()
  } catch {
    // Error handled
  }
}

async function handleDeleteQuestion(id: number) {
  await ElMessageBox.confirm('确定要删除该题目吗？', '提示', { type: 'warning' })
  try {
    await adminQuizApi.deleteQuestion(id)
    ElMessage.success('删除成功')
    fetchQuestions()
  } catch {
    // Error handled
  }
}

onMounted(() => {
  fetchLevels()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">反诈自测管理</h1>
    </div>

    <div class="quiz-grid">
      <!-- Levels Panel -->
      <div class="panel levels-panel">
        <div class="panel-header">
          <h3 class="panel-title">关卡管理</h3>
          <el-button type="primary" size="small" @click="openCreateLevelDialog"><el-icon><Plus /></el-icon>新增</el-button>
        </div>

        <el-table v-loading="loading" :data="levels" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="关卡标题" min-width="120" />
          <el-table-column prop="difficulty" label="难度" width="80">
            <template #default="{ row }">
              <el-tag :type="row.difficulty === 1 ? 'success' : row.difficulty === 2 ? 'warning' : 'danger'">
                {{ difficultyOptions.find(d => d.value === row.difficulty)?.label || '未知' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionCount" label="题目数" width="80" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="selectLevel(row)">题目</el-button>
              <el-button type="primary" link size="small" @click="openEditLevelDialog(row)"><el-icon><Edit /></el-icon></el-button>
              <el-button type="danger" link size="small" @click="handleDeleteLevel(row.id)"><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageLevels" :page-size="pageSize" :total="totalLevels" layout="prev, pager, next" small @current-change="handleLevelPageChange" />
        </div>
      </div>

      <!-- Questions Panel -->
      <div class="panel questions-panel">
        <div class="panel-header">
          <h3 class="panel-title">题目管理 {{ activeLevel ? `- 关卡 ${activeLevel}` : '' }}</h3>
          <el-button type="primary" size="small" :disabled="!activeLevel" @click="openCreateQuestionDialog"><el-icon><Plus /></el-icon>新增</el-button>
        </div>

        <el-table v-loading="loading" :data="questions" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="题目" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.type === 'single' ? 'primary' : 'success'">
                {{ row.type === 'single' ? '单选' : '多选' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="answer" label="答案" width="80" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openEditQuestionDialog(row)"><el-icon><Edit /></el-icon></el-button>
              <el-button type="danger" link size="small" @click="handleDeleteQuestion(row.id)"><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageQuestions" :page-size="pageSize" :total="totalQuestions" layout="prev, pager, next" small @current-change="handleQuestionPageChange" />
        </div>
      </div>
    </div>

    <!-- Level Dialog -->
    <el-dialog v-model="levelDialogVisible" :title="levelDialogTitle" width="500px" destroy-on-close>
      <el-form ref="levelFormRef" :model="levelForm" :rules="levelRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="levelForm.title" placeholder="请输入关卡标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="levelForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="levelForm.difficulty" style="width: 100%">
            <el-option v-for="item in difficultyOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="levelForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLevelSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Question Dialog -->
    <el-dialog v-model="questionDialogVisible" :title="questionDialogTitle" width="600px" destroy-on-close>
      <el-form ref="questionFormRef" :model="questionForm" :rules="questionRules" label-width="80px">
        <el-form-item label="关卡" prop="quizId">
          <el-select v-model="questionForm.quizId" placeholder="请选择关卡" style="width: 100%">
            <el-option v-for="level in levels" :key="level.id" :value="level.id" :label="level.title" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目" prop="title">
          <el-input v-model="questionForm.title" type="textarea" :rows="2" placeholder="请输入题目内容" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="questionForm.type">
            <el-radio value="single">单选题</el-radio>
            <el-radio value="multiple">多选题</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选项A" prop="optionA">
          <el-input v-model="questionForm.optionA" placeholder="请输入选项A" />
        </el-form-item>
        <el-form-item label="选项B" prop="optionB">
          <el-input v-model="questionForm.optionB" placeholder="请输入选项B" />
        </el-form-item>
        <el-form-item label="选项C">
          <el-input v-model="questionForm.optionC" placeholder="请输入选项C（可选）" />
        </el-form-item>
        <el-form-item label="选项D">
          <el-input v-model="questionForm.optionD" placeholder="请输入选项D（可选）" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="questionForm.answer" placeholder="单选填A/B/C/D，多选用逗号分隔如A,B" />
        </el-form-item>
        <el-form-item label="解析">
          <el-input v-model="questionForm.explanation" type="textarea" :rows="2" placeholder="请输入答案解析" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="questionForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuestionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.quiz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 16px; font-weight: 600; color: #1a1f36; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }

@media (max-width: 992px) {
  .quiz-grid { grid-template-columns: 1fr; }
}
</style>