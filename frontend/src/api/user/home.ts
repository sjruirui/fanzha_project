import { request } from '../request'
import type { Banner, News, PaginatedResponse } from '@/types'

export const homeApi = {
  getBanners() {
    return request.get<Banner[]>('/user/home/banners')
  },

  getRecommend() {
    return request.get<{
      news: News[]
      knowledge: News[]
      activities: News[]
    }>('/user/home/recommend')
  }
}
