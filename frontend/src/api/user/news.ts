import { request } from '../request'
import type { News, PaginatedResponse } from '@/types'

export const newsApi = {
  getList(params: { page?: number; pageSize?: number; type?: string; keyword?: string }) {
    return request.get<PaginatedResponse<News>>('/user/news', { params })
  },

  getDetail(id: number) {
    return request.get<News>(`/user/news/${id}`)
  },

  getRelated(id: number) {
    return request.get<News[]>(`/user/news/${id}/related`)
  }
}
