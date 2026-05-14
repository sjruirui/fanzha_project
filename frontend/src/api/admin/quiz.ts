import { adminRequest } from '../adminRequest'
import type { PaginatedResponse, QuizLevel, Question } from '@/types'

export const adminQuizApi = {
  // Levels
  getLevels(params: {
    page?: number
    pageSize?: number
    status?: number
  }): Promise<PaginatedResponse<QuizLevel>> {
    return adminRequest.get('/quiz/levels', { params })
  },

  createLevel(data: {
    title: string
    description?: string
    difficulty?: number
    sortOrder?: number
    status?: number
  }): Promise<{ level_id: number }> {
    return adminRequest.post('/quiz/levels', data)
  },

  updateLevel(id: number, data: {
    title?: string
    description?: string
    difficulty?: number
    sortOrder?: number
    status?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/quiz/levels/${id}`, data)
  },

  deleteLevel(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/quiz/levels/${id}`)
  },

  // Questions
  getQuestions(params: {
    page?: number
    pageSize?: number
    quizId?: number
  }): Promise<PaginatedResponse<Question>> {
    return adminRequest.get('/quiz/questions', { params })
  },

  createQuestion(data: {
    quizId: number
    title: string
    type: string
    optionA: string
    optionB: string
    optionC?: string
    optionD?: string
    answer: string
    explanation?: string
    sortOrder?: number
  }): Promise<{ question_id: number }> {
    return adminRequest.post('/quiz/questions', data)
  },

  updateQuestion(id: number, data: {
    quizId?: number
    title?: string
    type?: string
    optionA?: string
    optionB?: string
    optionC?: string
    optionD?: string
    answer?: string
    explanation?: string
    sortOrder?: number
  }): Promise<{ success: boolean }> {
    return adminRequest.put(`/quiz/questions/${id}`, data)
  },

  deleteQuestion(id: number): Promise<{ success: boolean }> {
    return adminRequest.delete(`/quiz/questions/${id}`)
  }
}
