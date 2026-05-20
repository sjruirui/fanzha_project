<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, View, Star, User } from '@element-plus/icons-vue'
import { adminActivityApi } from '@/api/admin/activity'
import type { Activity } from '@/types'
import dayjs from 'dayjs'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import ImageUpload from '@/components/common/ImageUpload.vue'

const activities = ref<Activity[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const formFilter = ref('')
const statusFilter = ref<number | undefined>()
const selectedIds = ref<number[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增活动')
const formRef = ref()
const form = ref({
  id: 0,
  title: '',
  summary: '',
  cover: '',
  content: '',
  organizer: '',
  form: 'online',
  address: '',
  startTime: '',
  endTime: '',
  status: 1
})
const editorRef = shallowRef()

const formOptions = [
  { value: 'online', label: '线上活动' },
  { value: 'offline', label: '线下活动' }
]

const rules = {
  title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入活动内容', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

async function fetchActivities() {
  loading.value = true
  try {
    const res = await adminActivityApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      form: formFilter.value,
      status: statusFilter.value
    })
    activities.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchActivities()
}

function handlePageChange(val: number) {
  page.value = val
  fetchActivities()
}

function openCreateDialog() {
  dialogTitle.value = '新增活动'
  form.value = {
    id: 0,
    title: '',
    summary: '',
    cover: '',
    content: '',
    organizer: '',
    form: 'online',
    address: '',
    startTime: '',
    endTime: '',
    status: 1
  }
  dialogVisible.value = true
}

function openEditDialog(activity: Activity) {
  dialogTitle.value = '编辑活动'
  form.value = {
    id: activity.id,
    title: activity.title,
    summary: activity.summary,
    cover: activity.cover,
    content: activity.content,
    organizer: activity.organizer,
    form: activity.form,
    address: activity.address,
    startTime: activity.startTime,
    endTime: activity.endTime,
    status: activity.status
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await adminActivityApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminActivityApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchActivities()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该活动吗？', '提示', { type: 'warning' })
  try {
    await adminActivityApi.delete(id)
    ElMessage.success('删除成功')
    fetchActivities()
  } catch {
    // Error handled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的活动')
    return
  }
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个活动吗？`, '提示', { type: 'warning' })
  try {
    await adminActivityApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchActivities()
  } catch {
    // Error handled
  }
}

function handleSelectionChange(selection: Activity[]) {
  selectedIds.value = selection.map(item => item.id)
}

function handleEditorCreated(editor: any) {
  editorRef.value = editor
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">活动管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-input v-model="keyword" placeholder="搜索活动名称" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="formFilter" placeholder="活动形式" clearable @change="handleSearch">
            <el-option v-for="item in formOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>新增活动</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete"><el-icon><Delete /></el-icon>批量删除</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="activities" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="活动名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="form" label="形式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.form === 'online' ? 'primary' : 'success'">
              {{ row.form === 'online' ? '线上' : '线下' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            <div class="time-range">
              <div>{{ formatDate(row.startTime) }}</div>
              <div>至</div>
              <div>{{ formatDate(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="130">
          <template #default="{ row }">
            <div class="stats">
              <span><el-icon><View /></el-icon>{{ row.views }}</span>
              <span><el-icon><Star /></el-icon>{{ row.likes }}</span>
              <span><el-icon><User /></el-icon>{{ row.signs }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close top="5vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动形式">
              <el-select v-model="form.form" style="width: 100%">
                <el-option v-for="item in formOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主办方">
              <el-input v-model="form.organizer" placeholder="请输入主办方" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动地址">
          <el-input v-model="form.address" placeholder="请输入活动地址（线上活动可留空）" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="请选择开始时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="请选择结束时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="简介">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="封面">
          <ImageUpload v-model="form.cover" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div style="border: 1px solid #ccc; width: 100%">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" mode="simple" />
            <Editor v-model="form.content" style="height: 300px; overflow-y: hidden" mode="simple" @onCreated="handleEditorCreated" />
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">发布</el-radio>
            <el-radio :value="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.content-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.search-box { display: flex; gap: 12px; flex-wrap: wrap; }
.search-box .el-input { width: 200px; }
.action-buttons { display: flex; gap: 12px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
.time-range { font-size: 12px; color: #606266; }
.time-range div { line-height: 1.5; }
.stats { display: flex; gap: 12px; }
.stats span { display: flex; align-items: center; gap: 4px; color: #909399; font-size: 13px; }
</style>