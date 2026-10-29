<template>
  <div class="min-h-screen bg-[rgb(250,250,250)] dark:bg-gray-950">
    <TopNavigation />
    <main>
      <TagsArticleCover :tag="tagName" :total="articles.length" />
      <TagsArticleContent :tag="tagName" :articles="articles" />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTagArticles } from '@/data/tagArticles'

const route = useRoute()

// 当前标签名
const tagName = computed(() => {
  const value = route.params.tag
  return (Array.isArray(value) ? value[0] : value) ?? ''
})

const articles = computed(() => getTagArticles(tagName.value))
</script>

<style scoped></style>
