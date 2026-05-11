<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">
        <div class="logo">管理后台</div>
        <el-menu default-active="/admin">
          <el-menu-item index="/admin" @click="router.push('/admin')">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-aside {
  background: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background: #263445;
}

.el-menu {
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  background: #263445;
  color: #409eff;
}
</style>
