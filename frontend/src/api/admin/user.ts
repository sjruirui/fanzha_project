import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, UserInfo } from '@/types'

export const adminUserApi = {
  getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
  }): Promise<PaginatedResponse<UserInfo>> {
    return adminRequest.get('/users', { params })
  },

  create(data: {
    username: string
    password: string
    nickname?: string
    phone?: string
    email?: string
  }): Promise<{ user_id: number }> {
    return adminRequest.post('/users', data)
  },

  update(id: number, data: {
    nickname?: string
    phone?: string
    email?: string
    avatar?: string
    bio?: string
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/users/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/users/${id}`)
  },

  batchDelete(ids: number[]): Promise<{ success: boolean }> {
    return adminRequest.delete('/users/batch', { data: { ids } })
  }
}
