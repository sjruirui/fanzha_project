<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '@/api/user/profile'
import type { Report } from '@/types'
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
    const res = await profileApi.getReports({ page: page.value, pageSize: pageSize.value })
    reports.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function handlePageChange(val: number) {
  page.value = val
  fetchReports()
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <div class="profile-reports-page card">
    <h3 class="section-title">我的举报</h3>

    <div v-loading="loading" class="report-list">
      <div v-if="reports.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无举报记录">
          <el-button type="primary" @click="router.push('/report')">立即举报</el-button>
        </el-empty>
      </div>
      <div v-else class="reports">
        <div v-for="report in reports" :key="report.id" class="report-item">
          <div class="report-header">
            <span class="report-title">{{ report.title }}</span>
            <el-tag :type="statusMap[report.status]?.type || 'info'" size="small">
              {{ statusMap[report.status]?.label || '未知' }}
            </el-tag>
          </div>
          <div class="report-meta">
            <span>{{ report.type }}</span>
            <span>{{ report.amount?.toLocaleString() || 0 }} 元</span>
            <span>{{ formatDate(report.createdAt) }}</span>
          </div>
          <div v-if="report.remark" class="report-remark">
            处理备注：{{ report.remark }}
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
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.report-list {
  min-height: 300px;
}

.reports {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.report-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.report-remark {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
