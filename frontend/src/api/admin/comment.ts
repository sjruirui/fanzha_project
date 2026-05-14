import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Comment } from '@/types'

export const adminCommentApi = {
  getList(params: {
    page?: number
    pageSize?: number
    targetType?: string
  }): Promise<PaginatedResponse<Comment>> {
    return adminRequest.get('/comments', { params })
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/comments/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/comments/batch', { data: { ids } })
  }
}
