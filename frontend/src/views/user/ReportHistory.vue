<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, CollectionTag, Money, Clock } from '@element-plus/icons-vue'
import { reportApi } from '@/api/user/report'
import type { Report, PaginatedResponse } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const reports = ref<Report[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待处理', type: 'warning' },
  1: { label: '处理中', type: 'primary' },
  2: { label: '已处理', type: 'success' },
  3: { label: '已驳回', type: 'danger' }
}

async function fetchReports() {
  loading.value = true
  try {
    const res: PaginatedResponse<Report> = await reportApi.getList({
      page: page.value,
      pageSize: pageSize.value
    })
    reports.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function handlePageChange(val: number) {
  page.value = val
  fetchReports()
}

function goToDetail(id: number) {
  router.push(`/report/${id}`)
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <div class="report-history-page container">
    <div class="page-header">
      <h1 class="page-title">举报记录</h1>
      <el-button type="primary" @click="router.push('/report')">
        <el-icon><Plus /></el-icon>
        新建举报
      </el-button>
    </div>

    <div v-loading="loading" class="report-list">
      <div v-if="reports.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无举报记录">
          <el-button type="primary" @click="router.push('/report')">立即举报</el-button>
        </el-empty>
      </div>
      <div v-else class="reports">
        <div v-for="report in reports" :key="report.id" class="report-item card">
          <div class="report-header">
            <h3 class="report-title">{{ report.title }}</h3>
            <el-tag :type="statusMap[report.status]?.type || 'info'" size="small">
              {{ statusMap[report.status]?.label || '未知' }}
            </el-tag>
          </div>
          <div class="report-meta">
            <span class="meta-item">
              <el-icon><CollectionTag /></el-icon>
              {{ report.type }}
            </span>
            <span class="meta-item">
              <el-icon><Money /></el-icon>
              {{ report.amount?.toLocaleString() || 0 }} 元
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDate(report.createdAt) }}
            </span>
          </div>
          <div class="report-desc">{{ report.description }}</div>
          <div v-if="report.remark" class="report-remark">
            <span class="remark-label">处理备注：</span>
            {{ report.remark }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.report-history-page {
  padding: 20px;
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-list {
  min-height: 400px;
}

.reports {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-item {
  padding: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.report-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.report-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-remark {
  margin-top: 12px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.remark-label {
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
