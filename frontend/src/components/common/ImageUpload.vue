<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadApi } from '@/api/upload'

const props = defineProps<{
  modelValue?: string
  limit?: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'success', url: string): void
}>()

const imageUrl = computed(() => props.modelValue || '')
const uploading = ref(false)

async function handleUpload(options: any) {
  const file = options.file
  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  uploading.value = true
  try {
    const res = await uploadApi.uploadImage(file)
    emit('update:modelValue', res.url)
    emit('success', res.url)
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function handleRemove() {
  emit('update:modelValue', '')
}

function beforeUpload(file: File) {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WEBP 格式的图片')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  return true
}
</script>

<template>
  <div class="image-upload">
    <el-upload
      class="image-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="disabled || uploading"
    >
      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" alt="cover" />
        <div class="image-actions">
          <el-button type="danger" :icon="Delete" circle size="small" @click.stop="handleRemove" />
        </div>
      </div>
      <div v-else class="upload-placeholder" :class="{ 'is-uploading': uploading }">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <span class="upload-text">{{ uploading ? '上传中...' : '点击上传' }}</span>
      </div>
    </el-upload>
    <div class="upload-tip">支持 JPG/PNG/GIF/WEBP，最大 5MB</div>
  </div>
</template>

<style scoped>
.image-upload {
  display: inline-block;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-preview {
  width: 148px;
  height: 148px;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 6px;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.upload-placeholder {
  width: 148px;
  height: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 6px;
}

.upload-placeholder.is-uploading {
  cursor: not-allowed;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  font-size: 12px;
  color: #8c939d;
  margin-top: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
