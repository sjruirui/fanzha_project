<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '@/api/user/profile'
import type { Comment } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const comments = ref<Comment[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const activeType = ref<number | string>(0)

const types = [
  { label: '全部', value: 0 },
  { label: '帖子', value: 'post' },
  { label: '活动', value: 'activity' }
]

async function fetchComments() {
  loading.value = true
  try {
    const res = await profileApi.getComments({
      page: page.value,
      pageSize: pageSize.value,
      targetType: activeType.value || undefined
    })
    comments.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function goToDetail(comment: Comment) {
  if (comment.targetType === 'post') {
    router.push(`/community/${comment.targetId}`)
  } else if (comment.targetType === 'activity') {
    router.push(`/activity/${comment.targetId}`)
  }
}

function handlePageChange(val: number) {
  page.value = val
  fetchComments()
}

watch(activeType, () => {
  page.value = 1
  fetchComments()
})

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="profile-comments-page card">
    <div class="header">
      <h3 class="section-title">我的评论</h3>
      <el-radio-group v-model="activeType" size="small">
        <el-radio-button v-for="t in types" :key="t.value" :value="t.value">
          {{ t.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="comment-list">
      <div v-if="comments.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无评论记录" />
      </div>
      <div v-else class="comments">
        <div v-for="comment in comments" :key="comment.id" class="comment-item" @click="goToDetail(comment)">
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-meta">
            <el-tag size="small" effect="plain">
              {{ comment.targetType === 'post' ? '帖子' : '活动' }}
            </el-tag>
            <span>{{ formatDate(comment.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.comment-list {
  min-height: 300px;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: background 0.3s;
}

.comment-item:hover {
  background: #ecf5ff;
}

.comment-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
