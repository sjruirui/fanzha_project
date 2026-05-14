import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Post } from '@/types'

export const adminPostApi = {
  getList(params: {
    page?: number
    pageSize?: number
    categoryId?: number
    status?: number
    keyword?: string
  }): Promise<PaginatedResponse<Post>> {
    return adminRequest.get('/posts', { params })
  },

  update(id: number, data: {
    categoryId?: number
    title?: string
    summary?: string
    cover?: string
    content?: string
    tags?: string
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/posts/${id}`, data)
  },

  audit(id: number, status: number): Promise<{ success: boolean }> {
    return adminRequest.put(`/posts/${id}/audit`, { status })
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/posts/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/posts/batch', { data: { ids } })
  }
}
