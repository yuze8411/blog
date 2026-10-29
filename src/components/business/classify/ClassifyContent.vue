<template>
  <div ref="rootRef" class="w-full scroll-mt-20 bg-[rgb(250,250,250)] pb-16 pt-8 dark:bg-gray-950">
    <div class="mx-auto w-full px-4 lg:w-[1000px] xl:w-[1150px]">
      <!-- 分类概览 -->
      <header
        class="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200/80 pb-4 dark:border-gray-800"
      >
        <div>
          <p class="font-[huoxie] text-[13px] tracking-[4px] text-sky-500/90 dark:text-sky-400/90">
            CATEGORY
          </p>
          <h1 class="mt-1 font-[huoxie] text-[30px] leading-tight text-gray-900 dark:text-gray-100">
            {{ title }}
          </h1>
        </div>
        <p class="font-[huoxie] text-[15px] text-gray-400 dark:text-gray-500">
          共 {{ articles.length }} 篇<span v-if="hasMore">
            · 已展示 {{ visibleArticles.length }} 篇</span
          >
        </p>
      </header>

      <!-- 分类切换：只保留四个真实分类，不做「全部」 -->
      <nav class="mb-8 flex flex-wrap items-center gap-2.5" aria-label="文章分类">
        <RouterLink
          v-for="(category, index) in categories"
          :key="category"
          :to="{ path: '/category', query: { classify: String(index) } }"
          class="rounded-full border px-4 py-2 font-[huoxie] text-[14px] transition-all duration-300 sm:px-5 sm:text-[15px]"
          :class="
            index === activeIndex
              ? 'border-transparent bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white shadow-[0_10px_24px_-14px_rgba(37,99,235,0.7)]'
              : 'border-gray-200/90 bg-white/70 text-gray-500 hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-500 dark:border-gray-700/80 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:border-sky-500/50 dark:hover:text-sky-300'
          "
          :aria-current="index === activeIndex ? 'page' : undefined"
        >
          {{ category }}
        </RouterLink>
      </nav>

      <template v-if="groups.length">
        <!-- 按年月分组，时间从近到远 -->
        <section
          v-for="group in groups"
          :key="group.key"
          class="mb-10 last:mb-0"
          :data-month="group.key"
        >
          <header class="mb-2 flex items-center gap-3">
            <h2 class="font-[huoxie] text-[30px] leading-none text-gray-900 dark:text-gray-100">
              {{ group.year
              }}<span class="ml-1 text-[15px] text-gray-400 dark:text-gray-500">年</span>
            </h2>
            <span class="font-[huoxie] text-[22px] leading-none text-gray-700 dark:text-gray-300">
              {{ group.month
              }}<span class="ml-0.5 text-[14px] text-gray-400 dark:text-gray-500">月</span>
            </span>
            <span class="self-end pb-1 font-[huoxie] text-[13px] text-gray-400 dark:text-gray-500">
              {{ group.articles.length }} 篇
            </span>
            <span
              class="mt-2 h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800"
            ></span>
          </header>

          <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div
              v-for="(article, i) in group.articles"
              :key="article.textId"
              :data-text-id="article.textId"
              v-reveal="Math.min(i, 6) * 80"
              class="min-w-0"
            >
              <ClassifyArticleCard :article="article" />
            </div>
          </div>
        </section>

        <!-- 不翻页，触底前点一次加载 15 篇 -->
        <div class="mt-10 flex flex-col items-center gap-4">
          <button
            v-if="hasMore"
            type="button"
            data-more
            class="group inline-flex items-center gap-3 rounded-full border border-sky-200/80 bg-white/85 px-8 py-3 font-[huoxie] text-[16px] text-[#2f4a77] shadow-[0_12px_30px_-20px_rgba(37,99,235,0.5)] backdrop-blur transition-all duration-300 hover:border-sky-300 hover:text-sky-500 hover:shadow-[0_18px_38px_-20px_rgba(37,99,235,0.55)] active:translate-y-0 dark:border-gray-700 dark:bg-gray-900/85 dark:text-gray-200 dark:hover:border-sky-500/60 dark:hover:text-sky-300"
            @click="loadMore"
          >
            <span>加载更多</span>
            <span
              class="text-[13px] text-gray-400 transition-colors group-hover:text-sky-400 dark:text-gray-500"
            >
              还有 {{ remaining }} 篇
            </span>
            <span
              aria-hidden="true"
              class="text-[15px] leading-none transition-transform duration-300 group-hover:translate-y-0.5"
            >
              ↓
            </span>
          </button>

          <p v-else class="font-[huoxie] text-[15px] text-gray-400 dark:text-gray-500">
            —— 已经看到这个分类的全部文章了 ——
          </p>
        </div>
      </template>

      <!-- 空分类 -->
      <div v-else class="py-24 text-center">
        <p class="font-[huoxie] text-[22px] text-gray-500 dark:text-gray-400">这个分类还没有文章</p>
        <p class="mt-2 font-[huoxie] text-[15px] text-gray-400 dark:text-gray-600">
          等山上的风把文字吹来，再来看看吧。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Article } from '@/types/article'
import { vReveal } from '@/directives/reveal'
// 先按时间排序sortedArticles -》 在按pageSize展示计算前pageSize个可见文章visibleArticles -》 然后构建分组好的文章groups

const props = withDefaults(
  defineProps<{
    title?: string
    articles: Article[]
    /** 分类名称，用于页面内的切换按钮 */
    categories?: string[]
    /** 当前分类下标 */
    activeIndex?: number
    /** 每次展示 / 加载的篇数 */
    pageSize?: number
  }>(),
  {
    title: '',
    categories: () => [],
    activeIndex: 0,
    pageSize: 15,
  },
)

const rootRef = ref<HTMLElement | null>(null)

/** 一个月份分组 */
interface MonthGroup {
  key: string
  year: string
  month: string
  articles: Article[]
}

const visibleCount = ref(props.pageSize)

// 时间格式固定为 YYYY-MM-DD HH:mm，直接按字符串倒序即可
const sortedArticles = computed(() =>
  [...props.articles].sort((a, b) => b.time.localeCompare(a.time)),
)

const visibleArticles = computed(() => sortedArticles.value.slice(0, visibleCount.value))

// 可见文章按年月切块；列表已排序，所以同一个月的文章一定相邻
const groups = computed<MonthGroup[]>(() => {
  const result: MonthGroup[] = []

  visibleArticles.value.forEach((article) => {
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

const remaining = computed(() => Math.max(0, sortedArticles.value.length - visibleCount.value))
const hasMore = computed(() => remaining.value > 0)

function loadMore() {
  visibleCount.value += props.pageSize
}

// 切换分类后重新从 15 篇开始，并回到内容区顶部（不退回大封面）
watch(
  () => props.articles,
  () => {
    visibleCount.value = props.pageSize
    rootRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  },
)
</script>

<style scoped></style>
