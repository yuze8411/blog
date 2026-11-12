<template>
  <TopNavigation></TopNavigation>
  <ClassifyCover
    :category-name="activeCategory?.name ?? '文章分类'"
    :icon="activeIcon"
    :total="displayTotal"
  ></ClassifyCover>
  <ClassifyContent
    :title="activeCategory?.name ?? '文章分类'"
    :articles="articles"
    :categories="categories"
    :active-index="activeIndex"
    :total="displayTotal"
    :loading="loading"
    :error="loadError"
    @retry="retryLoad"
  ></ClassifyContent>
  <SiteFooter></SiteFooter>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchCategories, fetchPostsByCategory, type PublicCategory } from '@/api/posts'
import { publicPostToArticle } from '@/utils/article'
import type { Article } from '@/types/article'

const route = useRoute()

const categories = ref<PublicCategory[]>([])
const articles = ref<Article[]>([])
const loading = ref(true)
const loadError = ref('')

// 首次分类加载完成后才监听切换，避免和 loadPage 里的首次请求重复
const categoriesReady = ref(false)

// 分类和文章是两个请求，分别用 requestId 丢弃过期结果
let categoryRequestId = 0
let articleRequestId = 0

// 不同分类用不同图标；以后后台新增分类时走默认标签图标
const CATEGORY_ICONS: Record<string, string> = {
  dev: 'kaifazhe',
  life: 'shenghuo',
  talk: 'tucao',
  tech: 'keji1',
}

/** 地址栏里的 classify：新链接用 slug，旧链接的数字下标也继续兼容 */
const classifyQuery = computed(() => {
  const value = route.query.classify
  return (Array.isArray(value) ? value[0] : value) ?? ''
})

const activeIndex = computed(() => {
  if (!categories.value.length) return 0

  const raw = classifyQuery.value
  const bySlug = categories.value.findIndex((category) => category.slug === raw)
  if (bySlug >= 0) return bySlug

  // 旧地址 ?classify=0 这种数字形式
  const index = Number(raw)
  return Number.isInteger(index) && index >= 0 && index < categories.value.length ? index : 0
})

const activeCategory = computed(() => categories.value[activeIndex.value])
const activeIcon = computed(() => CATEGORY_ICONS[activeCategory.value?.slug ?? ''] ?? 'biaoqian1')

// 加载中标题还没回来时，先用文章数兜底
const displayTotal = computed(() => activeCategory.value?.post_count ?? articles.value.length)

async function loadArticles() {
  const category = activeCategory.value
  if (!category) {
    articles.value = []
    return
  }

  const current = ++articleRequestId
  loading.value = true
  loadError.value = ''

  try {
    const list = await fetchPostsByCategory(category.id)
    if (current !== articleRequestId) return

    articles.value = list.map(publicPostToArticle)
  } catch (error) {
    if (current !== articleRequestId) return

    console.error('[category] 加载分类文章失败', error)
    articles.value = []
    loadError.value = '文章加载失败了'
  } finally {
    if (current === articleRequestId) loading.value = false
  }
}

async function loadPage() {
  const current = ++categoryRequestId
  loading.value = true
  loadError.value = ''

  try {
    const list = await fetchCategories()
    if (current !== categoryRequestId) return

    categories.value = list

    if (!list.length) {
      articles.value = []
      loadError.value = '还没有配置文章分类'
      return
    }

    categoriesReady.value = true

    // 分类拿到后才知道当前选的是哪一个，再取对应文章
    await loadArticles()
  } catch (error) {
    if (current !== categoryRequestId) return

    console.error('[category] 加载分类失败', error)
    categories.value = []
    articles.value = []
    loadError.value = '分类加载失败了'
  } finally {
    if (current === categoryRequestId) loading.value = false
  }
}

function retryLoad() {
  if (!categories.value.length) {
    void loadPage()
    return
  }
  void loadArticles()
}

// 切换分类（包括浏览器前进后退）时重新取文章。
// 监听地址栏而不是 activeIndex：首次分类列表加载完 activeIndex 会变化，但文章已经由 loadPage 取过了。
watch(classifyQuery, () => {
  if (!categoriesReady.value) return
  void loadArticles()
})

onMounted(() => {
  void loadPage()
})
</script>

<style scoped></style>
