<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Location, User, View, Star, CollectionTag } from '@element-plus/icons-vue'
import { activityApi } from '@/api/user/activity'
import { interactApi } from '@/api/user/interact'
import { commentApi } from '@/api/user/comment'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import type { Activity, Comment } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const activity = ref<Activity | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const replyTo = ref<Comment | null>(null)
const loading = ref(true)

const isSigned = ref(false)
const isLiked = ref(false)
const isCollected = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)

function getImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder.jpg'
  // Convert backslashes to forward slashes for URL
  const normalizedPath = path.replace(/\\/g, '/')
  // Ensure path starts with /
  return normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath
}

async function fetchActivity() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    activity.value = await activityApi.getDetail(id)
    if (isLoggedIn.value) {
      const [signStatus, interactStatus] = await Promise.all([
        activityApi.checkSignStatus(id),
        interactApi.getStatus({ targetType: 'activity', targetId: id })
      ])
      isSigned.value = signStatus.isSigned
      isLiked.value = interactStatus.isLiked
      isCollected.value = interactStatus.isCollected
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
      targetType: 'activity',
      targetId: id,
      page: 1,
      pageSize: 10
    })
    comments.value = res.list
  } catch {
    // Error handled
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

async function handleSign() {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  try {
    if (isSigned.value) {
      await ElMessageBox.confirm('确定要取消报名吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await activityApi.cancelSignUp(activity.value!.id)
      isSigned.value = false
      activity.value!.signs--
      ElMessage.success('已取消报名')
    } else {
      await activityApi.signUp(activity.value!.id)
      isSigned.value = true
      activity.value!.signs++
      ElMessage.success('报名成功')
    }
  } catch {
    // User cancelled or error
  }
}

async function handleLike() {
  if (!isLoggedIn.value) {
    appStore.openLoginModal('login')
    return
  }
  try {
    if (isLiked.value) {
      await interactApi.unlike({ targetType: 'activity', targetId: activity.value!.id })
      isLiked.value = false
      activity.value!.likes--
    } else {
      await interactApi.like({ targetType: 'activity', targetId: activity.value!.id })
      isLiked.value = true
      activity.value!.likes++
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
      await interactApi.uncollect({ targetType: 'activity', targetId: activity.value!.id })
      isCollected.value = false
      ElMessage.success('已取消收藏')
    } else {
      await interactApi.collect({ targetType: 'activity', targetId: activity.value!.id })
      isCollected.value = true
      ElMessage.success('收藏成功')
    }
  } catch {
    // Error handled
  }
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
      targetType: 'activity',
      targetId: activity.value!.id,
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
  fetchActivity()
  fetchComments()
})
</script>

<template>
  <div class="activity-detail-page container">
    <div v-loading="loading">
      <template v-if="activity">
        <!-- Activity Header -->
        <div class="activity-header card">
          <div class="header-top">
            <el-tag :type="activity.form === 'online' ? 'success' : 'warning'">
              {{ activity.form === 'online' ? '线上活动' : '线下活动' }}
            </el-tag>
          </div>
          <h1 class="activity-title">{{ activity.title }}</h1>
          <div class="activity-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(activity.startTime) }} ~ {{ formatDate(activity.endTime) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ activity.address || '线上活动' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>主办方：{{ activity.organizer }}</span>
            </div>
          </div>
        </div>

        <!-- Activity Cover -->
        <div class="activity-cover card">
          <img :src="getImageUrl(activity.cover)" :alt="activity.title" />
        </div>

        <!-- Activity Content -->
        <div class="activity-content card">
          <div class="rich-content" v-html="activity.content"></div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar card">
          <el-button type="primary" size="large" @click="handleSign">
            {{ isSigned ? '取消报名' : '立即报名' }}
          </el-button>
          <el-button :type="isLiked ? 'primary' : 'default'" @click="handleLike">
            <el-icon><Star /></el-icon>
            {{ isLiked ? '已点赞' : '点赞' }}
          </el-button>
          <el-button :type="isCollected ? 'warning' : 'default'" @click="handleCollect">
            <el-icon><CollectionTag /></el-icon>
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
          <div class="stats">
            <span><el-icon><View /></el-icon> {{ activity.views }}</span>
            <span><el-icon><User /></el-icon> {{ activity.signs }} 人报名</span>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section card">
          <h3 class="section-title">评论</h3>
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
          <div class="comment-list">
            <div v-if="comments.length === 0" class="empty-comments">
              暂无评论
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
                  <span v-if="comment.replyToUsername" class="reply-to">@{{ comment.replyToUsername }}</span>
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

      <el-empty v-else-if="!loading" description="活动不存在" />
    </div>
  </div>
</template>

<style scoped>
.activity-detail-page {
  padding: 20px;
  max-width: 900px;
}

.activity-header {
  margin-bottom: 20px;
}

.header-top {
  margin-bottom: 12px;
}

.activity-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.activity-cover {
  margin-bottom: 20px;
  padding: 0;
  overflow: hidden;
}

.activity-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.activity-content {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stats {
  margin-left: auto;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #909399;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
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

.reply-info {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.reply-name {
  color: #409eff;
}
</style>
