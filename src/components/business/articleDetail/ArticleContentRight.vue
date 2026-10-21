<template>
  <div
    class="hidden lg:block self-start lg:sticky lg:top-20 lg:w-[24%] xl:w-[20%] transition-width relative space-y-4 dark:border-gray-700"
  >
    <!--封面-->
    <ArticleContentRightImg></ArticleContentRightImg>
    <ArticleContentRightCatalog :virtureData="virtureData"></ArticleContentRightCatalog>
    <!-- 后续其它内容卡片直接追加在这里，space-y-4 会自动拉开间距 -->
  </div>
</template>

<script setup lang="ts">
import type { ArticleDetailProps } from '@/types'

defineProps<ArticleDetailProps>()
</script>

<style scoped></style>
