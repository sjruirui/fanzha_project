import { request } from '../request'
import type { Comment, PaginatedResponse } from '@/types'

// Target type mapping: string -> number
const targetTypeMap: Record<string, number> = {
  post: 1,
  activity: 2,
  news: 3,
  knowledge: 4
}

const getTargetTypeNum = (type: string): number => targetTypeMap[type] || 1

export const commentApi = {
  getList(params: { targetType: string; targetId: number; page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<Comment>>('/user/comments', {
      params: {
        targetType: getTargetTypeNum(params.targetType),
        targetId: params.targetId,
        page: params.page,
        pageSize: params.pageSize
      }
    })
  },

  create(data: { targetType: string; targetId: number; parentId?: number; replyToUserId?: number; content: string }) {
    return request.post<{ commentId: number }>('/user/comments', {
      targetType: getTargetTypeNum(data.targetType),
      targetId: data.targetId,
      parentId: data.parentId,
      replyToUserId: data.replyToUserId,
      content: data.content
    })
  },

  delete(id: number) {
    return request.delete(`/user/comments/${id}`)
  }
}
