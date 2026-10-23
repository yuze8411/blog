<template>
  <div class="hidden lg:block lg:w-[31%] xl:w-[26%] transition-width relative dark:border-gray-700">
    <HomeContentRightMydata v-reveal></HomeContentRightMydata>
    <HomeContentRightWeather v-reveal="120"></HomeContentRightWeather>
    <HomeContentRightWebdata v-reveal="240"></HomeContentRightWebdata>
  </div>
</template>

<script setup lang="ts">
import HomeContentRightMydata from './HomeContentRightMydata.vue'
import { vReveal } from '@/directives/reveal'

// 这里是首页右侧内容的组件
</script>

<style scoped></style>
