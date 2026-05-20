import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginForm, RegisterForm } from '@/types'
import { request } from '@/api/request'

export const useUserStore = defineStore('user', () => {
  //用户token
  const token = ref<string>(localStorage.getItem('token') || '')
  //用户信息
  const userInfo = ref<UserInfo | null>(null)
  //是否登录
  const isLoggedIn = computed(() => !!token.value)

  //登录用户
  async function login(form: LoginForm) {
    const data = await request.post<{ token: string; user_info: UserInfo }>('/user/auth/login', form)
    token.value = data.token
    userInfo.value = data.user_info
    localStorage.setItem('token', data.token)
    return data
  }

  //注册用户
  async function register(form: RegisterForm) {
    const data = await request.post<{ token: string; user_info: UserInfo }>('/user/auth/register', form)
    token.value = data.token
    userInfo.value = data.user_info
    localStorage.setItem('token', data.token)
    return data
  }

  //获取用户信息
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

  //退出登录
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  //更新用户信息
  async function updateProfile(data: Partial<UserInfo>) {
    await request.put('/user/profile', data)
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
    }
  }

  //修改密码
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
