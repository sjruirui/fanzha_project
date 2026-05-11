import { request } from '../request'
import type { Activity, PaginatedResponse } from '@/types'

export const activityApi = {
  getList(params: { page?: number; pageSize?: number; form?: string; keyword?: string }) {
    return request.get<PaginatedResponse<Activity>>('/user/activities', { params })
  },

  getDetail(id: number) {
    return request.get<Activity>(`/user/activities/${id}`)
  },

  signUp(id: number) {
    return request.post(`/user/activities/${id}/sign`)
  },

  cancelSignUp(id: number) {
    return request.delete(`/user/activities/${id}/sign`)
  },

  checkSignStatus(id: number) {
    return request.get<{ isSigned: boolean }>(`/user/activities/${id}/sign-status`)
  }
}
