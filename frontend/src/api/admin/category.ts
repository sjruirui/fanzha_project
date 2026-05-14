import { adminRequest } from '../adminRequest'
import type { Category } from '@/types'

export const adminCategoryApi = {
  getList(): Promise<{ categories: Category[] }> {
    return adminRequest.get('/categories')
  },

  create(data: {
    name: string
    description?: string
    sortOrder?: number
  }): Promise<{ category_id: number }> {
    return adminRequest.post('/categories', data)
  },

  update(id: number, data: {
    name?: string
    description?: string
    sortOrder?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/categories/${id}`, data)
  },

  delete(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/categories/${id}`)
  }
}
