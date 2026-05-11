import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const showLoginModal = ref(false)
  const loginModalTab = ref<'login' | 'register'>('login')

  function openLoginModal(tab: 'login' | 'register' = 'login') {
    loginModalTab.value = tab
    showLoginModal.value = true
  }

  function closeLoginModal() {
    showLoginModal.value = false
  }

  return {
    showLoginModal,
    loginModalTab,
    openLoginModal,
    closeLoginModal
  }
})
