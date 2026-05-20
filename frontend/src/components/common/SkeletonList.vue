<script setup lang="ts">
/**
 * 列表骨架屏组件
 * 用于列表页加载时展示
 */

interface Props {
  count?: number
  showAvatar?: boolean
}

withDefaults(defineProps<Props>(), {
  count: 5,
  showAvatar: true
})
</script>

<template>
  <div class="skeleton-list">
    <div v-for="i in count" :key="i" class="skeleton-item">
      <div v-if="showAvatar" class="skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-footer">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  width: 100%;
}

.skeleton-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-content {
  flex: 1;
  min-width: 0;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-text {
  height: 14px;
  width: 90%;
  margin-bottom: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-tag {
  height: 20px;
  width: 60px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-date {
  height: 14px;
  width: 80px;
  margin-left: auto;
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

@media (max-width: 576px) {
  .skeleton-avatar {
    width: 60px;
    height: 60px;
  }
}
</style>
