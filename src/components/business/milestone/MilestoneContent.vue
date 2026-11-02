<template>
  <div class="relative">
    <!-- ========== 开场：把“里程碑”三个字放在最中间 ========== -->
    <header class="relative mx-auto flex max-w-[1180px] flex-col items-center px-6 pb-14 pt-24 text-center sm:pt-28">
      <!-- 背后淡淡的大字，只作为纹理存在，不抢标题 -->
      <span
        class="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 whitespace-nowrap font-[huoxie] text-[110px] tracking-[0.18em] text-amber-100/[0.035] sm:text-[160px]"
        aria-hidden="true"
      >
        MILESTONE
      </span>

      <p
        class="hero-rise relative inline-flex items-center gap-3 font-[huoxie] text-[10px] tracking-[0.42em] text-amber-200/55"
      >
        <span class="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/70" />
        THE ROAD SO FAR
        <span class="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/70" />
      </p>

      <h1
        class="hero-rise relative mt-6 font-[huoxie] text-[54px] leading-none tracking-[0.16em] text-amber-50 sm:text-[78px]"
        style="animation-delay: 90ms"
      >
        里程碑
      </h1>

      <p
        class="hero-rise relative mt-6 max-w-xl text-[13px] leading-7 text-slate-400 sm:text-sm sm:leading-8"
        style="animation-delay: 160ms"
      >
        文字落在时间里，就有了重量。<br class="hidden sm:block" />
        这里收着我一路写下的节点，沿着金色的光线往前走，就是下一页。
      </p>

      <p
        class="hero-rise relative mt-5 font-[huoxie] text-[10px] tracking-[0.26em] text-amber-200/40"
        style="animation-delay: 210ms"
      >
        {{ yearRange }} · 一条还在延伸的路
      </p>

      <!-- 三个小统计：文章数、跨过的年份、写过的标签 -->
      <div
        class="hero-rise relative mt-10 flex items-stretch"
        style="animation-delay: 270ms"
      >
        <template v-for="(stat, index) in stats" :key="stat.label">
          <div class="px-7 text-center sm:px-11">
            <p class="font-[huoxie] text-[30px] leading-none tracking-[0.04em] text-amber-300">
              {{ stat.value }}
            </p>
            <p class="mt-2.5 font-[huoxie] text-[9px] tracking-[0.3em] text-slate-500">
              {{ stat.label }}
            </p>
          </div>
          <span
            v-if="index < stats.length - 1"
            class="h-9 w-px self-center bg-amber-100/10"
          />
        </template>
      </div>

      <!-- 向下的小提示，把视线交给下面的时光轴 -->
      <div class="hero-rise relative mt-12 flex flex-col items-center gap-3" style="animation-delay: 340ms">
        <span class="font-[huoxie] text-[9px] tracking-[0.32em] text-slate-500">
          向下 · 走进时光
        </span>
        <span class="relative h-12 w-px overflow-hidden bg-gradient-to-b from-amber-500/45 to-transparent">
          <span class="scroll-dot absolute left-1/2 top-0 h-2 w-1 -translate-x-1/2 rounded-full bg-amber-500" />
        </span>
      </div>
    </header>

    <!-- 一条很细的装饰线，把开场和时间轴分开 -->
    <div
      class="hero-rise mx-auto flex w-[86%] max-w-[1200px] items-center gap-4"
      style="animation-delay: 400ms"
    >
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-amber-100/10 to-amber-100/15" />
      <span class="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-amber-600/50" />
      <span class="h-px flex-1 bg-gradient-to-l from-transparent via-amber-100/10 to-amber-100/15" />
    </div>

    <!-- ========== 横向时光轴 ========== -->
    <section class="relative mx-auto w-[92%] max-w-[1500px] pb-8 pt-12 sm:pt-14">
      <MilestoneTimeline :articles="articles" />
    </section>

    <!-- ========== 收尾：路还没有走完 ========== -->
    <footer v-reveal class="relative mx-auto max-w-[920px] px-6 pb-24 pt-10 text-center">
      <div class="flex items-center justify-center gap-4">
        <span class="h-px w-14 bg-gradient-to-r from-transparent to-amber-600/45 sm:w-20" />
        <span class="font-[huoxie] text-[18px] tracking-[0.22em] text-amber-200">
          未完待续
        </span>
        <span class="h-px w-14 bg-gradient-to-l from-transparent to-amber-600/45 sm:w-20" />
      </div>

      <p class="mt-4 text-[13px] leading-6 text-slate-400">
        下一篇文章，会落在时间的哪一格？
      </p>

      <RouterLink
        to="/"
        class="group mt-8 inline-flex items-center gap-2 rounded-full border border-amber-100/10 bg-slate-900/50 px-5 py-2.5 font-[huoxie] text-[12px] tracking-[0.1em] text-amber-200 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900/80"
      >
        回到首页
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M5 12h14m-5-5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </RouterLink>

      <p class="mt-14 font-[huoxie] text-[10px] tracking-[0.35em] text-slate-600">
        雨落千山 · {{ yearRange }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import MilestoneTimeline from './MilestoneTimeline.vue'
import { vReveal } from '@/directives/reveal'
import type { MilestoneArticle } from '@/types'

const props = defineProps<{
  articles: MilestoneArticle[]
}>()

const yearRange = computed(() => {
  const first = props.articles[0]?.date.slice(0, 4) ?? ''
  const last = props.articles[props.articles.length - 1]?.date.slice(0, 4) ?? ''
  if (!first) return '——'
  return first === last ? first : `${first} — ${last}`
})

const stats = computed(() => {
  const years = props.articles.map((article) => Number(article.date.slice(0, 4)))
  const span = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0
  const tags = new Set(props.articles.flatMap((article) => article.tags)).size

  return [
    { value: String(props.articles.length).padStart(2, '0'), label: '篇文章' },
    { value: String(span).padStart(2, '0'), label: '年光阴' },
    { value: String(tags).padStart(2, '0'), label: '枚标签' },
  ]
})
</script>

<style scoped>
/* 开场元素依次升起，像把幕布一点点拉开 */
.hero-rise {
  opacity: 0;
  animation: hero-rise 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 向下提示里那颗慢慢坠落的小光点 */
.scroll-dot {
  animation: scroll-dot 2.4s ease-in-out infinite;
}

@keyframes scroll-dot {
  0% {
    top: 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    top: 42px;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise,
  .scroll-dot {
    animation: none;
  }

  .hero-rise {
    opacity: 1;
  }
}
</style>
