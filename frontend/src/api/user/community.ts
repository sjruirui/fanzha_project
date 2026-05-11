import { request } from '../request'
import type { Post, Category, PaginatedResponse } from '@/types'

export const communityApi = {
  getPosts(params: { page?: number; pageSize?: number; categoryId?: number; keyword?: string }) {
    return request.get<PaginatedResponse<Post>>('/user/community/posts', { params })
  },

  getPostDetail(id: number) {
    return request.get<Post>(`/user/community/posts/${id}`)
  },

  createPost(data: { categoryId: number; title: string; summary: string; cover: string; content: string; tags: string }) {
    return request.post<{ postId: number }>('/user/community/posts', data)
  },

  updatePost(id: number, data: { categoryId: number; title: string; summary: string; cover: string; content: string; tags: string }) {
    return request.put(`/user/community/posts/${id}`, data)
  },

  deletePost(id: number) {
    return request.delete(`/user/community/posts/${id}`)
  },

  getCategories() {
    return request.get<Category[]>('/user/community/categories')
  }
}
