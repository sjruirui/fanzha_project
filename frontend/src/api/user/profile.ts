import { request } from '../request'
import type { UserInfo, Post, Activity, LikeItem, CollectItem, Comment, PaginatedResponse, Report } from '@/types'

// Target type mapping: string -> number
const targetTypeMap: Record<string, number> = {
  post: 1,
  activity: 2,
  news: 3,
  knowledge: 4
}

export const profileApi = {
  getProfile() {
    return request.get<UserInfo>('/user/profile')
  },

  updateProfile(data: { nickname?: string; avatar?: string; bio?: string }) {
    return request.put('/user/profile', data)
  },

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put('/user/profile/password', data)
  },

  getPosts(params: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<Post>>('/user/profile/posts', { params })
  },

  getActivities(params: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<{ id: number; activityId: number; activity: Activity; createdAt: string }>>('/user/profile/activities', { params })
  },

  getLikes(params: { page?: number; pageSize?: number; targetType?: string }) {
    return request.get<PaginatedResponse<LikeItem>>('/user/profile/likes', {
      params
    })
  },

  getCollects(params: { page?: number; pageSize?: number; targetType?: string }) {
    return request.get<PaginatedResponse<CollectItem>>('/user/profile/collects', {
      params
    })
  },

  getComments(params: { page?: number; pageSize?: number; targetType?: string }) {
    return request.get<PaginatedResponse<Comment>>('/user/profile/comments', { params })
  },

  getReports(params: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResponse<Report>>('/user/profile/reports', { params })
  }
}
