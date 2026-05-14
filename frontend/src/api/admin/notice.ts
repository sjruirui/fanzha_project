import { adminRequest } from '../adminRequest'
import type { PaginatedResponse } from '@/types'

export interface Notice {
  id: number
  title: string
  content: string
  publisherId: number
  publisherName: string
  status: number
  publishedAt: string
  createdAt: string
}

export const adminNoticeApi = {
  getList(params: {
    page?: number
    pageSize?: number
    status?: number
  }): Promise<PaginatedResponse<Notice>> {
    return adminRequest.get('/notices', { params })
  },

  create(data: {
    title: string
    content: string
    status?: number
    publishedAt?: string
  }): Promise<{ notice_id: number }> {
    return adminRequest.post('/notices', data)
  },

  update(id: number, data: {
    title?: string
    content?: string
    status?: number
    publishedAt?: string
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/notices/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/notices/${id}`)
  }
}
