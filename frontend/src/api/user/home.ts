import { request } from '../request'
import type { Banner, News, PaginatedResponse } from '@/types'

export const homeApi = {
  getBanners() {
    return request.get<{ banners: Banner[] }>('/user/home/banners').then(res => res.banners || [])
  },

  getRecommend() {
    return request.get<{
      news: News[]
      knowledge: News[]
      activities: News[]
    }>('/user/home/recommend')
  }
}
