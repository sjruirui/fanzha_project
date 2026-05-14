<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { adminCommentApi } from '@/api/admin/comment'
import type { Comment } from '@/types'
import dayjs from 'dayjs'

const comments = ref<Comment[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const targetTypeFilter = ref('')
const selectedIds = ref<number[]>([])

const targetTypeOptions = [
  { value: 'post', label: '帖子' },
  { value: 'activity', label: '活动' }
]

async function fetchComments() {
  loading.value = true
  try {
    const res = await adminCommentApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      targetType: targetTypeFilter.value
    })
    comments.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchComments()
}

function handlePageChange(val: number) {
  page.value = val
  fetchComments()
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该评论吗？', '提示', { type: 'warning' })
  try {
    await adminCommentApi.delete(id)
    ElMessage.success('删除成功')
    fetchComments()
  } catch {
    // Error handled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的评论')
    return
  }
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条评论吗？`, '提示', { type: 'warning' })
  try {
    await adminCommentApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchComments()
  } catch {
    // Error handled
  }
}

function handleSelectionChange(selection: Comment[]) {
  selectedIds.value = selection.map(item => item.id)
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">评论管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-select v-model="targetTypeFilter" placeholder="模块筛选" clearable @change="handleSearch">
            <el-option v-for="item in targetTypeOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>

      <el-table v-loading="loading" :data="comments" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user.nickname" label="评论用户" width="100" />
        <el-table-column prop="targetType" label="模块" width="80">
          <template #default="{ row }">
            <el-tag :type="row.targetType === 'post' ? 'primary' : 'success'">
              {{ row.targetType === 'post' ? '帖子' : '活动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标ID" width="80" />
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="评论时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row.id)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
      </div>
    </div>
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