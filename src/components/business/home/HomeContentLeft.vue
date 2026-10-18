<template>
  <div class="w-full md:w-[90%] lg:w-[67%] xl:w-[72%] mx-auto transition-width">
    <HomeContentLeftBanner></HomeContentLeftBanner>
    <HomeContentLeftBox
      v-for="(item, index) of articles"
      :article="item"
      :index="index"
    ></HomeContentLeftBox>
    <HomeContentLeftPages :total="articles.length"></HomeContentLeftPages>
  </div>
</template>

<script setup lang="ts">
// 这里是首页左侧内容的组件
import { articles } from '@/data/articles'
</script>

<style scoped></style>
