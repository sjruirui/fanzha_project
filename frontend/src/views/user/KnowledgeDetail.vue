<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { knowledgeApi } from '@/api/user/knowledge'
import type { Knowledge } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const knowledge = ref<Knowledge | null>(null)
const relatedList = ref<Knowledge[]>([])
const loading = ref(true)

const typeLabels: Record<string, string> = {
  guide: '防骗指南',
  tactics: '诈骗话术集'
}

const targetLabels: Record<string, string> = {
  elderly: '老年人',
  student: '学生',
  finance: '财务人员',
  other: '其他'
}

async function fetchKnowledge() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const [detail, related] = await Promise.all([
      knowledgeApi.getDetail(id),
      knowledgeApi.getRelated(id)
    ])
    knowledge.value = detail
    relatedList.value = related
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function goToKnowledge(id: number) {
  router.push(`/knowledge/${id}`)
}

onMounted(() => {
  fetchKnowledge()
})
</script>

<template>
  <div class="knowledge-detail-page container">
    <div v-loading="loading">
      <template v-if="knowledge">
        <!-- Article Header -->
        <div class="article-header card">
          <h1 class="article-title">{{ knowledge.title }}</h1>
          <div class="article-tags">
            <el-tag v-if="knowledge.type" type="primary">
              {{ typeLabels[knowledge.type] || knowledge.type }}
            </el-tag>
            <el-tag v-if="knowledge.targetGroup" type="info">
              {{ targetLabels[knowledge.targetGroup] || knowledge.targetGroup }}
            </el-tag>
          </div>
          <div class="article-meta">
            <span class="views">
              <el-icon><View /></el-icon>
              {{ knowledge.views }} 阅读
            </span>
            <span class="date">
              <el-icon><Clock /></el-icon>
              {{ formatDate(knowledge.createdAt) }}
            </span>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="knowledge.summary" class="article-summary card">
          <div class="summary-label">摘要</div>
          <p>{{ knowledge.summary }}</p>
        </div>

        <!-- Article Content -->
        <div class="article-content card">
          <div class="rich-content" v-html="knowledge.content"></div>
        </div>

        <!-- Tags -->
        <div v-if="knowledge.tags" class="article-tags-section card">
          <span class="tag-label">标签：</span>
          <el-tag
            v-for="tag in knowledge.tags.split(',')"
            :key="tag"
            class="tag-item"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- Related Knowledge -->
        <div v-if="relatedList.length > 0" class="related-section card">
          <h3 class="section-title">相关知识</h3>
          <div class="related-list">
            <div
              v-for="item in relatedList"
              :key="item.id"
              class="related-item"
              @click="goToKnowledge(item.id)"
            >
              <img :src="item.cover || '/placeholder.jpg'" :alt="item.title" />
              <div class="related-info">
                <div class="related-title">{{ item.title }}</div>
                <div class="related-meta">
                  <span>{{ typeLabels[item.type] || item.type }}</span>
                  <span>{{ item.views }} 阅读</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="知识不存在" />
    </div>
  </div>
</template>

<style scoped>
.knowledge-detail-page {
  padding: 20px;
  max-width: 900px;
}

.article-header {
  text-align: center;
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.article-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-summary {
  margin-bottom: 20px;
  background: #f5f7fa;
}

.summary-label {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.article-summary p {
  color: #606266;
  line-height: 1.8;
}

.article-content {
  margin-bottom: 20px;
}

.article-tags-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-label {
  color: #606266;
  font-size: 14px;
}

.tag-item {
  cursor: pointer;
}

.related-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.3s;
}

.related-item:hover {
  background: #f5f7fa;
}

.related-item img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.related-info {
  flex: 1;
}

.related-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 22px;
  }

  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
