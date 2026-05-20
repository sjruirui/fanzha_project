<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Download } from '@element-plus/icons-vue'
import { adminActivityApi, type ActivitySignup } from '@/api/admin/activity'
import type { Activity } from '@/types'
import dayjs from 'dayjs'

const activities = ref<Activity[]>([])
const signups = ref<ActivitySignup[]>([])
const loading = ref(false)
const totalActivities = ref(0)
const totalSignups = ref(0)
const pageActivities = ref(1)
const pageSignups = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const selectedActivity = ref<number | null>(null)

async function fetchActivities() {
  loading.value = true
  try {
    const res = await adminActivityApi.getList({
      page: pageActivities.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    activities.value = res.list
    totalActivities.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function fetchSignups(activityId: number) {
  loading.value = true
  try {
    const res = await adminActivityApi.getSignups(activityId, {
      page: pageSignups.value,
      pageSize: pageSize.value
    })
    signups.value = res.list
    totalSignups.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageActivities.value = 1
  fetchActivities()
}

function handleActivityPageChange(val: number) {
  pageActivities.value = val
  fetchActivities()
}

function handleSignupPageChange(val: number) {
  pageSignups.value = val
  if (selectedActivity.value) {
    fetchSignups(selectedActivity.value)
  }
}

function selectActivity(activity: Activity) {
  selectedActivity.value = activity.id
  pageSignups.value = 1
  fetchSignups(activity.id)
}

async function handleDeleteSignup(signupId: number) {
  await ElMessageBox.confirm('确定要删除该报名记录吗？', '提示', { type: 'warning' })
  try {
    if (selectedActivity.value) {
      await adminActivityApi.deleteSignup(selectedActivity.value, signupId)
      ElMessage.success('删除成功')
      fetchSignups(selectedActivity.value)
    }
  } catch {
    // Error handled
  }
}

function exportSignups() {
  if (signups.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const headers = ['ID', '用户ID', '用户名', '昵称', '手机号', '报名时间']
  const rows = signups.value.map(item => [
    item.id,
    item.userId,
    item.user.username,
    item.user.nickname,
    item.user.phone,
    formatDate(item.createdAt)
  ])
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `signups_${selectedActivity.value}_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
      <h1 class="page-title">活动报名管理</h1>
    </div>

    <div class="signup-grid">
      <!-- Activities Panel -->
      <div class="panel activities-panel">
        <div class="panel-header">
          <h3 class="panel-title">活动列表</h3>
        </div>

        <div class="panel-toolbar">
          <el-input v-model="keyword" placeholder="搜索活动" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <el-table v-loading="loading" :data="activities" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="活动名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="signs" label="报名数" width="80" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="selectActivity(row)">查看报名</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageActivities" :page-size="pageSize" :total="totalActivities" layout="prev, pager, next" size="small" @current-change="handleActivityPageChange" />
        </div>
      </div>

      <!-- Signups Panel -->
      <div class="panel signups-panel">
        <div class="panel-header">
          <h3 class="panel-title">报名记录 {{ selectedActivity ? ` - 活动 ${selectedActivity}` : '' }}</h3>
          <el-button v-if="signups.length > 0" type="success" size="small" @click="exportSignups">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>

        <el-table v-loading="loading" :data="signups" stripe size="small">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="user.username" label="用户名" width="100" />
          <el-table-column prop="user.nickname" label="昵称" width="100" />
          <el-table-column prop="user.phone" label="手机号" width="120" />
          <el-table-column label="报名时间" width="160">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" link size="small" @click="handleDeleteSignup(row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination v-model:current-page="pageSignups" :page-size="pageSize" :total="totalSignups" layout="prev, pager, next" size="small" @current-change="handleSignupPageChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 16px; font-weight: 600; color: #1a1f36; }
.panel-toolbar { margin-bottom: 16px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }

@media (max-width: 992px) {
  .signup-grid { grid-template-columns: 1fr; }
}
</style>