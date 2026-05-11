<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadApi } from '@/api/upload'
import type { UserInfo } from '@/types'

const userStore = useUserStore()

const form = ref({
  nickname: '',
  avatar: '',
  bio: ''
})

const loading = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function handleAvatarUpload(options: { file: File }) {
  try {
    const res = await uploadApi.uploadImage(options.file)
    form.value.avatar = res.url
    await userStore.updateProfile({ avatar: res.url })
    ElMessage.success('头像更新成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

async function handleSaveProfile() {
  loading.value = true
  try {
    await userStore.updateProfile(form.value)
    ElMessage.success('保存成功')
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    await userStore.changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
    ElMessage.success('密码修改成功')
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch {
    // Error handled
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    form.value = {
      nickname: userStore.userInfo.nickname || '',
      avatar: userStore.userInfo.avatar || '',
      bio: userStore.userInfo.bio || ''
    }
  }
})
</script>

<template>
  <div class="profile-info-page">
    <div class="card">
      <h3 class="section-title">基本信息</h3>
      <el-form :model="form" label-width="80px">
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="handleAvatarUpload"
              accept="image/*"
            >
              <el-avatar :size="80" :src="form.avatar || undefined">
                {{ form.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="upload-tip">点击更换</div>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            placeholder="介绍一下自己吧"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSaveProfile">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <h3 class="section-title">修改密码</h3>
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.profile-info-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.avatar-upload {
  position: relative;
}

.avatar-uploader {
  cursor: pointer;
}

.upload-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  text-align: center;
  padding: 4px 0;
  border-radius: 0 0 40px 40px;
}
</style>
