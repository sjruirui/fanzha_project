<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { communityApi } from '@/api/user/community'
import { uploadApi } from '@/api/upload'
import type { Category } from '@/types'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const postId = ref<number | null>(null)

const form = ref({
  categoryId: undefined as number | undefined,
  title: '',
  summary: '',
  cover: '',
  content: '',
  tags: ''
})

const categories = ref<Category[]>([])
const loading = ref(false)
const submitLoading = ref(false)

async function fetchCategories() {
  try {
    categories.value = await communityApi.getCategories()
  } catch {
    // Error handled
  }
}

async function fetchPost() {
  if (!postId.value) return
  loading.value = true
  try {
    const post = await communityApi.getPostDetail(postId.value)
    form.value = {
      categoryId: post.categoryId,
      title: post.title,
      summary: post.summary,
      cover: post.cover,
      content: post.content,
      tags: post.tags
    }
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function handleCoverUpload(options: { file: File }) {
  try {
    const res = await uploadApi.uploadImage(options.file)
    form.value.cover = res.url
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

async function handleSubmit() {
  if (!form.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  submitLoading.value = true
  try {
    if (isEdit.value && postId.value) {
      await communityApi.updatePost(postId.value, form.value)
      ElMessage.success('修改成功')
    } else {
      await communityApi.createPost(form.value)
      ElMessage.success('发布成功')
    }
    router.push('/community')
  } catch {
    // Error handled
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  if (route.params.id) {
    isEdit.value = true
    postId.value = Number(route.params.id)
    fetchPost()
  }
})
</script>

<template>
  <div class="community-create-page container">
    <div class="page-header">
      <el-button link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="page-title">{{ isEdit ? '编辑帖子' : '发布帖子' }}</h1>
    </div>

    <div v-loading="loading" class="form-container card">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 200px">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="简介">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            placeholder="请输入简介"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="封面">
          <div class="cover-upload">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :http-request="handleCoverUpload"
              accept="image/*"
            >
              <img v-if="form.cover" :src="form.cover" class="cover-image" />
              <el-icon v-else class="cover-icon"><Plus /></el-icon>
            </el-upload>
            <div class="cover-tip">建议尺寸：800x450，支持 JPG、PNG 格式</div>
          </div>
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用英文逗号分隔" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布帖子' }}
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.community-create-page {
  padding: 20px;
  max-width: 900px;
}

.form-container {
  padding: 30px;
}

.cover-upload {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.cover-uploader {
  width: 200px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-tip {
  font-size: 12px;
  color: #909399;
}
</style>
