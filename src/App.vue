<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />

  <!-- 后台全局提示框：任意组件里 useAdminAlert() 触发的提示都在这里渲染 -->
  <AdminAlert />
</template>

<style scoped></style>
