import { request } from '../request'

// Target type mapping: string -> number
const targetTypeMap: Record<string, number> = {
  post: 1,
  activity: 2,
  news: 3,
  knowledge: 4
}

const getTargetTypeNum = (type: string): number => targetTypeMap[type] || 1

export const interactApi = {
  like(data: { targetType: string; targetId: number }) {
    return request.post('/user/interact/like', {
      targetType: getTargetTypeNum(data.targetType),
      targetId: data.targetId
    })
  },

  unlike(data: { targetType: string; targetId: number }) {
    return request.delete('/user/interact/like', {
      data: {
        targetType: getTargetTypeNum(data.targetType),
        targetId: data.targetId
      }
    })
  },

  collect(data: { targetType: string; targetId: number }) {
    return request.post('/user/interact/collect', {
      targetType: getTargetTypeNum(data.targetType),
      targetId: data.targetId
    })
  },

  uncollect(data: { targetType: string; targetId: number }) {
    return request.delete('/user/interact/collect', {
      data: {
        targetType: getTargetTypeNum(data.targetType),
        targetId: data.targetId
      }
    })
  },

  getStatus(params: { targetType: string; targetId: number }) {
    return request.get<{ isLiked: boolean; isCollected: boolean }>('/user/interact/status', {
      params: {
        targetType: getTargetTypeNum(params.targetType),
        targetId: params.targetId
      }
    })
  }
}
