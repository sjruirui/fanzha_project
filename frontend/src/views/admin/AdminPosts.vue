<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Edit, Delete, View, ChatDotRound, Star, Check } from '@element-plus/icons-vue'
import { adminPostApi } from '@/api/admin/post'
import { adminCategoryApi } from '@/api/admin/category'
import type { Post, Category } from '@/types'
import dayjs from 'dayjs'

const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const categoryFilter = ref<number | undefined>()
const statusFilter = ref<number | undefined>()
const selectedIds = ref<number[]>([])

const editDialogVisible = ref(false)
const formRef = ref()
const form = ref({
  id: 0,
  categoryId: 0,
  title: '',
  summary: '',
  cover: '',
  content: '',
  tags: '',
  status: 1
})

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待审核', type: 'warning' },
  1: { label: '已发布', type: 'success' },
  2: { label: '已拒绝', type: 'danger' }
}

async function fetchPosts() {
  loading.value = true
  try {
    const res = await adminPostApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      categoryId: categoryFilter.value,
      status: statusFilter.value
    })
    posts.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await adminCategoryApi.getList()
    categories.value = res.categories
  } catch {
    // Error handled
  }
}

function handleSearch() {
  page.value = 1
  fetchPosts()
}

function handlePageChange(val: number) {
  page.value = val
  fetchPosts()
}

function openEditDialog(post: Post) {
  form.value = {
    id: post.id,
    categoryId: post.categoryId,
    title: post.title,
    summary: post.summary,
    cover: post.cover,
    content: post.content,
    tags: post.tags,
    status: post.status
  }
  editDialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    await adminPostApi.update(form.value.id, form.value)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchPosts()
  } catch {
    // Error handled
  }
}

async function handleAudit(id: number, status: number) {
  const statusText = status === 1 ? '通过' : '拒绝'
  await ElMessageBox.confirm(`确定要${statusText}该帖子吗？`, '提示', { type: 'warning' })
  try {
    await adminPostApi.audit(id, status)
    ElMessage.success(`${statusText}成功`)
    fetchPosts()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该帖子吗？', '提示', { type: 'warning' })
  try {
    await adminPostApi.delete(id)
    ElMessage.success('删除成功')
    fetchPosts()
  } catch {
    // Error handled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的帖子')
    return
  }
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个帖子吗？`, '提示', { type: 'warning' })
  try {
    await adminPostApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchPosts()
  } catch {
    // Error handled
  }
}

function handleSelectionChange(selection: Post[]) {
  selectedIds.value = selection.map(item => item.id)
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchPosts()
  fetchCategories()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">帖子管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-input v-model="keyword" placeholder="搜索标题" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="categoryFilter" placeholder="分类" clearable @change="handleSearch">
            <el-option v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" clearable @change="handleSearch">
            <el-option :value="0" label="待审核" />
            <el-option :value="1" label="已发布" />
            <el-option :value="2" label="已拒绝" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>

      <el-table v-loading="loading" :data="posts" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="100">
          <template #default="{ row }"><el-tag>{{ row.categoryName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="author.nickname" label="作者" width="100" />
        <el-table-column label="统计" width="150">
          <template #default="{ row }">
            <div class="stats">
              <span><el-icon><View /></el-icon>{{ row.views }}</span>
              <span><el-icon><ChatDotRound /></el-icon>{{ row.comments }}</span>
              <span><el-icon><Star /></el-icon>{{ row.likes }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button v-if="row.status === 0" type="success" link @click="handleAudit(row.id, 1)"><el-icon><Check /></el-icon>通过</el-button>
            <el-button v-if="row.status === 0" type="warning" link @click="handleAudit(row.id, 2)">拒绝</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
      </div>
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑帖子" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="form.cover" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :value="0" label="待审核" />
            <el-option :value="1" label="已发布" />
            <el-option :value="2" label="已拒绝" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
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
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
.stats { display: flex; gap: 12px; }
.stats span { display: flex; align-items: center; gap: 4px; color: #909399; font-size: 13px; }
</style>