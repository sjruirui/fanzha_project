import { request } from '../request'
import type { Chapter, Lesson } from '@/types'

export const classroomApi = {
  getChapters() {
    return request.get<{ chapters: Chapter[] }>('/user/classroom/chapters').then(res => res.chapters || [])
  },

  getChapterLessons(chapterId: number) {
    return request.get<{ lessons: Lesson[] }>(`/user/classroom/chapters/${chapterId}/lessons`).then(res => res.lessons || [])
  },

  getLessonDetail(id: number) {
    return request.get<Lesson>(`/user/classroom/lessons/${id}`)
  }
}
