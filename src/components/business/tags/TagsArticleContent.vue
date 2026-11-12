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
        <template v-if="loading">正在加载文章…</template>
        <template v-else-if="error">加载失败</template>
        <template v-else>共 {{ sortedArticles.length }} 篇 · 按时间倒序</template>
      </p>
    </header>

    <!-- 加载中：和真实行同样结构的骨架 -->
    <div v-if="loading" class="space-y-4" aria-busy="true" aria-label="标签文章加载中">
      <div v-for="n in 4" :key="n" class="row-skeleton">
        <div class="row-skeleton-cover"></div>
        <div class="row-skeleton-body">
          <div class="skeleton-line w-1/4"></div>
          <div class="skeleton-line is-title mt-4 w-3/5"></div>
          <div class="skeleton-line mt-3 w-11/12"></div>
          <div class="skeleton-line mt-6 w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="content-state">
      <p class="content-state-title">{{ error }}</p>
      <p class="content-state-desc">网络恢复后可以再试一次，文章不会丢的。</p>
      <button type="button" class="content-state-btn" @click="emit('retry')">重新加载</button>
    </div>

    <template v-else-if="groups.length">
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
            <TagsArticleRow :article="article" :tag="tag" @open="openArticle(article)" />
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
import { useRouter } from 'vue-router'
import type { Article } from '@/types/article'
import { vReveal } from '@/directives/reveal'

interface MonthGroup {
  key: string
  year: string
  month: string
  articles: Article[]
}

const props = withDefaults(
  defineProps<{
    tag: string
    articles: Article[]
    /** 是否正在加载 */
    loading?: boolean
    /** 加载失败文案，为空表示没有错误 */
    error?: string
  }>(),
  {
    loading: false,
    error: '',
  },
)

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()

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

/** 行点击 → 文章详情页，优先用 slug */
function openArticle(article: Article) {
  void router.push({
    name: 'articleDetail',
    query: article.slug ? { slug: article.slug } : { id: article.textId },
  })
}
</script>

<style scoped>
/* ---------- 骨架屏 ---------- */
.row-skeleton {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e9eef5;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.row-skeleton-cover {
  flex-shrink: 0;
  width: 200px;
  height: 132px;
  border-radius: 12px;
  background: linear-gradient(110deg, #eef2f7 8%, #fafcff 18%, #eef2f7 33%);
  background-size: 220% 100%;
  animation: tags-shimmer 1.6s linear infinite;
}

.row-skeleton-body {
  flex: 1;
  min-width: 0;
  padding: 8px 4px;
}

.skeleton-line {
  height: 13px;
  border-radius: 999px;
  background: #edf1f6;
  animation: tags-pulse 1.5s ease-in-out infinite;
}

.skeleton-line.is-title {
  height: 22px;
}

@keyframes tags-shimmer {
  from {
    background-position: 120% 0;
  }

  to {
    background-position: -120% 0;
  }
}

@keyframes tags-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@media (max-width: 639px) {
  .row-skeleton-cover {
    width: 104px;
    height: 88px;
  }
}

/* ---------- 加载失败 ---------- */
.content-state {
  padding: 72px 24px;
  border: 1px solid #e9eef5;
  border-radius: 1rem;
  background: #fff;
  text-align: center;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.content-state-title {
  font-family: 'huoxie', sans-serif;
  font-size: 22px;
  color: #334155;
  letter-spacing: 1px;
}

.content-state-desc {
  margin-top: 10px;
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  color: #94a3b8;
}

.content-state-btn {
  margin-top: 22px;
  padding: 9px 26px;
  border: 1px solid rgba(83, 157, 253, 0.45);
  border-radius: 999px;
  background: #f0f7ff;
  color: #2f6fbf;
  font-family: 'huoxie', sans-serif;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.content-state-btn:hover {
  border-color: rgba(83, 157, 253, 0.75);
  background: #e3f1ff;
}

/* ---------- 暗色模式 ---------- */
:global(html.dark .row-skeleton) {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.62);
  box-shadow: none;
}

:global(html.dark .row-skeleton-cover) {
  background: linear-gradient(
    110deg,
    rgba(148, 163, 184, 0.14) 8%,
    rgba(148, 163, 184, 0.24) 18%,
    rgba(148, 163, 184, 0.14) 33%
  );
  background-size: 220% 100%;
}

:global(html.dark .skeleton-line) {
  background: rgba(148, 163, 184, 0.18);
}

:global(html.dark .content-state) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.55);
  box-shadow: none;
}

:global(html.dark .content-state-title) {
  color: #e2e8f0;
}

:global(html.dark .content-state-desc) {
  color: #94a3b8;
}

:global(html.dark .content-state-btn) {
  border-color: rgba(83, 157, 253, 0.45);
  background: rgba(83, 157, 253, 0.12);
  color: #8ecbff;
}

:global(html.dark .content-state-btn:hover) {
  border-color: rgba(83, 157, 253, 0.75);
  background: rgba(83, 157, 253, 0.2);
}
</style>
