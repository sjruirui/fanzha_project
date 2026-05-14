import { adminRequest } from '../adminRequest'

export interface AdminInfo {
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

export interface LoginResult {
  token: string
  admin_info: AdminInfo
}

export const adminAuthApi = {
  login(data: { username: string; password: string }): Promise<LoginResult> {
    return adminRequest.post('/auth/login', data)
  },

  logout(): Promise<{ success: boolean }> {
    return adminRequest.post('/auth/logout')
  },

  getInfo(): Promise<{ admin_info: AdminInfo }> {
    return adminRequest.get('/auth/info')
  }
}
