<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '@/api/user/profile'
import type { Post } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const posts = ref<Post[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

async function fetchPosts() {
  loading.value = true
  try {
    const res = await profileApi.getPosts({ page: page.value, pageSize: pageSize.value })
    posts.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function goToDetail(id: number) {
  router.push(`/community/${id}`)
}

function handlePageChange(val: number) {
  page.value = val
  fetchPosts()
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="profile-posts-page card">
    <h3 class="section-title">我的帖子</h3>

    <div v-loading="loading" class="post-list">
      <div v-if="posts.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无帖子">
          <el-button type="primary" @click="router.push('/community/create')">发布帖子</el-button>
        </el-empty>
      </div>
      <div v-else class="posts">
        <div v-for="post in posts" :key="post.id" class="post-item" @click="goToDetail(post.id)">
          <div v-if="post.cover" class="post-cover">
            <img :src="post.cover" :alt="post.title" />
          </div>
          <div class="post-info">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-meta">
              <span>{{ post.categoryName }}</span>
              <span>{{ formatDate(post.createdAt) }}</span>
              <span><el-icon><View /></el-icon> {{ post.views }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ post.comments }}</span>
            </div>
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
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.post-list {
  min-height: 300px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.post-item:hover {
  background: #f5f7fa;
}

.post-cover {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
