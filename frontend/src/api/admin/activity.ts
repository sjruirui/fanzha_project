import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Activity } from '@/types'

export interface ActivitySignup {
  id: number
  activityId: number
  userId: number
  user: {
    id: number
    username: string
    nickname: string
    phone: string
  }
  createdAt: string
}

export const adminActivityApi = {
  getList(params: {
    page?: number
    pageSize?: number
    form?: string
    status?: number
    keyword?: string
  }): Promise<PaginatedResponse<Activity>> {
    return adminRequest.get('/activities', { params })
  },

  create(data: {
    title: string
    summary?: string
    cover?: string
    content: string
    organizer?: string
    form?: string
    address?: string
    startTime: string
    endTime: string
    status?: number
  }): Promise<{ activity_id: number }> {
    return adminRequest.post('/activities', data)
  },

  update(id: number, data: {
    title?: string
    summary?: string
    cover?: string
    content?: string
    organizer?: string
    form?: string
    address?: string
    startTime?: string
    endTime?: string
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/activities/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/activities/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/activities/batch', { data: { ids } })
  },

  // Signups
  getSignups(activityId: number, params: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<ActivitySignup>> {
    return adminRequest.get(`/activities/${activityId}/signups`, { params })
  },

  deleteSignup(activityId: number, signupId: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/activities/${activityId}/signups/${signupId}`)
  }
}
