<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { aiApi } from '@/api/user/ai'
import type { AiMessage } from '@/types'

const userStore = useUserStore()
const appStore = useAppStore()

const showChat = ref(false)
const chatMode = ref<'chat' | 'scenario'>('chat')
const sessionId = ref('')
const messages = ref<AiMessage[]>([])
const inputMessage = ref('')
const loading = ref(false)
const eventSource = ref<EventSource | null>(null)

const scenarios = [
  { key: 'gongjia', name: '冒充公检法', icon: '👮' },
  { key: 'shuadan', name: '刷单返利', icon: '💰' },
  { key: 'shazhu', name: '杀猪盘', icon: '🐷' },
  { key: 'wangdai', name: '虚假网贷', icon: '🏦' }
]

function toggleChat() {
  if (!userStore.isLoggedIn) {
    appStore.openLoginModal('login')
    return
  }
  showChat.value = !showChat.value
  if (showChat.value && !sessionId.value) {
    initSession()
  }
}

async function initSession() {
  try {
    const res = await aiApi.createSession({ mode: chatMode.value })
    sessionId.value = res.sessionId
    messages.value = []
  } catch {
    ElMessage.error('创建会话失败')
  }
}

async function switchMode(mode: 'chat' | 'scenario') {
  chatMode.value = mode
  await initSession()
}

async function selectScenario(scenario: string) {
  try {
    const res = await aiApi.createSession({ mode: 'scenario', scenario })
    sessionId.value = res.sessionId
    messages.value = []
    // Add system message for scenario
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: `您已进入"${scenarios.find(s => s.key === scenario)?.name || scenario}"情景模拟模式。我将扮演诈骗者，尝试对您实施诈骗。请保持警惕，识别诈骗手法。开始对话吧！`,
      createdAt: new Date().toISOString()
    })
  } catch {
    ElMessage.error('创建情景会话失败')
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''

  // Add user message
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  })

  loading.value = true

  try {
    // Use SSE for streaming response
    const url = `/api/user/ai/chat?sessionId=${encodeURIComponent(sessionId.value)}&content=${encodeURIComponent(content)}`

    eventSource.value = new EventSource(url, { withCredentials: true })

    let assistantMessage: AiMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    }
    messages.value.push(assistantMessage)

    eventSource.value.onmessage = (event) => {
      const data = event.data
      if (data === '[DONE]') {
        eventSource.value?.close()
        loading.value = false
        return
      }
      try {
        const parsed = JSON.parse(data)
        if (parsed.content) {
          assistantMessage.content += parsed.content
        }
      } catch {
        // Plain text
        assistantMessage.content += data
      }
    }

    eventSource.value.onerror = () => {
      eventSource.value?.close()
      loading.value = false
      if (!assistantMessage.content) {
        assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
      }
    }
  } catch {
    loading.value = false
    ElMessage.error('发送消息失败')
  }
}

async function clearChat() {
  try {
    await ElMessageBox.confirm('确定要清空对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (sessionId.value) {
      await aiApi.clearSession(sessionId.value)
    }
    await initSession()
    ElMessage.success('已清空对话')
  } catch {
    // User cancelled
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(() => {
  // Add shake animation periodically
  const shakeInterval = setInterval(() => {
    if (!showChat.value) {
      const btn = document.querySelector('.ai-float-btn')
      btn?.classList.add('shake')
      setTimeout(() => btn?.classList.remove('shake'), 500)
    }
  }, 30000)

  onUnmounted(() => {
    clearInterval(shakeInterval)
    eventSource.value?.close()
  })
})
</script>

<template>
  <div class="ai-assistant">
    <!-- Floating Button -->
    <div class="ai-float-btn" @click="toggleChat">
      <el-icon :size="28"><ChatDotRound /></el-icon>
    </div>

    <!-- Chat Panel -->
    <transition name="slide-up">
      <div v-if="showChat" class="chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-title">
            <span class="title">AI反诈助手</span>
            <el-tag v-if="chatMode === 'scenario'" type="warning" size="small">情景模拟</el-tag>
          </div>
          <div class="header-actions">
            <el-button type="danger" link size="small" @click="clearChat">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button link size="small" @click="showChat = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div class="mode-tabs">
          <el-radio-group v-model="chatMode" size="small" @change="switchMode">
            <el-radio-button value="chat">智能问答</el-radio-button>
            <el-radio-button value="scenario">情景模拟</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Scenario Selection -->
        <div v-if="chatMode === 'scenario' && messages.length <= 1" class="scenario-list">
          <div
            v-for="s in scenarios"
            :key="s.key"
            class="scenario-item"
            @click="selectScenario(s.key)"
          >
            <span class="scenario-icon">{{ s.icon }}</span>
            <span class="scenario-name">{{ s.name }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              <el-avatar v-if="msg.role === 'user'" :size="32" :src="userStore.userInfo?.avatar || undefined">
                {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <el-avatar v-else :size="32" style="background: #409eff">
                AI
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">
              <el-avatar :size="32" style="background: #409eff">AI</el-avatar>
            </div>
            <div class="message-content">
              <div class="message-text typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题..."
            @keydown="handleKeydown"
          />
          <el-button type="primary" :loading="loading" @click="sendMessage">
            发送
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.ai-float-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.ai-float-btn:hover {
  transform: scale(1.1);
}

.ai-float-btn.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.chat-panel {
  position: fixed;
  right: 20px;
  bottom: 150px;
  width: 380px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions .el-button {
  color: #fff;
}

.mode-tabs {
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}

.scenario-list {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.scenario-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.scenario-item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.scenario-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.scenario-name {
  font-size: 13px;
  color: #606266;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  margin: 0 10px;
}

.message-text {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message.user .message-text {
  background: #409eff;
  color: #fff;
}

.message.assistant .message-text {
  background: #f5f7fa;
  color: #303133;
}

.message-text.typing {
  display: flex;
  gap: 4px;
  padding: 14px;
}

.message-text.typing .dot {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.message-text.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.message-text.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input .el-textarea {
  flex: 1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
