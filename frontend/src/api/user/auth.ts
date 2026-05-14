import { request } from '../request'
import type { UserInfo, LoginForm, RegisterForm } from '@/types'

export const authApi = {
  login(data: LoginForm) {
    return request.post<{ token: string; user_info: UserInfo }>('/user/auth/login', data)
  },

  register(data: RegisterForm) {
    return request.post<{ token: string; user_info: UserInfo }>('/user/auth/register', data)
  },

  getInfo() {
    return request.get<{ user_info: UserInfo }>('/user/auth/info')
  },

  logout() {
    return request.post('/user/auth/logout')
  }
}
