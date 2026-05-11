<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()

const visible = computed({
  get: () => appStore.showLoginModal,
  set: (val) => {
    if (!val) appStore.closeLoginModal()
  }
})

const activeTab = computed({
  get: () => appStore.loginModalTab,
  set: (val) => {
    appStore.loginModalTab = val
  }
})

// Login form
const loginForm = ref({
  username: '',
  password: ''
})
const loginLoading = ref(false)
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// Register form
const registerForm = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)
const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loginFormRef = ref()
const registerFormRef = ref()

async function handleLogin() {
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    await userStore.login(loginForm.value)
    ElMessage.success('登录成功')
    visible.value = false
    loginForm.value = { username: '', password: '' }
  } catch {
    // Validation failed
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    await userStore.register({
      username: registerForm.value.username,
      phone: registerForm.value.phone,
      password: registerForm.value.password
    })
    ElMessage.success('注册成功')
    visible.value = false
    registerForm.value = { username: '', phone: '', password: '', confirmPassword: '' }
  } catch {
    // Validation failed
  } finally {
    registerLoading.value = false
  }
}

function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="activeTab === 'login' ? '登录' : '注册'"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab" @tab-change="switchTab">
      <!-- Login Tab -->
      <el-tab-pane label="登录" name="login">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loginLoading"
              style="width: 100%"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="switch-text">
          还没有账号？
          <el-button type="primary" link @click="switchTab('register')">立即注册</el-button>
        </div>
      </el-tab-pane>

      <!-- Register Tab -->
      <el-tab-pane label="注册" name="register">
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="registerLoading"
              style="width: 100%"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="switch-text">
          已有账号？
          <el-button type="primary" link @click="switchTab('login')">立即登录</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<style scoped>
.switch-text {
  text-align: center;
  color: #909399;
  font-size: 13px;
}
</style>
