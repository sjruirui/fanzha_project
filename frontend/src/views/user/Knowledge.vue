<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { knowledgeApi } from '@/api/user/knowledge'
import type { Knowledge } from '@/types'

const route = useRoute()
const router = useRouter()

const knowledgeList = ref<Knowledge[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

const types = [
  { label: '全部', value: '' },
  { label: '防骗指南', value: 'guide' },
  { label: '诈骗话术集', value: 'tactics' }
]

const targetGroups = [
  { label: '全部人群', value: '' },
  { label: '老年人', value: 'elderly' },
  { label: '学生', value: 'student' },
  { label: '财务人员', value: 'finance' },
  { label: '其他', value: 'other' }
]

const activeType = ref('')
const activeTarget = ref('')
const keyword = ref('')

async function fetchKnowledge() {
  loading.value = true
  try {
    const res = await knowledgeApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      type: activeType.value,
      targetGroup: activeTarget.value,
      keyword: keyword.value
    })
    knowledgeList.value = res.list
    total.value = res.total
  } catch {
    // Error handled
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchKnowledge()
}

function handlePageChange(val: number) {
  page.value = val
  fetchKnowledge()
}

function goToDetail(id: number) {
  router.push(`/knowledge/${id}`)
}

watch([activeType, activeTarget], () => {
  page.value = 1
  fetchKnowledge()
})

onMounted(() => {
  fetchKnowledge()
})
</script>

<template>
  <div class="knowledge-page container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">反诈知识库</h1>
    </div>

    <!-- Filter Section -->
    <div class="filter-section card">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">知识分类：</span>
          <el-radio-group v-model="activeType" size="small">
            <el-radio-button v-for="t in types" :key="t.value" :value="t.value">
              {{ t.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-group">
          <span class="filter-label">人群分类：</span>
          <el-radio-group v-model="activeTarget" size="small">
            <el-radio-button v-for="t in targetGroups" :key="t.value" :value="t.value">
              {{ t.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="搜索知识"
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

    <!-- Knowledge List -->
    <div v-loading="loading" class="knowledge-list">
      <div v-if="knowledgeList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无知识" />
      </div>
      <div v-else class="knowledge-grid">
        <div
          v-for="item in knowledgeList"
          :key="item.id"
          class="knowledge-card"
          @click="goToDetail(item.id)"
        >
          <div class="knowledge-cover">
            <img :src="item.cover || '/placeholder.jpg'" :alt="item.title" />
          </div>
          <div class="knowledge-info">
            <div class="knowledge-title">{{ item.title }}</div>
            <div class="knowledge-summary">{{ item.summary }}</div>
            <div class="knowledge-meta">
              <el-tag v-if="item.type" size="small" effect="plain">
                {{ types.find(t => t.value === item.type)?.label || item.type }}
              </el-tag>
              <el-tag v-if="item.targetGroup" size="small" type="info" effect="plain">
                {{ targetGroups.find(t => t.value === item.targetGroup)?.label || item.targetGroup }}
              </el-tag>
              <span class="views">{{ item.views }} 阅读</span>
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
.knowledge-page {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.search-box {
  max-width: 400px;
}

.knowledge-list {
  min-height: 400px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.knowledge-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.knowledge-cover {
  height: 160px;
  overflow: hidden;
}

.knowledge-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.knowledge-card:hover .knowledge-cover img {
  transform: scale(1.05);
}

.knowledge-info {
  padding: 16px;
}

.knowledge-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-summary {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.views {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 992px) {
  .knowledge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>
