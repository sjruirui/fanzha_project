<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, ChatDotRound, Star, CollectionTag } from '@element-plus/icons-vue'
import { communityApi } from '@/api/user/community'
import { interactApi } from '@/api/user/interact'
import { commentApi } from '@/api/user/comment'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import type { Post, Comment } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentTotal = ref(0)
const commentPage = ref(1)
const commentText = ref('')
const replyTo = ref<Comment | null>(null)
const loading = ref(true)

const isLiked = ref(false)
const isCollected = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)

async function fetchPost() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    post.value = await communityApi.getPostDetail(id)
    if (isLoggedIn.value) {
      const status = await interactApi.getStatus({ targetType: 'post', targetId: id })
      isLiked.value = status.isLiked
      isCollected.value = status.isCollected
    }
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

async function fetchComments() {
  const id = Number(route.params.id)
  try {
    const res = await commentApi.getList({
      targetType: 'post',
      targetId: id,
      page: commentPage.value,
      pageSize: 10
    })
    comments.value = res.list
    commentTotal.value = res.total
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

async function handleLike() {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  try {
    if (isLiked.value) {
      await interactApi.unlike({ targetType: 'post', targetId: post.value!.id })
      isLiked.value = false
      post.value!.likes--
    } else {
      await interactApi.like({ targetType: 'post', targetId: post.value!.id })
      isLiked.value = true
      post.value!.likes++
    }
  } catch {
    // Error handled
  }
}

async function handleCollect() {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  try {
    if (isCollected.value) {
      await interactApi.uncollect({ targetType: 'post', targetId: post.value!.id })
      isCollected.value = false
      ElMessage.success('已取消收藏')
    } else {
      await interactApi.collect({ targetType: 'post', targetId: post.value!.id })
      isCollected.value = true
      ElMessage.success('收藏成功')
    }
  } catch {
    // Error handled
  }
}

function handleReply(comment: Comment) {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  replyTo.value = comment
  commentText.value = `@${comment.user?.nickname || '用户'} `
}

function cancelReply() {
  replyTo.value = null
  commentText.value = ''
}

async function submitComment() {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    await commentApi.create({
      targetType: 'post',
      targetId: post.value!.id,
      parentId: replyTo.value?.id,
      replyToUserId: replyTo.value?.userId,
      content: commentText.value
    })
    ElMessage.success('评论成功')
    commentText.value = ''
    replyTo.value = null
    fetchComments()
  } catch {
    // Error handled
  }
}

async function handleDeletePost() {
  try {
    await ElMessageBox.confirm('确定要删除这篇帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await communityApi.deletePost(post.value!.id)
    ElMessage.success('删除成功')
    router.push('/community')
  } catch {
    // User cancelled or error
  }
}

async function handleDeleteComment(comment: Comment) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await commentApi.delete(comment.id)
    ElMessage.success('删除成功')
    fetchComments()
  } catch {
    // User cancelled or error
  }
}

function canDeleteComment(comment: Comment): boolean {
  return isLoggedIn.value && userStore.userInfo?.id === comment.userId
}

onMounted(() => {
  fetchPost()
  fetchComments()
})
</script>

<template>
  <div class="community-detail-page container">
    <div v-loading="loading">
      <template v-if="post">
        <!-- Post Header -->
        <div class="post-header card">
          <div class="header-top">
            <el-tag v-if="post.categoryName" effect="plain">{{ post.categoryName }}</el-tag>
            <span class="post-time">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <div class="author-info">
              <el-avatar :size="40" :src="post.author?.avatar || undefined">
                {{ post.author?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="author-detail">
                <div class="author-name">{{ post.author?.nickname || '用户' }}</div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.views }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.comments }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likes }}</span>
                </div>
              </div>
            </div>
            <div v-if="userStore.userInfo?.id === post.userId" class="post-actions">
              <el-button type="primary" link @click="router.push(`/community/${post.id}/edit`)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDeletePost">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- Post Content -->
        <div class="post-content card">
          <div v-if="post.summary" class="post-summary">{{ post.summary }}</div>
          <div class="rich-content" v-html="post.content"></div>
        </div>

        <!-- Action Buttons -->
        <div class="action-bar card">
          <el-button :type="isLiked ? 'primary' : 'default'" @click="handleLike">
            <el-icon><Star /></el-icon>
            {{ isLiked ? '已点赞' : '点赞' }}
          </el-button>
          <el-button :type="isCollected ? 'warning' : 'default'" @click="handleCollect">
            <el-icon><CollectionTag /></el-icon>
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section card">
          <h3 class="section-title">评论 ({{ commentTotal }})</h3>

          <!-- Comment Input -->
          <div class="comment-input">
            <div v-if="replyTo" class="reply-info">
              回复 <span class="reply-name">@{{ replyTo.user?.nickname || '用户' }}</span>
              <el-button link size="small" @click="cancelReply">取消</el-button>
            </div>
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
            />
            <div class="input-actions">
              <el-button type="primary" @click="submitComment">发表评论</el-button>
            </div>
          </div>

          <!-- Comment List -->
          <div class="comment-list">
            <div v-if="comments.length === 0" class="empty-comments">
              暂无评论，快来抢沙发吧~
            </div>
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="36" :src="comment.user?.avatar || undefined">
                {{ comment.user?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user?.nickname || '用户' }}</span>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="comment-text">
                  <span v-if="comment.replyToUsername" class="reply-to">
                    @{{ comment.replyToUsername }}
                  </span>
                  {{ comment.content }}
                </div>
                <div class="comment-actions">
                  <el-button link size="small" @click="handleReply(comment)">回复</el-button>
                  <el-button v-if="canDeleteComment(comment)" type="danger" link size="small" @click="handleDeleteComment(comment)">删除</el-button>
                </div>
                <!-- Replies -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <el-avatar :size="28" :src="reply.user?.avatar || undefined">
                      {{ reply.user?.nickname?.charAt(0) || 'U' }}
                    </el-avatar>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.user?.nickname || '用户' }}</span>
                        <span v-if="reply.replyToUsername" class="reply-to-user">@{{ reply.replyToUsername }}</span>
                        <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <div class="reply-text">{{ reply.content }}</div>
                      <div class="reply-actions">
                        <el-button link size="small" @click="handleReply(reply)">回复</el-button>
                        <el-button v-if="canDeleteComment(reply)" type="danger" link size="small" @click="handleDeleteComment(reply)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="帖子不存在" />
    </div>
  </div>
</template>

<style scoped>
.community-detail-page {
  padding: 20px;
  max-width: 900px;
}

.post-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.post-time {
  font-size: 13px;
  color: #909399;
}

.post-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-content {
  margin-bottom: 20px;
}

.post-summary {
  font-size: 15px;
  color: #606266;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.comments-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.comment-input {
  margin-bottom: 24px;
}

.reply-info {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.reply-name {
  color: #409eff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-comments {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.reply-to {
  color: #409eff;
}

.comment-actions {
  margin-top: 6px;
}

.replies-list {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.reply-to-user {
  font-size: 13px;
  color: #409eff;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.reply-actions {
  margin-top: 4px;
}
</style>
