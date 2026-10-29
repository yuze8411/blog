<template>
  <section class="mx-auto w-full max-w-[1150px] px-4 pb-24 pt-10 sm:px-6 lg:px-10">
    <header
      class="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-gray-800"
    >
      <div>
        <p class="font-[huoxie] text-[12px] tracking-[0.3em] text-sky-500/90 dark:text-sky-400/90">
          ARTICLES
        </p>
        <h2 class="mt-1 font-[huoxie] text-[26px] leading-tight text-gray-900 dark:text-gray-100">
          与 #{{ tag }} 有关的文章
        </h2>
      </div>
      <p class="font-[huoxie] text-[14px] text-gray-400 dark:text-gray-500">
        共 {{ sortedArticles.length }} 篇 · 按时间倒序
      </p>
    </header>

    <template v-if="groups.length">
      <section v-for="group in groups" :key="group.key" class="mb-10 last:mb-0">
        <header class="mb-4 flex items-center gap-3">
          <span
            class="rounded-full bg-sky-50 px-3 py-1 font-[huoxie] text-[13px] leading-none text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
          >
            {{ group.year }} 年
          </span>
          <span class="font-[huoxie] text-[20px] leading-none text-gray-700 dark:text-gray-300">
            {{ group.month }} 月
          </span>
          <span class="font-[huoxie] text-[12px] text-gray-400 dark:text-gray-500">
            {{ group.articles.length }} 篇
          </span>
          <span
            class="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-gray-800"
          ></span>
        </header>

        <div class="space-y-4">
          <div
            v-for="(article, i) in group.articles"
            :key="article.textId"
            v-reveal="Math.min(i, 8) * 70"
          >
            <TagsArticleRow :article="article" :tag="tag" />
          </div>
        </div>
      </section>
    </template>

    <!-- 没有匹配到标签 -->
    <div v-else class="py-24 text-center">
      <p class="font-[huoxie] text-[22px] text-gray-500 dark:text-gray-400">
        没有找到这个标签下的文章
      </p>
      <RouterLink
        to="/tags"
        class="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/85 px-6 py-2.5 font-[huoxie] text-[15px] text-[#2f4a77] transition-all duration-300 hover:border-sky-300 hover:text-sky-500 dark:border-gray-700 dark:bg-gray-900/85 dark:text-gray-200 dark:hover:border-sky-500/60 dark:hover:text-sky-300"
      >
        ← 回到标签墙
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '@/types/article'
import { vReveal } from '@/directives/reveal'

interface MonthGroup {
  key: string
  year: string
  month: string
  articles: Article[]
}

const props = defineProps<{
  tag: string
  articles: Article[]
}>()

// 时间从近到远
const sortedArticles = computed(() =>
  [...props.articles].sort((a, b) => b.time.localeCompare(a.time)),
)

// 按年月分组，时间相同的月份放在一起
const groups = computed<MonthGroup[]>(() => {
  const result: MonthGroup[] = []

  sortedArticles.value.forEach((article) => {
    const date = article.time.split(' ')[0] ?? ''
    const [year = '', month = ''] = date.split('-')
    const key = `${year}-${month}`
    const last = result[result.length - 1]

    if (last?.key === key) {
      last.articles.push(article)
    } else {
      result.push({ key, year, month, articles: [article] })
    }
  })

  return result
})
</script>

<style scoped></style>
