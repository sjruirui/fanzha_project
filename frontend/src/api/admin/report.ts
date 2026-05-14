import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Report } from '@/types'

export const adminReportApi = {
  getList(params: {
    page?: number
    pageSize?: number
    type?: string
    status?: number
  }): Promise<PaginatedResponse<Report>> {
    return adminRequest.get('/reports', { params })
  },

  getDetail(id: number): Promise<{ report_detail: Report }> {
    return adminRequest.get(`/reports/${id}`)
  },

  handle(id: number, data: {
    status: number
    remark?: string
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/reports/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/reports/${id}`)
  }
}
