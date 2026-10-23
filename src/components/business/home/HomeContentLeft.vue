<template>
  <div class="w-full md:w-[90%] lg:w-[67%] xl:w-[72%] mx-auto transition-width">
    <HomeContentLeftBanner v-reveal></HomeContentLeftBanner>
    <div v-for="(item, index) of articles" :key="item.textId" v-reveal="index * 90">
      <HomeContentLeftBox :article="item" :index="index"></HomeContentLeftBox>
    </div>
    <HomeContentLeftPages :total="articles.length"></HomeContentLeftPages>
  </div>
</template>

<script setup lang="ts">
// 这里是首页左侧内容的组件
import { articles } from '@/data/articles'
import { vReveal } from '@/directives/reveal'
</script>

<style scoped></style>
