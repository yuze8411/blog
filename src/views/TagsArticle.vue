<template>
  <div class="min-h-screen bg-[rgb(250,250,250)] dark:bg-gray-950">
    <TopNavigation />
    <main>
      <TagsArticleCover :tag="tagName" :total="articles.length" />
      <TagsArticleContent
        :tag="tagName"
        :articles="articles"
        :loading="loading"
        :error="loadError"
        @retry="loadArticles"
      />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPostsByTag } from '@/api/posts'
import { publicPostToArticle } from '@/utils/article'
import type { Article } from '@/types/article'

const route = useRoute()

const articles = ref<Article[]>([])
const loading = ref(true)
const loadError = ref('')

// 快速切换标签时只认最后一次请求
let requestId = 0

// 当前标签名（路由参数已经自动解码）
const tagName = computed(() => {
  const value = route.params.tag
  return (Array.isArray(value) ? value[0] : value) ?? ''
})

async function loadArticles() {
  const tag = tagName.value.trim()
  const current = ++requestId

  if (!tag) {
    articles.value = []
    loading.value = false
    loadError.value = '没有找到这个标签'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const list = await fetchPostsByTag(tag)
    if (current !== requestId) return

    articles.value = list.map(publicPostToArticle)
  } catch (error) {
    if (current !== requestId) return

    console.error('[tagArticle] 加载标签文章失败', error)
    articles.value = []
    loadError.value = '文章加载失败了'
  } finally {
    if (current === requestId) loading.value = false
  }
}

// 进入页面或切换标签时重新加载
watch(tagName, loadArticles, { immediate: true })
</script>

<style scoped></style>
