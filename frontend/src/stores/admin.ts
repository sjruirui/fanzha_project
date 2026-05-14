import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminAuthApi, type AdminInfo } from '@/api/admin/auth'
import router from '@/router'

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(localStorage.getItem('adminToken'))
  const adminInfo = ref<AdminInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const data = await adminAuthApi.login({ username, password })
    token.value = data.token
    adminInfo.value = data.admin_info
    localStorage.setItem('adminToken', data.token)
    localStorage.setItem('adminInfo', JSON.stringify(data.admin_info))
    return data
  }

  async function fetchAdminInfo() {
    if (!token.value) return
    try {
      const data = await adminAuthApi.getInfo()
      adminInfo.value = data.admin_info
    } catch {
      logout()
    }
  }

  async function logout() {
    try {
      await adminAuthApi.logout()
    } catch {
      // Ignore
    }
    token.value = null
    adminInfo.value = null
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    router.push('/admin/login')
  }

  function initFromStorage() {
    const storedInfo = localStorage.getItem('adminInfo')
    if (storedInfo) {
      try {
        adminInfo.value = JSON.parse(storedInfo)
      } catch {
        // Ignore
      }
    }
  }

  return {
    token,
    adminInfo,
    isLoggedIn,
    login,
    logout,
    fetchAdminInfo,
    initFromStorage
  }
})
