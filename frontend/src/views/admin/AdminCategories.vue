<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { adminCategoryApi } from '@/api/admin/category'
import type { Category } from '@/types'

const categories = ref<Category[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref()
const form = ref({
  id: 0,
  name: '',
  description: '',
  sortOrder: 0
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

async function fetchCategories() {
  loading.value = true
  try {
    const res = await adminCategoryApi.getList()
    categories.value = res.categories
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogTitle.value = '新增分类'
  form.value = { id: 0, name: '', description: '', sortOrder: 0 }
  dialogVisible.value = true
}

function openEditDialog(category: Category) {
  dialogTitle.value = '编辑分类'
  form.value = {
    id: category.id,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  try {
    if (form.value.id) {
      await adminCategoryApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await adminCategoryApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch {
    // Error handled
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除该分类吗？', '提示', { type: 'warning' })
  try {
    await adminCategoryApi.delete(id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch {
    // Error handled
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">分类管理</h1>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>新增分类
        </el-button>
      </div>

      <el-table v-loading="loading" :data="categories" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
.admin-page { max-width: 800px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1f36; }
.content-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.toolbar { margin-bottom: 20px; }
</style>