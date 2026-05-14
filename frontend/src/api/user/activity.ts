import { request } from '../request'
import type { Activity, PaginatedResponse } from '@/types'

export const activityApi = {
  getList(params: { page?: number; pageSize?: number; form?: string; keyword?: string }) {
    return request.get<PaginatedResponse<Activity>>('/user/activities', { params })
  },

  getDetail(id: number) {
    return request.get<{ activity_detail: any }>(`/user/activities/${id}`).then(res => {
      const activity = res.activity_detail
      if (activity) {
        return {
          id: activity.id,
          title: activity.title,
          summary: activity.summary,
          cover: activity.cover,
          content: activity.content,
          organizer: activity.organizer,
          form: activity.form === 2 ? 'offline' : 'online',
          address: activity.address,
          startTime: activity.start_time,
          endTime: activity.end_time,
          views: activity.views,
          likes: activity.likes_count,
          comments: activity.comments_count,
          collects: activity.collects_count,
          signs: activity.signs_count,
          status: activity.status,
          createdAt: activity.created_at
        } as Activity
      }
      return null as unknown as Activity
    })
  },

  signUp(id: number) {
    return request.post(`/user/activities/${id}/sign`)
  },

  cancelSignUp(id: number) {
    return request.delete(`/user/activities/${id}/sign`)
  },

  checkSignStatus(id: number) {
    return request.get<{ is_signed: boolean }>(`/user/activities/${id}/sign-status`).then(res => ({
      isSigned: res.is_signed
    }))
  }
}
