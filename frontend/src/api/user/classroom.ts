import { request } from '../request'
import type { Chapter, Lesson } from '@/types'

export const classroomApi = {
  getChapters() {
    return request.get<Chapter[]>('/user/classroom/chapters')
  },

  getChapterLessons(chapterId: number) {
    return request.get<Lesson[]>(`/user/classroom/chapters/${chapterId}/lessons`)
  },

  getLessonDetail(id: number) {
    return request.get<Lesson>(`/user/classroom/lessons/${id}`)
  }
}
