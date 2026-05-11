import { request } from '../request'
import type { Report, PaginatedResponse } from '@/types'

export const reportApi = {
  submit(data: { title: string; type: string; amount: number; description: string; evidence: string }) {
    return request.post<{ reportId: number }>('/user/reports', data)
  },

  getList(params: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<Report>>('/user/reports', { params })
  },

  getDetail(id: number) {
    return request.get<Report>(`/user/reports/${id}`)
  }
}
