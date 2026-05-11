import { request } from '../request'
import type { Comment, PaginatedResponse } from '@/types'

export const commentApi = {
  getList(params: { targetType: string; targetId: number; page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<Comment>>('/user/comments', { params })
  },

  create(data: { targetType: string; targetId: number; parentId?: number; replyToUserId?: number; content: string }) {
    return request.post<{ commentId: number }>('/user/comments', data)
  },

  delete(id: number) {
    return request.delete(`/user/comments/${id}`)
  }
}
