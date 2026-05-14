import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, Chapter, Lesson } from '@/types'

export const adminClassroomApi = {
  // Chapters
  getChapters(params: {
    page?: number
    pageSize?: number
    status?: number
  }): Promise<PaginatedResponse<Chapter>> {
    return adminRequest.get('/classroom/chapters', { params })
  },

  createChapter(data: {
    title: string
    summary?: string
    cover?: string
    sortOrder?: number
    status?: number
  }): Promise<{ chapter_id: number }> {
    return adminRequest.post('/classroom/chapters', data)
  },

  updateChapter(id: number, data: {
    title?: string
    summary?: string
    cover?: string
    sortOrder?: number
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/classroom/chapters/${id}`, data)
  },

  deleteChapter(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/classroom/chapters/${id}`)
  },

  // Lessons
  getLessons(params: {
    page?: number
    pageSize?: number
    chapterId?: number
    status?: number
  }): Promise<PaginatedResponse<Lesson>> {
    return adminRequest.get('/classroom/lessons', { params })
  },

  createLesson(data: {
    chapterId: number
    title: string
    summary?: string
    cover?: string
    videoUrl: string
    duration?: number
    sortOrder?: number
    status?: number
  }): Promise<{ lesson_id: number }> {
    return adminRequest.post('/classroom/lessons', data)
  },

  updateLesson(id: number, data: {
    chapterId?: number
    title?: string
    summary?: string
    cover?: string
    videoUrl?: string
    duration?: number
    sortOrder?: number
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/classroom/lessons/${id}`, data)
  },

  deleteLesson(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/classroom/lessons/${id}`)
  }
}
