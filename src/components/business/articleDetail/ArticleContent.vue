<template>
  <div class="w-full bg-[rgb(250,250,250)] dark:bg-gray-950 pt-3">
    <div
      class="flex flex-wrap justify-between lg:w-[1050px] xl:w-[1300px] p-3 mx-auto items-start shadow-[0px_4px_20px_-10px_rgba(0,0,0,.4)] rounded-[15px]"
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
