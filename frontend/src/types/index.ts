// API Response Types
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// User Types
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  bio: string
  createdAt: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  phone: string
  password: string
}

// News Types
export interface News {
  id: number
  title: string
  summary: string
  cover: string
  content: string
  type: string
  tags: string
  author: string
  views: number
  status: number
  publishedAt: string
  createdAt: string
}

// Knowledge Types
export interface Knowledge {
  id: number
  title: string
  summary: string
  cover: string
  content: string
  type: string
  targetGroup: string
  tags: string
  views: number
  createdAt: string
}

// Chapter Types
export interface Chapter {
  id: number
  title: string
  summary: string
  cover: string
  sortOrder: number
  lessonCount: number
  createdAt: string
}

// Lesson Types
export interface Lesson {
  id: number
  chapterId: number
  title: string
  summary: string
  cover: string
  videoUrl: string
  duration: number
  sortOrder: number
  views: number
  createdAt: string
}

// Post Types
export interface Post {
  id: number
  userId: number
  categoryId: number
  categoryName: string
  title: string
  summary: string
  cover: string
  content: string
  tags: string
  views: number
  likes: number
  comments: number
  status: number
  author: UserInfo
  createdAt: string
}

// Category Types
export interface Category {
  id: number
  name: string
  description: string
  sortOrder: number
}

// Activity Types
export interface Activity {
  id: number
  title: string
  summary: string
  cover: string
  content: string
  organizer: string
  form: 'online' | 'offline'
  address: string
  startTime: string
  endTime: string
  views: number
  likes: number
  signs: number
  status: number
  createdAt: string
}

// Quiz Types
export interface QuizLevel {
  id: number
  title: string
  description: string
  difficulty: number
  questionCount: number
  passed: boolean
  sortOrder: number
}

export interface Question {
  id: number
  quizId: number
  title: string
  type: 'single' | 'multiple'
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answer: string
  explanation: string
  sortOrder: number
}

export interface QuizResult {
  score: number
  correctCount: number
  totalQuestions: number
  passed: boolean
}

// Report Types
export interface Report {
  id: number
  title: string
  type: string
  amount: number
  description: string
  evidence: string
  status: number
  remark: string
  createdAt: string
  updatedAt: string
}

// Comment Types
export interface Comment {
  id: number
  userId: number
  targetType: string
  targetId: number
  parentId: number
  replyToUserId: number
  replyToUsername: string
  content: string
  user: UserInfo
  replies: Comment[]
  createdAt: string
}

// Banner Types
export interface Banner {
  id: number
  title: string
  image: string
  link: string
  sortOrder: number
}

// Notice Types
export interface Notice {
  id: number
  title: string
  content: string
  publishedAt: string
  publisherName?: string
}

// Interact Types
export interface LikeItem {
  id: number
  targetType: string
  targetId: number
  targetTitle: string
  targetCover: string
  createdAt: string
}

export interface CollectItem {
  id: number
  targetType: string
  targetId: number
  targetTitle: string
  targetCover: string
  createdAt: string
}

// AI Types
export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AiSession {
  id: string
  mode: 'chat' | 'scenario'
  scenario?: string
  messages: AiMessage[]
}
