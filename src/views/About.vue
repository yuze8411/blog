<template>
  <!-- About 是全屏滚轮页，导航默认收起，鼠标移到顶部或键盘聚焦时再滑出 -->
  <TopNavigation visibility="hidden"></TopNavigation>

  <div class="relative z-10"><AboutContent></AboutContent></div>
</template>
<script setup lang="ts">
import TopNavigation from '@/components/common/TopNavigation.vue'
</script>

<style scoped></style>
