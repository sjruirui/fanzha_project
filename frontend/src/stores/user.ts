import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginForm, RegisterForm } from '@/types'
import { request } from '@/api/request'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(form: LoginForm) {
    const data = await request.post<{ token: string; user_info: UserInfo }>('/user/auth/login', form)
    token.value = data.token
    userInfo.value = data.user_info
    localStorage.setItem('token', data.token)
    return data
  }

  async function register(form: RegisterForm) {
    const data = await request.post<{ token: string; user_info: UserInfo }>('/user/auth/register', form)
    token.value = data.token
    userInfo.value = data.user_info
    localStorage.setItem('token', data.token)
    return data
  }

  async function getUserInfo() {
    if (!token.value) return null
    try {
      const data = await request.get<{ user_info: UserInfo }>('/user/auth/info')
      userInfo.value = data.user_info
      return data.user_info
    } catch {
      logout()
      return null
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  async function updateProfile(data: Partial<UserInfo>) {
    await request.put('/user/profile', data)
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    await request.put('/user/profile/password', { oldPassword, newPassword })
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    getUserInfo,
    logout,
    updateProfile,
    changePassword
  }
})
