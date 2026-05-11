import { request } from '../request'
import type { QuizLevel, Question, QuizResult } from '@/types'

export const quizApi = {
  getLevels() {
    return request.get<QuizLevel[]>('/user/quiz/levels')
  },

  getQuestions(levelId: number) {
    return request.get<Question[]>(`/user/quiz/levels/${levelId}/questions`)
  },

  submit(levelId: number, answers: { questionId: number; answer: string }[]) {
    return request.post<QuizResult>(`/user/quiz/levels/${levelId}/submit`, { answers })
  },

  getRecords() {
    return request.get<{ levelId: number; score: number; passed: boolean; createdAt: string }[]>('/user/quiz/records')
  }
}
