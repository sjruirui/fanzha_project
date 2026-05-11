import { request } from '../request'
import type { AiMessage } from '@/types'

export const aiApi = {
  createSession(data: { mode: 'chat' | 'scenario'; scenario?: string }) {
    return request.post<{ sessionId: string }>('/user/ai/session', data)
  },

  getMessages(sessionId: string) {
    return request.get<AiMessage[]>(`/user/ai/session/${sessionId}/messages`)
  },

  clearSession(sessionId: string) {
    return request.delete(`/user/ai/session/${sessionId}`)
  }
}

// SSE Chat function - returns EventSource URL
export function getAiChatUrl(sessionId: string, content: string): string {
  const baseUrl = '/api/user/ai/chat'
  return `${baseUrl}?sessionId=${encodeURIComponent(sessionId)}&content=${encodeURIComponent(content)}`
}
