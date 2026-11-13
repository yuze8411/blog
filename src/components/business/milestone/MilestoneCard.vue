<template>
  <RouterLink
    :to="{
      name: 'articleDetail',
      query: article.slug ? { slug: article.slug } : { id: article.id },
    }"
    class="milestone-card group relative flex gap-3 overflow-hidden rounded-[20px] border border-amber-100/10 bg-[#111827]/80 p-3 shadow-[0_22px_50px_-34px_rgba(0,0,0,0.95)] backdrop-blur-md transition-all duration-500 hover:border-amber-300/25 hover:bg-[#151d30]/90 hover:shadow-[0_28px_58px_-30px_rgba(245,185,66,0.22)] sm:gap-3.5 sm:p-3.5"
    :class="side === 'up' ? 'hover:-translate-y-1' : 'hover:translate-y-1'"
    :aria-label="`阅读文章：${article.title}`"
    draggable="false"
  >
    <!-- 左边一张接近方形的封面，和右侧文字差不多高，不再是窄窄的一条 -->
    <div
      class="relative min-h-[112px] w-[120px] shrink-0 self-stretch overflow-hidden rounded-[14px] bg-slate-800 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-amber-100/10 sm:min-h-[124px] sm:w-[128px]"
    >
      <img
        :src="article.cover"
        :alt="article.title"
        loading="lazy"
        draggable="false"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <span class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-white/10" />
      <span
        class="absolute left-2 top-2 rounded-full border border-white/10 bg-black/35 px-1.5 py-0.5 font-[huoxie] text-[8px] tracking-[0.14em] text-amber-50 backdrop-blur-sm"
      >
        MEMO
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- 日期 + 阅读时间：卡片里的小字信息 -->
      <div
        class="flex items-center justify-between gap-2 font-[huoxie] text-[10px] tracking-[0.1em] text-amber-200/55"
      >
        <span>{{ monthDay }}</span>
        <span class="inline-flex items-center gap-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="h-3 w-3"
          >
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ article.readTime }}
        </span>
      </div>

      <h3
        class="mt-1.5 line-clamp-2 font-[huoxie] text-[15.5px] leading-[1.4] text-slate-100 transition-colors duration-300 group-hover:text-amber-200"
      >
        {{ article.title }}
      </h3>

      <p class="mt-1 line-clamp-2 text-[11.5px] leading-[1.65] text-slate-400">
        {{ article.excerpt }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-2 pt-2">
        <div class="flex min-w-0 flex-wrap gap-1">
          <span
            v-for="tag in article.tags.slice(0, 2)"
            :key="tag"
            class="max-w-[70px] truncate rounded-full border border-amber-200/10 bg-amber-200/[0.06] px-1.5 py-0.5 font-[huoxie] text-[9px] tracking-[0.04em] text-amber-200/65"
          >
            # {{ tag }}
          </span>
        </div>

        <!-- 小箭头：告诉用户这张卡片是可以点进文章的 -->
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-amber-200/15 bg-slate-800 text-amber-200 transition-all duration-300 group-hover:border-amber-300/40 group-hover:bg-amber-400 group-hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-3 w-3"
          >
            <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 悬停时从卡片底部点亮一条金色细线 -->
    <span
      class="pointer-events-none absolute inset-x-4 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent transition-transform duration-500 group-hover:scale-x-100"
    />
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { MilestoneArticle } from '@/types'

const props = defineProps<{
  article: MilestoneArticle
  /** up：卡片在时光线上方；down：卡片在时光线下方 */
  side: 'up' | 'down'
}>()

/** 时间线节点上已经显示年份，卡片里只保留“月.日”，信息不重复 */
const monthDay = computed(() => {
  const [, month = '', day = ''] = props.article.date.split('-')
  return `${month}.${day}`
})
</script>
