<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { reportApi } from '@/api/user/report'
import { uploadApi } from '@/api/upload'

const router = useRouter()

const form = ref({
  title: '',
  type: '',
  amount: 0,
  description: '',
  evidence: ''
})

const types = [
  '电信诈骗',
  '网络诈骗',
  '金融诈骗',
  '冒充公检法',
  '刷单返利',
  '杀猪盘',
  '虚假投资',
  '其他'
]

const loading = ref(false)
const fileList = ref<any[]>([])

async function handleUpload(options: { file: File }) {
  try {
    const res = await uploadApi.uploadFile(options.file)
    const urls = form.value.evidence ? form.value.evidence.split(',') : []
    urls.push(res.url)
    form.value.evidence = urls.join(',')
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

async function handleSubmit() {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入举报标题')
    return
  }
  if (!form.value.type) {
    ElMessage.warning('请选择举报类型')
    return
  }
  if (!form.value.description.trim()) {
    ElMessage.warning('请详细描述受骗经过')
    return
  }

  loading.value = true
  try {
    await reportApi.submit(form.value)
    ElMessage.success('举报提交成功')
    router.push('/report/history')
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="report-page container">
    <div class="page-header">
      <h1 class="page-title">诈骗举报</h1>
      <p class="page-desc">如果您遭遇了诈骗，请在此提交举报，我们将帮助您处理</p>
    </div>

    <div class="form-container card">
      <el-form :model="form" label-width="100px">
        <el-form-item label="举报标题" required>
          <el-input v-model="form.title" placeholder="请输入举报标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="举报类型" required>
          <el-select v-model="form.type" placeholder="请选择举报类型" style="width: 100%">
            <el-option v-for="t in types" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <el-form-item label="受骗金额">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="100" />
          <span class="amount-unit">元</span>
        </el-form-item>

        <el-form-item label="详细描述" required>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请详细描述受骗经过，包括时间、地点、人物、事件等"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="证据材料">
          <el-upload
            v-model:file-list="fileList"
            :http-request="handleUpload"
            :show-file-list="true"
            accept="image/*,.pdf,.doc,.docx"
            :limit="5"
          >
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon>
              上传证据
            </el-button>
            <template #tip>
              <div class="upload-tip">
                支持上传图片、PDF、Word文档，最多5个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交举报
          </el-button>
          <el-button @click="router.push('/report/history')">查看举报记录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  padding: 20px;
  max-width: 800px;
}

.page-desc {
  color: #909399;
  margin-top: 8px;
}

.form-container {
  padding: 30px;
}

.amount-unit {
  margin-left: 10px;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
