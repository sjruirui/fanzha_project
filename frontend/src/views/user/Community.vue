<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, View, ChatDotRound, Star } from '@element-plus/icons-vue'
import { communityApi } from '@/api/user/community'
import SkeletonList from '@/components/common/SkeletonList.vue'
import type { Post, Category } from '@/types'

const router = useRouter()

const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const activeCategory = ref<number>(0)
const keyword = ref('')

async function fetchCategories() {
  try {
    categories.value = await communityApi.getCategories()
  } catch {
    // Error handled
  }
}

async function fetchPosts() {
  loading.value = true
  try {
    const res = await communityApi.getPosts({
      page: page.value,
      pageSize: pageSize.value,
      categoryId: activeCategory.value || undefined,
      keyword: keyword.value
    })
    posts.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchPosts()
}

function handlePageChange(val: number) {
  page.value = val
  fetchPosts()
}

function goToDetail(id: number) {
  router.push(`/community/${id}`)
}

function goToCreate() {
  router.push('/community/create')
}

watch(activeCategory, () => {
  page.value = 1
  fetchPosts()
})

onMounted(() => {
  fetchCategories()
  fetchPosts()
})
</script>

<template>
  <div class="community-page container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">交流互动</h1>
      </div>
      <el-button type="primary" @click="goToCreate">
        <el-icon><Plus /></el-icon>
        发布帖子
      </el-button>
    </div>

    <!-- Filter Section -->
    <div class="filter-section card">
      <div class="category-tabs">
        <el-radio-group v-model="activeCategory" size="small">
          <el-radio-button :value="0">全部</el-radio-button>
          <el-radio-button
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索帖子"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Post List -->
    <div class="post-list">
      <!-- 骨架屏 -->
      <SkeletonList v-if="loading" :count="5" :show-avatar="true" />
      <!-- 内容 -->
      <div v-else-if="posts.length === 0" class="empty-state">
        <el-empty description="暂无帖子" />
      </div>
      <div v-else class="posts">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-item card"
          @click="goToDetail(post.id)"
        >
          <div v-if="post.cover" class="post-cover">
            <img v-lazy="post.cover" :alt="post.title" />
          </div>
          <div class="post-content">
            <div class="post-header">
              <el-tag v-if="post.categoryName" size="small" effect="plain">
                {{ post.categoryName }}
              </el-tag>
              <span class="post-time">{{ post.createdAt?.split('T')[0] }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-summary">{{ post.summary }}</p>
            <div class="post-footer">
              <div class="author-info">
                <el-avatar :size="24" :src="post.author?.avatar || undefined">
                  {{ post.author?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="author-name">{{ post.author?.nickname || '用户' }}</span>
              </div>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.views }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.comments }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
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
.community-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  width: 300px;
}

.post-list {
  min-height: 400px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.post-cover {
  width: 200px;
  height: 130px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 13px;
  color: #606266;
}

.post-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .post-item {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 180px;
  }

  .filter-section {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}
</style>
