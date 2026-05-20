<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'success', url: string): void
}>()

const videoUrl = computed(() => props.modelValue || '')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadFileName = ref('')

const CHUNK_SIZE = 5 * 1024 * 1024

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.'))
}

function getAuthHeaders() {
  const userStore = useUserStore()
  return {
    'Authorization': `Bearer ${userStore.token}`
  }
}

async function handleUpload(options: any) {
  const file = options.file
  const maxSize = 500 * 1024 * 1024

  if (file.size > maxSize) {
    ElMessage.error('视频大小不能超过500MB')
    return
  }

  uploadFileName.value = file.name
  uploading.value = true
  uploadProgress.value = 0

  try {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const fileHash = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const ext = getFileExtension(file.name)

    // Initialize upload
    await axios.post('/api/upload/video/init', {
      fileHash,
      totalChunks,
      fileName: file.name,
      fileSize: file.size,
      fileExt: ext
    }, {
      headers: getAuthHeaders()
    })

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('chunkIndex', String(i))
      formData.append('fileHash', fileHash)

      await axios.post('/api/upload/video/chunk', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      })

      uploadProgress.value = Math.round(((i + 1) / totalChunks) * 100)
    }

    // Complete upload
    const completeRes = await axios.post('/api/upload/video/complete', {
      fileHash,
      totalChunks,
      fileName: file.name,
      fileExt: ext
    }, {
      headers: getAuthHeaders()
    })

    const url = completeRes.data.data.url
    emit('update:modelValue', url)
    emit('success', url)
    ElMessage.success('视频上传成功')
  } catch (error: any) {
    console.error('Upload error:', error)
    ElMessage.error(error.response?.data?.message || '上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function handleRemove() {
  emit('update:modelValue', '')
}

function beforeUpload(file: File) {
  const isVideo = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传 MP4/WEBM/OGG 格式的视频')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过500MB')
    return false
  }
  return true
}
</script>

<template>
  <div class="video-upload">
    <el-upload
      class="video-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="disabled || uploading"
    >
      <div v-if="videoUrl" class="video-preview">
        <video :src="videoUrl" class="video-thumb"></video>
        <div class="video-overlay">
          <el-icon class="play-icon"><VideoPlay /></el-icon>
        </div>
        <div class="video-actions">
          <el-button type="danger" :icon="Delete" circle size="small" @click.stop="handleRemove" />
        </div>
      </div>
      <div v-else class="upload-placeholder" :class="{ 'is-uploading': uploading }">
        <template v-if="uploading">
          <el-progress type="circle" :percentage="uploadProgress" :width="60" />
          <span class="upload-text">上传中 {{ uploadProgress }}%</span>
        </template>
        <template v-else>
          <el-icon class="upload-icon"><Plus /></el-icon>
          <span class="upload-text">点击上传视频</span>
        </template>
      </div>
    </el-upload>
    <div v-if="uploadFileName && uploading" class="upload-filename">{{ uploadFileName }}</div>
    <div class="upload-tip">支持 MP4/WEBM/OGG，最大 500MB，大文件自动分片上传</div>
  </div>
</template>

<style scoped>
.video-upload {
  display: inline-block;
}

.video-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.video-uploader:hover {
  border-color: #409eff;
}

.video-preview {
  width: 200px;
  height: 120px;
  position: relative;
}

.video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.play-icon {
  font-size: 32px;
  color: #fff;
}

.video-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-preview:hover .video-actions {
  opacity: 1;
}

.upload-placeholder {
  width: 200px;
  height: 120px;
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

.upload-filename {
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
