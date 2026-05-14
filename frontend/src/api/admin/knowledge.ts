import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Knowledge } from '@/types'

export const adminKnowledgeApi = {
  getList(params: {
    page?: number
    pageSize?: number
    type?: string
    targetGroup?: string
    status?: number
    keyword?: string
  }): Promise<PaginatedResponse<Knowledge>> {
    return adminRequest.get('/knowledge', { params })
  },

  create(data: {
    title: string
    summary?: string
    cover?: string
    content: string
    type: string
    targetGroup?: string
    tags?: string
    status?: number
  }): Promise<{ knowledge_id: number }> {
    return adminRequest.post('/knowledge', data)
  },

  update(id: number, data: {
    title?: string
    summary?: string
    cover?: string
    content?: string
    type?: string
    targetGroup?: string
    tags?: string
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/knowledge/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/knowledge/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/knowledge/batch', { data: { ids } })
  }
}
