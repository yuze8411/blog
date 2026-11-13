<template>
  <div class="relative">
    <!-- ========== 开场：把“里程碑”三个字放在最中间 ========== -->
    <header
      class="relative mx-auto flex max-w-[1180px] flex-col items-center px-6 pb-14 pt-24 text-center sm:pt-28"
    >
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
      <div class="hero-rise relative mt-10 flex items-stretch" style="animation-delay: 270ms">
        <template v-for="(stat, index) in stats" :key="stat.label">
          <div class="px-7 text-center sm:px-11">
            <p class="font-[huoxie] text-[30px] leading-none tracking-[0.04em] text-amber-300">
              {{ stat.value }}
            </p>
            <p class="mt-2.5 font-[huoxie] text-[9px] tracking-[0.3em] text-slate-500">
              {{ stat.label }}
            </p>
          </div>
          <span v-if="index < stats.length - 1" class="h-9 w-px self-center bg-amber-100/10" />
        </template>
      </div>

      <!-- 向下的小提示，把视线交给下面的时光轴 -->
      <div
        class="hero-rise relative mt-12 flex flex-col items-center gap-3"
        style="animation-delay: 340ms"
      >
        <span class="font-[huoxie] text-[9px] tracking-[0.32em] text-slate-500">
          向下 · 走进时光
        </span>
        <span
          class="relative h-12 w-px overflow-hidden bg-gradient-to-b from-amber-500/45 to-transparent"
        >
          <span
            class="scroll-dot absolute left-1/2 top-0 h-2 w-1 -translate-x-1/2 rounded-full bg-amber-500"
          />
        </span>
      </div>
    </header>

    <!-- 一条很细的装饰线，把开场和时间轴分开 -->
    <div
      class="hero-rise mx-auto flex w-[86%] max-w-[1200px] items-center gap-4"
      style="animation-delay: 400ms"
    >
      <span
        class="h-px flex-1 bg-gradient-to-r from-transparent via-amber-100/10 to-amber-100/15"
      />
      <span class="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-amber-600/50" />
      <span
        class="h-px flex-1 bg-gradient-to-l from-transparent via-amber-100/10 to-amber-100/15"
      />
    </div>

    <!-- ========== 横向时光轴 ========== -->
    <section class="relative mx-auto w-[92%] max-w-[1500px] pb-8 pt-12 sm:pt-14">
      <!-- 加载中：保住时间轴的位置，避免内容突然跳进来 -->
      <div v-if="loading" class="milestone-state" role="status" aria-live="polite">
        <span class="state-orbit" aria-hidden="true">
          <span class="state-orbit-ring" />
          <span class="state-orbit-core" />
        </span>
        <p class="state-kicker">LOADING THE TIMELINE</p>
        <h2 class="state-title">正在拾起时间里的文章…</h2>
        <p class="state-desc">等金色光线亮起来，就能沿着它慢慢往前走了。</p>
      </div>

      <!-- 加载失败：把原因说清楚，并给一个重试入口 -->
      <div v-else-if="error" class="milestone-state" role="alert">
        <span class="state-icon is-error" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M12 8.5v4.2" stroke-linecap="round" />
            <path d="M12 16.2h.01" stroke-linecap="round" stroke-width="2.2" />
            <path
              d="M10.3 4.6 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="state-kicker">TIMELINE OFFLINE</p>
        <h2 class="state-title">时光线暂时断了</h2>
        <p class="state-desc">{{ error }}</p>
        <button type="button" class="state-action" @click="emit('retry')">
          重新连接
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke-linecap="round" />
            <path d="M20 4v5h-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 后台还没有往时光轴里放文章 -->
      <div v-else-if="!articles.length" class="milestone-state">
        <span class="state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="m12 3 2.2 6.8H21l-5.4 4.1 2 6.6-5.6-4-5.6 4 2-6.6L3 9.8h6.8L12 3Z"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="state-kicker">THE ROAD IS QUIET</p>
        <h2 class="state-title">时光轴还空着</h2>
        <p class="state-desc">等第一篇文章被放进时光轴，这里就会亮起第一颗星。</p>
        <RouterLink to="/" class="state-action">
          回首页逛逛
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M5 12h14m-5-5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </RouterLink>
      </div>

      <MilestoneTimeline v-else :articles="articles" />
    </section>

    <!-- ========== 收尾：路还没有走完 ========== -->
    <footer v-reveal class="relative mx-auto max-w-[920px] px-6 pb-24 pt-10 text-center">
      <div class="flex items-center justify-center gap-4">
        <span class="h-px w-14 bg-gradient-to-r from-transparent to-amber-600/45 sm:w-20" />
        <span class="font-[huoxie] text-[18px] tracking-[0.22em] text-amber-200"> 未完待续 </span>
        <span class="h-px w-14 bg-gradient-to-l from-transparent to-amber-600/45 sm:w-20" />
      </div>

      <p class="mt-4 text-[13px] leading-6 text-slate-400">下一篇文章，会落在时间的哪一格？</p>

      <RouterLink
        to="/"
        class="group mt-8 inline-flex items-center gap-2 rounded-full border border-amber-100/10 bg-slate-900/50 px-5 py-2.5 font-[huoxie] text-[12px] tracking-[0.1em] text-amber-200 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900/80"
      >
        回到首页
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
        >
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

const props = withDefaults(
  defineProps<{
    articles: MilestoneArticle[]
    loading?: boolean
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

const yearRange = computed(() => {
  const first = props.articles[0]?.date.slice(0, 4) ?? ''
  const last = props.articles[props.articles.length - 1]?.date.slice(0, 4) ?? ''
  if (!first) return '——'
  return first === last ? first : `${first} — ${last}`
})

const stats = computed(() => {
  // 加载中或加载失败时还没有可信的数字，用短横线占位，避免闪一下全 0
  if (!props.articles.length && (props.loading || props.error)) {
    return [
      { value: '——', label: '篇文章' },
      { value: '——', label: '年光阴' },
      { value: '——', label: '枚标签' },
    ]
  }

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

/* ==================== 加载 / 失败 / 空状态 ==================== */
.milestone-state {
  position: relative;
  display: flex;
  min-height: 420px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(245, 185, 66, 0.08);
  border-radius: 26px;
  padding: 58px 24px;
  background:
    linear-gradient(180deg, rgba(17, 24, 39, 0.46), rgba(8, 11, 18, 0.12)),
    radial-gradient(circle at 50% 120%, rgba(245, 185, 66, 0.06), transparent 62%);
  text-align: center;
}

/* 状态面板背后的一团暖光，和整页的金色光晕接上 */
.milestone-state::before {
  position: absolute;
  top: -46%;
  left: 50%;
  width: 460px;
  height: 460px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(245, 185, 66, 0.1), transparent 68%);
  content: '';
  pointer-events: none;
  transform: translateX(-50%);
}

.state-orbit {
  position: relative;
  display: grid;
  height: 64px;
  width: 64px;
  place-items: center;
}

.state-orbit::before {
  position: absolute;
  inset: 8px;
  border-radius: 999px;
  background: rgba(245, 185, 66, 0.12);
  content: '';
  filter: blur(10px);
  animation: state-glow 2.4s ease-in-out infinite;
}

.state-orbit-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(245, 185, 66, 0.16);
  border-top-color: rgba(245, 185, 66, 0.85);
  border-radius: 999px;
  animation: state-spin 1.15s linear infinite;
}

.state-orbit-core {
  height: 12px;
  width: 12px;
  background: linear-gradient(135deg, #fde68a, #d97706);
  box-shadow: 0 0 14px rgba(245, 185, 66, 0.8);
  transform: rotate(45deg);
  animation: state-core 2.4s ease-in-out infinite;
}

.state-icon {
  display: grid;
  height: 62px;
  width: 62px;
  place-items: center;
  border: 1px solid rgba(245, 185, 66, 0.16);
  border-radius: 999px;
  background: rgba(245, 185, 66, 0.06);
  color: rgba(253, 230, 138, 0.86);
  box-shadow: inset 0 0 22px rgba(245, 185, 66, 0.05);
}

.state-icon svg {
  height: 26px;
  width: 26px;
}

.state-icon.is-error {
  border-color: rgba(251, 113, 133, 0.22);
  background: rgba(251, 113, 133, 0.07);
  color: rgba(253, 164, 175, 0.9);
  box-shadow: inset 0 0 22px rgba(251, 113, 133, 0.06);
}

.state-kicker {
  position: relative;
  margin-top: 22px;
  font-family: 'huoxie', serif;
  font-size: 9px;
  letter-spacing: 0.34em;
  color: rgba(253, 230, 138, 0.45);
}

.state-title {
  position: relative;
  margin-top: 10px;
  font-family: 'huoxie', serif;
  font-size: 22px;
  letter-spacing: 0.16em;
  color: #fef3c7;
}

.state-desc {
  position: relative;
  margin-top: 12px;
  max-width: 460px;
  font-size: 13px;
  line-height: 1.9;
  color: #94a3b8;
}

.state-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  border: 1px solid rgba(245, 185, 66, 0.2);
  border-radius: 999px;
  padding: 9px 18px;
  background: rgba(245, 185, 66, 0.06);
  font-family: 'huoxie', serif;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgba(253, 230, 138, 0.84);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease;
}

.state-action svg {
  height: 13px;
  width: 13px;
  transition: transform 0.25s ease;
}

.state-action:hover {
  border-color: rgba(245, 185, 66, 0.38);
  background: rgba(245, 185, 66, 0.1);
  color: #fef3c7;
  transform: translateY(-1px);
}

.state-action:hover svg {
  transform: translateX(2px);
}

.state-action:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #080b12,
    0 0 0 4px rgba(245, 185, 66, 0.35);
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes state-core {
  0%,
  100% {
    opacity: 0.55;
    box-shadow: 0 0 10px rgba(245, 185, 66, 0.55);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 18px rgba(245, 185, 66, 0.9);
  }
}

@keyframes state-glow {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise,
  .scroll-dot,
  .state-orbit::before,
  .state-orbit-ring,
  .state-orbit-core {
    animation: none;
  }

  .hero-rise {
    opacity: 1;
  }

  .state-action {
    transition: none;
  }

  .state-action:hover {
    transform: none;
  }
}
</style>
