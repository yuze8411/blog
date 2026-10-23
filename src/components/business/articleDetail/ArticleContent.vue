<template>
  <div class="w-full bg-[rgb(250,250,250)] dark:bg-gray-950 pt-3">
    <div
      class="flex flex-wrap justify-between lg:w-[1100px] xl:w-[1350px] p-3 mx-auto items-start shadow-[0px_4px_20px_-10px_rgba(0,0,0,.4)] rounded-[15px] transition-colors duration-300 dark:bg-[#0a1220] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.07),0_30px_80px_-50px_rgba(0,0,0,0.95)]"
    >
      <ArticleContentLeft :virtureData="virtureData"></ArticleContentLeft>
      <ArticleContentRight :virtureData="virtureData"></ArticleContentRight>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ArticleDetailProps } from '@/types'
let props = defineProps<ArticleDetailProps>()
</script>
<style scoped></style>
