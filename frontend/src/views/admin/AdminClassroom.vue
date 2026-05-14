<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, VideoPlay, ArrowRight } from '@element-plus/icons-vue'
import { adminClassroomApi } from '@/api/admin/classroom'
import type { Chapter, Lesson } from '@/types'
import dayjs from 'dayjs'

const chapters = ref<Chapter[]>([])
const lessons = ref<Lesson[]>([])
const loading = ref(false)
const totalChapters = ref(0)
const totalLessons = ref(0)
const pageChapters = ref(1)
const pageLessons = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const activeChapter = ref<number | null>(null)

const chapterDialogVisible = ref(false)
const lessonDialogVisible = ref(false)
const chapterDialogTitle = ref('新增章节')
const lessonDialogTitle = ref('新增课时')
const chapterFormRef = ref()
const lessonFormRef = ref()

const chapterForm = ref({
  id: 0,
  title: '',
  summary: '',
  cover: '',
  sortOrder: 0,
  status: 1
})

const lessonForm = ref({
  id: 0,
  chapterId: 0,
  title: '',
  summary: '',
  cover: '',
  videoUrl: '',
  duration: 0,
  sortOrder: 0,
  status: 1
})

const chapterRules = {
  title: [{ required: true, message: '请输入章节标题', trigger: 'blur' }]
}

const lessonRules = {
  chapterId: [{ required: true, message: '请选择章节', trigger: 'change' }],
  title: [{ required: true, message: '请输入课时标题', trigger: 'blur' }],
  videoUrl: [{ required: true, message: '请输入视频URL', trigger: 'blur' }]
}

async function fetchChapters() {
  loading.value = true
  try {
    const res = await adminClassroomApi.getChapters({
      page: pageChapters.value,
      pageSize: pageSize.value
    })
    chapters.value = res.list
    totalChapters.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function fetchLessons(chapterId?: number) {
  loading.value = true
  try {
    const res = await adminClassroomApi.getLessons({
      page: pageLessons.value,
      pageSize: pageSize.value,
      chapterId: chapterId ?? activeChapter.value ?? undefined
    })
    lessons.value = res.list
    totalLessons.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageChapters.value = 1
  fetchChapters()
}

function handleChapterPageChange(val: number) {
  pageChapters.value = val
  fetchChapters()
}

function handleLessonsPageChange(val: number) {
  pageLessons.value = val
  fetchLessons()
}

function selectChapter(chapter: Chapter) {
  activeChapter.value = chapter.id
  pageLessons.value = 1
  fetchLessons()
}

function openCreateChapterDialog() {
  chapterDialogTitle.value = '新增章节'
  chapterForm.value = { id: 0, title: '', summary: '', cover: '', sortOrder: 0, status: 1 }
  chapterDialogVisible.value = true
}

function openEditChapterDialog(chapter: Chapter) {
  chapterDialogTitle.value = '编辑章节'
  chapterForm.value = {
    id: chapter.id,
    title: chapter.title,
    summary: chapter.summary,
    cover: chapter.cover,
    sortOrder: chapter.sortOrder,
    status: 1
  }
  chapterDialogVisible.value = true
}

function openCreateLessonDialog() {
  lessonDialogTitle.value = '新增课时'
  lessonForm.value = {
    id: 0,
    chapterId: activeChapter.value || 0,
    title: '',
    summary: '',
    cover: '',
    videoUrl: '',
    duration: 0,
    sortOrder: 0,
    status: 1
  }
  lessonDialogVisible.value = true
}

function openEditLessonDialog(lesson: Lesson) {
  lessonDialogTitle.value = '编辑课时'
  lessonForm.value = {
    id: lesson.id,
    chapterId: lesson.chapterId,
    title: lesson.title,
    summary: lesson.summary,
    cover: lesson.cover,
    videoUrl: lesson.videoUrl,
    duration: lesson.duration,
    sortOrder: lesson.sortOrder,
    status: 1
  }
  lessonDialogVisible.value = true
}

async function handleChapterSubmit() {
  await chapterFormRef.value?.validate()
  try {
    if (chapterForm.value.id) {
      await adminClassroomApi.updateChapter(chapterForm.value.id, chapterForm.value)
      ElMessage.success('更新成功')
    } else {
      await adminClassroomApi.createChapter(chapterForm.value)
      ElMessage.success('创建成功')
    }
    chapterDialogVisible.value = false
    fetchChapters()
  } catch {
    // Error handled
  }
}

async function handleLessonSubmit() {
  await lessonFormRef.value?.validate()
  try {
    if (lessonForm.value.id) {
      await adminClassroomApi.updateLesson(lessonForm.value.id, lessonForm.value)
      ElMessage.success('更新成功')
    } else {
      await adminClassroomApi.createLesson(lessonForm.value)
      ElMessage.success('创建成功')
    }
    lessonDialogVisible.value = false
    fetchLessons()
  } catch {
    // Error handled
  }
}

async function handleDeleteChapter(id: number) {
  await ElMessageBox.confirm('确定要删除该章节吗？关联课时也会被删除', '提示', { type: 'warning' })
  try {
    await adminClassroomApi.deleteChapter(id)
    ElMessage.success('删除成功')
    if (activeChapter.value === id) {
      activeChapter.value = null
      lessons.value = []
    }
    fetchChapters()
  } catch {
    // Error handled
  }
}

async function handleDeleteLesson(id: number) {
  await ElMessageBox.confirm('确定要删除该课时吗？', '提示', { type: 'warning' })
  try {
    await adminClassroomApi.deleteLesson(id)
    ElMessage.success('删除成功')
    fetchLessons()
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchChapters()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">反诈课堂管理</h1>
    </div>

    <div class="classroom-grid">
      <!-- Chapters Panel -->
      <div class="panel chapters-panel">
        <div class="panel-header">
          <h3 class="panel-title">章节管理</h3>
          <el-button type="primary" size="small" @click="openCreateChapterDialog">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>

        <div class="panel-toolbar">
          <el-input v-model="keyword" placeholder="搜索章节" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <el-table v-loading="loading" :data="chapters" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="章节标题" min-width="150" />
          <el-table-column prop="lessonCount" label="课时数" width="80" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="selectChapter(row)">
                <el-icon><ArrowRight /></el-icon>课时
              </el-button>
              <el-button type="primary" link size="small" @click="openEditChapterDialog(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteChapter(row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageChapters" :page-size="pageSize" :total="totalChapters" layout="prev, pager, next" small @current-change="handleChapterPageChange" />
        </div>
      </div>

      <!-- Lessons Panel -->
      <div class="panel lessons-panel">
        <div class="panel-header">
          <h3 class="panel-title">课时管理 {{ activeChapter ? `- 章节 ${activeChapter}` : '' }}</h3>
          <el-button type="primary" size="small" :disabled="!activeChapter" @click="openCreateLessonDialog">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>

        <el-table v-loading="loading" :data="lessons" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="课时标题" min-width="150" />
          <el-table-column prop="duration" label="时长(秒)" width="90" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openEditLessonDialog(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteLesson(row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageLessons" :page-size="pageSize" :total="totalLessons" layout="prev, pager, next" small @current-change="handleLessonsPageChange" />
        </div>
      </div>
    </div>

    <!-- Chapter Dialog -->
    <el-dialog v-model="chapterDialogVisible" :title="chapterDialogTitle" width="500px" destroy-on-close>
      <el-form ref="chapterFormRef" :model="chapterForm" :rules="chapterRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="chapterForm.title" placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="chapterForm.summary" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="chapterForm.cover" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="chapterForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChapterSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Lesson Dialog -->
    <el-dialog v-model="lessonDialogVisible" :title="lessonDialogTitle" width="500px" destroy-on-close>
      <el-form ref="lessonFormRef" :model="lessonForm" :rules="lessonRules" label-width="80px">
        <el-form-item label="章节" prop="chapterId">
          <el-select v-model="lessonForm.chapterId" placeholder="请选择章节" style="width: 100%">
            <el-option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id" :label="chapter.title" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="lessonForm.title" placeholder="请输入课时标题" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="lessonForm.summary" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="lessonForm.cover" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="视频URL" prop="videoUrl">
          <el-input v-model="lessonForm.videoUrl" placeholder="请输入视频URL" />
        </el-form-item>
        <el-form-item label="时长(秒)">
          <el-input-number v-model="lessonForm.duration" :min="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="lessonForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lessonDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLessonSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.classroom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 16px; font-weight: 600; color: #1a1f36; }
.panel-toolbar { margin-bottom: 16px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.view-count { display: flex; align-items: center; gap: 4px; color: #909399; }

@media (max-width: 992px) {
  .classroom-grid { grid-template-columns: 1fr; }
}
</style>