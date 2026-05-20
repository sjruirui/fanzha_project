<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import { adminKnowledgeApi } from '@/api/admin/knowledge'
import type { Knowledge } from '@/types'
import dayjs from 'dayjs'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import ImageUpload from '@/components/common/ImageUpload.vue'

const knowledgeList = ref<Knowledge[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const typeFilter = ref('')
const targetGroupFilter = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增知识')
const formRef = ref()
const form = ref({
  id: 0,
  title: '',
  summary: '',
  cover: '',
  content: '',
  type: '',
  targetGroup: '',
  tags: '',
  status: 1
})
const selectedIds = ref<number[]>([])
const editorRef = shallowRef()

const typeOptions = [
  { value: '电信诈骗', label: '电信诈骗' },
  { value: '网络诈骗', label: '网络诈骗' },
  { value: '金融诈骗', label: '金融诈骗' },
  { value: '其他', label: '其他' }
]

const targetGroupOptions = [
  { value: '老年人', label: '老年人' },
  { value: '青少年', label: '青少年' },
  { value: '大学生', label: '大学生' },
  { value: '企业员工', label: '企业员工' },
  { value: '全体', label: '全体' }
]

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

async function fetchKnowledge() {
  loading.value = true
  try {
    const res = await adminKnowledgeApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      type: typeFilter.value,
      targetGroup: targetGroupFilter.value
    })
    knowledgeList.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchKnowledge()
}

function handlePageChange(val: number) {
  page.value = val
  fetchKnowledge()
}

function openCreateDialog() {
  dialogTitle.value = '新增知识'
  form.value = {
    id: 0,
    title: '',
    summary: '',
    cover: '',
    content: '',
    type: '',
    targetGroup: '',
    tags: '',
    status: 1
  }
  dialogVisible.value = true
}

function openEditDialog(item: Knowledge) {
  dialogTitle.value = '编辑知识'
  form.value = {
    id: item.id,
    title: item.title,
    summary: item.summary,
    cover: item.cover,
    content: item.content,
    type: item.type,
    targetGroup: item.targetGroup,
    tags: item.tags,
    status: 1
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await adminKnowledgeApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminKnowledgeApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchKnowledge()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该知识吗？', '提示', { type: 'warning' })
  try {
    await adminKnowledgeApi.delete(id)
    ElMessage.success('删除成功')
    fetchKnowledge()
  } catch {
    // Error handled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的知识')
    return
  }
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条知识吗？`, '提示', { type: 'warning' })
  try {
    await adminKnowledgeApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchKnowledge()
  } catch {
    // Error handled
  }
}

function handleSelectionChange(selection: Knowledge[]) {
  selectedIds.value = selection.map(item => item.id)
}

function handleEditorCreated(editor: any) {
  editorRef.value = editor
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchKnowledge()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">反诈知识库管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-input v-model="keyword" placeholder="搜索标题" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="typeFilter" placeholder="类型" clearable @change="handleSearch">
            <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <el-select v-model="targetGroupFilter" placeholder="人群分类" clearable @change="handleSearch">
            <el-option v-for="item in targetGroupOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="openCreateDialog"><el-icon><Plus /></el-icon>新增知识</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete"><el-icon><Delete /></el-icon>批量删除</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag>{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="targetGroup" label="人群分类" width="100">
          <template #default="{ row }"><el-tag type="success">{{ row.targetGroup }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100">
          <template #default="{ row }"><span class="view-count"><el-icon><View /></el-icon>{{ row.views }}</span></template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人群">
              <el-select v-model="form.targetGroup" placeholder="请选择人群分类" style="width: 100%">
                <el-option v-for="item in targetGroupOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="简介">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="封面">
          <ImageUpload v-model="form.cover" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
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
.view-count { display: flex; align-items: center; gap: 4px; color: #909399; }
</style>
