<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { adminNoticeApi, type Notice } from '@/api/admin/notice'
import dayjs from 'dayjs'

const notices = ref<Notice[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref<number | undefined>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增公告')
const formRef = ref()
const form = ref({
  id: 0,
  title: '',
  content: '',
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

async function fetchNotices() {
  loading.value = true
  try {
    const res = await adminNoticeApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value
    })
    notices.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchNotices()
}

function handlePageChange(val: number) {
  page.value = val
  fetchNotices()
}

function openCreateDialog() {
  dialogTitle.value = '新增公告'
  form.value = { id: 0, title: '', content: '', status: 1 }
  dialogVisible.value = true
}

function openEditDialog(notice: Notice) {
  dialogTitle.value = '编辑公告'
  form.value = {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    status: notice.status
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await adminNoticeApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminNoticeApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchNotices()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该公告吗？', '提示', { type: 'warning' })
  try {
    await adminNoticeApi.delete(id)
    ElMessage.success('删除成功')
    fetchNotices()
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">公告管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
            <el-option :value="1" label="已发布" />
            <el-option :value="0" label="草稿" />
          </el-select>
        </div>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>新增公告
        </el-button>
      </div>

      <el-table v-loading="loading" :data="notices" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="公告标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容预览" min-width="250" show-overflow-tooltip />
        <el-table-column prop="publisherName" label="发布人" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">{{ formatDate(row.publishedAt || row.createdAt) }}</template>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
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
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-box { display: flex; gap: 12px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>