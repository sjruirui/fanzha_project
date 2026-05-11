import { request } from '../request'

export const interactApi = {
  like(data: { targetType: string; targetId: number }) {
    return request.post('/user/interact/like', data)
  },

  unlike(data: { targetType: string; targetId: number }) {
    return request.delete('/user/interact/like', { data })
  },

  collect(data: { targetType: string; targetId: number }) {
    return request.post('/user/interact/collect', data)
  },

  uncollect(data: { targetType: string; targetId: number }) {
    return request.delete('/user/interact/collect', { data })
  },

  getStatus(params: { targetType: string; targetId: number }) {
    return request.get<{ isLiked: boolean; isCollected: boolean }>('/user/interact/status', { params })
  }
}
