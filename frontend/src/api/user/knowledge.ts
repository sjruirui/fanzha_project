import { request } from '../request'
import type { Knowledge, PaginatedResponse } from '@/types'

export const knowledgeApi = {
  getList(params: { page?: number; pageSize?: number; type?: string; targetGroup?: string; keyword?: string }) {
    return request.get<PaginatedResponse<Knowledge>>('/user/knowledge', { params })
  },

  getDetail(id: number) {
    return request.get<Knowledge>(`/user/knowledge/${id}`)
  },

  getRelated(id: number) {
    return request.get<Knowledge[]>(`/user/knowledge/${id}/related`)
  }
}
