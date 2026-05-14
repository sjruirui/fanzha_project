<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, Edit, Delete } from '@element-plus/icons-vue'
import { adminReportApi } from '@/api/admin/report'
import type { Report } from '@/types'
import dayjs from 'dayjs'

const reports = ref<Report[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const typeFilter = ref('')
const statusFilter = ref<number | undefined>()

const detailDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const selectedReport = ref<Report | null>(null)
const handleForm = ref({
  status: 1,
  remark: ''
})

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待处理', type: 'warning' },
  1: { label: '处理中', type: 'primary' },
  2: { label: '已处理', type: 'success' },
  3: { label: '已驳回', type: 'danger' }
}

const typeOptions = [
  { value: '电信诈骗', label: '电信诈骗' },
  { value: '网络诈骗', label: '网络诈骗' },
  { value: '金融诈骗', label: '金融诈骗' },
  { value: '其他', label: '其他' }
]

async function fetchReports() {
  loading.value = true
  try {
    const res = await adminReportApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      type: typeFilter.value,
      status: statusFilter.value
    })
    reports.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchReports()
}

function handlePageChange(val: number) {
  page.value = val
  fetchReports()
}

async function viewDetail(id: number) {
  try {
    const res = await adminReportApi.getDetail(id)
    selectedReport.value = res.report_detail
    detailDialogVisible.value = true
  } catch {
    // Error handled
  }
}

function openHandleDialog(report: Report) {
  selectedReport.value = report
  handleForm.value = {
    status: report.status === 0 ? 1 : report.status,
    remark: report.remark || ''
  }
  handleDialogVisible.value = true
}

async function handleReportSubmit() {
  if (!selectedReport.value) return
  try {
    await adminReportApi.handle(selectedReport.value.id, handleForm.value)
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    fetchReports()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该举报记录吗？', '提示', { type: 'warning' })
  try {
    await adminReportApi.delete(id)
    ElMessage.success('删除成功')
    fetchReports()
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function parseEvidence(evidence: string): string[] {
  if (!evidence) return []
  try {
    const parsed = JSON.parse(evidence)
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === 'string') return [parsed]
    return []
  } catch {
    return evidence ? [evidence] : []
  }
}

function getEvidenceUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // 确保路径以 / 开头
  return path.startsWith('/') ? path : '/' + path
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">举报管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-select v-model="typeFilter" placeholder="举报类型" clearable @change="handleSearch">
            <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="处理状态" clearable @change="handleSearch">
            <el-option :value="0" label="待处理" />
            <el-option :value="1" label="处理中" />
            <el-option :value="2" label="已处理" />
            <el-option :value="3" label="已驳回" />
          </el-select>
          <el-button type="primary" @click="handleSearch">筛选</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="reports" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="举报标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag>{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="amount" label="涉案金额" width="120">
          <template #default="{ row }">
            <span class="amount">{{ row.amount?.toLocaleString() || 0 }} 元</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.id)"><el-icon><View /></el-icon>详情</el-button>
            <el-button v-if="row.status === 0 || row.status === 1" type="success" link @click="openHandleDialog(row)"><el-icon><Edit /></el-icon>处理</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialogVisible" title="举报详情" width="600px">
      <template v-if="selectedReport">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="举报标题" :span="2">{{ selectedReport.title }}</el-descriptions-item>
          <el-descriptions-item label="举报类型">{{ selectedReport.type }}</el-descriptions-item>
          <el-descriptions-item label="涉案金额">{{ selectedReport.amount?.toLocaleString() || 0 }} 元</el-descriptions-item>
          <el-descriptions-item label="举报时间">{{ formatDate(selectedReport.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="statusMap[selectedReport.status]?.type || 'info'">{{ statusMap[selectedReport.status]?.label || '未知' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报描述" :span="2">{{ selectedReport.description }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedReport.evidence" label="证据材料" :span="2">
            <div class="evidence-links">
              <template v-for="(url, index) in parseEvidence(selectedReport.evidence)" :key="index">
                <el-link :href="getEvidenceUrl(url)" target="_blank" type="primary">
                  证据{{ index + 1 }}
                </el-link>
              </template>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedReport.remark" label="处理备注" :span="2">{{ selectedReport.remark }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- Handle Dialog -->
    <el-dialog v-model="handleDialogVisible" title="处理举报" width="500px">
      <el-form label-width="80px">
        <el-form-item label="处理状态">
          <el-select v-model="handleForm.status" style="width: 100%">
            <el-option :value="1" label="处理中" />
            <el-option :value="2" label="已处理" />
            <el-option :value="3" label="已驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="handleForm.remark" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReportSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.content-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.toolbar { margin-bottom: 20px; }
.search-box { display: flex; gap: 12px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
.amount { color: #f56c6c; font-weight: 600; }
.evidence-links { display: flex; flex-wrap: wrap; gap: 12px; }
</style>