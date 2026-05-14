<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { adminAdminApi, type AdminUser } from '@/api/admin/admin'
import dayjs from 'dayjs'

const admins = ref<AdminUser[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增管理员')
const formRef = ref()
const form = ref({
  id: 0,
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  role: 1,
  status: 1
})

const roleMap: Record<number, string> = {
  0: '超级管理员',
  1: '普通管理员'
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function fetchAdmins() {
  loading.value = true
  try {
    const res = await adminAdminApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    admins.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchAdmins()
}

function handlePageChange(val: number) {
  page.value = val
  fetchAdmins()
}

function openCreateDialog() {
  dialogTitle.value = '新增管理员'
  form.value = {
    id: 0,
    username: '',
    password: '',
    nickname: '',
    phone: '',
    email: '',
    role: 1,
    status: 1
  }
  dialogVisible.value = true
}

function openEditDialog(admin: AdminUser) {
  dialogTitle.value = '编辑管理员'
  form.value = {
    id: admin.id,
    username: admin.username,
    password: '',
    nickname: admin.nickname,
    phone: admin.phone,
    email: admin.email,
    role: admin.role,
    status: admin.status
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await adminAdminApi.update(form.value.id, {
        nickname: form.value.nickname,
        phone: form.value.phone,
        email: form.value.email,
        role: form.value.role,
        status: form.value.status
      })
      ElMessage.success('更新成功')
    } else {
      await adminAdminApi.create({
        username: form.value.username,
        password: form.value.password,
        nickname: form.value.nickname,
        phone: form.value.phone,
        email: form.value.email,
        role: form.value.role
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchAdmins()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
    type: 'warning'
  })
  try {
    await adminAdminApi.delete(id)
    ElMessage.success('删除成功')
    fetchAdmins()
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">管理员管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名/昵称"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增管理员
        </el-button>
      </div>

      <el-table v-loading="loading" :data="admins" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 0 ? 'danger' : 'primary'">
              {{ roleMap[row.role] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option :value="0" label="超级管理员" />
            <el-option :value="1" label="普通管理员" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.id" label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="禁用" />
          </el-select>
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
.admin-page {
  max-width: 1400px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1f36;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
}

.search-box .el-input {
  width: 280px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
