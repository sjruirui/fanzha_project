import { adminRequest } from '../adminRequest'
import type { PaginatedResponse } from '@/types'

export interface AdminUser {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  role: number
  status: number
  createdAt: string
}

export const adminAdminApi = {
  getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
  }): Promise<PaginatedResponse<AdminUser>> {
    return adminRequest.get('/admins', { params })
  },

  create(data: {
    username: string
    password: string
    nickname?: string
    phone?: string
    email?: string
    role?: number
  }): Promise<{ admin_id: number }> {
    return adminRequest.post('/admins', data)
  },

  update(id: number, data: {
    nickname?: string
    phone?: string
    email?: string
    avatar?: string
    role?: number
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/admins/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/admins/${id}`)
  }
}
