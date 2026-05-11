import { request } from '../request'

export const uploadApi = {
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadVideo(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string }>('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string }>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
