import { request } from '../request'
import type { Post, Category, PaginatedResponse } from '@/types'

export const communityApi = {
  getPosts(params: { page?: number; pageSize?: number; categoryId?: number; keyword?: string }) {
    return request.get<PaginatedResponse<Post>>('/user/community/posts', { params })
  },

  getPostDetail(id: number) {
    return request.get<{ post_detail: Post }>(`/user/community/posts/${id}`).then(res => {
      const post = res.post_detail
      if (post) {
        // Transform snake_case fields to camelCase
        return {
          ...post,
          userId: post.user_id,
          categoryId: post.category_id,
          categoryName: post.category_name,
          likes: post.likes_count,
          comments: post.comments_count,
          author: {
            id: post.user_id,
            nickname: post.author_nickname,
            avatar: post.author_avatar
          },
          createdAt: post.created_at
        } as Post
      }
      return null as unknown as Post
    })
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
    return request.get<{ categories: Category[] }>('/user/community/categories').then(res => res.categories)
  }
}
