import { request } from '../request'

export interface Notice {
  id: number
  title: string
  content: string
  publishedAt: string
  publisherName?: string
}

export const noticeApi = {
  getList() {
    return request.get<{ list: Notice[] }>('/user/notices/list').then(res => res.list || [])
  },

  getDetail(id: number) {
    return request.get<Notice>(`/user/notices/${id}`)
  }
}
