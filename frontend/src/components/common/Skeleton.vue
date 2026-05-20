<script setup lang="ts">
/**
 * 骨架屏组件
 * 用于内容加载时展示占位效果，提升用户体验
 */

interface Props {
  loading?: boolean
  rows?: number
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: true,
  rows: 3,
  animated: true
})
</script>

<template>
  <div v-if="loading" class="skeleton" :class="{ animated }">
    <slot>
      <!-- 默认骨架屏内容 -->
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div class="skeleton-item" :style="{ width: `${100 - (i - 1) * 15}%` }"></div>
      </div>
    </slot>
  </div>
  <template v-else>
    <slot name="content"></slot>
  </template>
</template>

<style scoped>
.skeleton {
  width: 100%;
}

.skeleton.animated .skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-row {
  margin-bottom: 12px;
}

.skeleton-item {
  height: 16px;
  border-radius: 4px;
  background: #f0f0f0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
