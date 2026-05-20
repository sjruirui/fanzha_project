<script setup lang="ts">
/**
 * 卡片骨架屏组件
 * 用于卡片列表加载时展示
 */

interface Props {
  count?: number
  showCover?: boolean
  coverHeight?: number
}

withDefaults(defineProps<Props>(), {
  count: 3,
  showCover: true,
  coverHeight: 160
})
</script>

<template>
  <div class="skeleton-cards">
    <div v-for="i in count" :key="i" class="skeleton-card">
      <div
        v-if="showCover"
        class="skeleton-cover"
        :style="{ height: `${coverHeight}px` }"
      ></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-meta">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-info"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.skeleton-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.skeleton-cover {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  height: 18px;
  width: 80%;
  margin-bottom: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-text {
  height: 14px;
  width: 60%;
  margin-bottom: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skeleton-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-info {
  height: 12px;
  width: 100px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 992px) {
  .skeleton-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .skeleton-cards {
    grid-template-columns: 1fr;
  }
}
</style>
