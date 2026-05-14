import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, News } from '@/types'

export const adminNewsApi = {
  getList(params: {
    page?: number
    pageSize?: number
    type?: string
    status?: number
    keyword?: string
  }): Promise<PaginatedResponse<News>> {
    return adminRequest.get('/news', { params })
  },

  create(data: {
    title: string
    summary?: string
    cover?: string
    content: string
    type: string
    tags?: string
    author?: string
    status?: number
    publishedAt?: string
  }): Promise<{ news_id: number }> {
    return adminRequest.post('/news', data)
  },

  update(id: number, data: {
    title?: string
    summary?: string
    cover?: string
    content?: string
    type?: string
    tags?: string
    author?: string
    status?: number
    publishedAt?: string
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/news/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/news/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/news/batch', { data: { ids } })
  }
}
