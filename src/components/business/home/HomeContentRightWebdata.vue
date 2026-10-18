<template>
  <div
    class="relative min-h-[300px] border border-gray-200/80 rounded-[10px] mt-3 p-5 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
  >
    <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <img
        src="@/assets/images/demoTextImages/demo4.jpg"
        alt=""
        class="w-full h-full object-cover scale-105 blur-[1.5px] opacity-50 dark:opacity-35"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white/88 dark:from-gray-950/55 dark:via-gray-950/75 dark:to-gray-950/90"
      ></div>
    </div>

    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <span class="text-[16px] font-[huoxie] text-gray-800 dark:text-gray-100">站点数据</span>
        <span class="text-[12px] text-gray-500 dark:text-gray-400"
          >更新于 {{ lastUpdateText }}</span
        >
      </div>

      <div class="mt-5 grid grid-cols-2 gap-y-5">
        <div class="text-center">
          <p class="text-[28px] leading-none font-[huoxie] text-gray-900 dark:text-gray-50">
            {{ formatNumber(siteStats.viewCount) }}
          </p>
          <p class="mt-1 text-[13px] text-gray-500 dark:text-gray-400">访问量</p>
        </div>
        <div class="text-center">
          <p class="text-[28px] leading-none font-[huoxie] text-gray-900 dark:text-gray-50">
            {{ formatNumber(siteStats.articleCount) }}
          </p>
          <p class="mt-1 text-[13px] text-gray-500 dark:text-gray-400">文章数量</p>
        </div>
        <div class="text-center">
          <p class="text-[28px] leading-none font-[huoxie] text-gray-900 dark:text-gray-50">
            {{ formatNumber(siteStats.tagCount) }}
          </p>
          <p class="mt-1 text-[13px] text-gray-500 dark:text-gray-400">标签数量</p>
        </div>
        <div class="text-center">
          <p class="text-[28px] leading-none font-[huoxie] text-gray-900 dark:text-gray-50">
            {{ formatNumber(siteStats.commentCount) }}
          </p>
          <p class="mt-1 text-[13px] text-gray-500 dark:text-gray-400">评论数</p>
        </div>
      </div>

      <div class="mt-5 h-[1px] bg-gray-300/80 dark:bg-gray-600/70"></div>

      <!-- 标签 -->
      <div class="mt-3">
        <p class="text-[12px] text-gray-500 dark:text-gray-400">标签</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="tag in siteTags"
            :key="tag"
            class="px-2 py-[2px] rounded-[6px] border border-gray-200/80 bg-white/60 text-[12px] font-[huoxie] text-gray-600 dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <p class="mt-4 text-center text-[12px] font-[huoxie] text-gray-500 dark:text-gray-400">
        本站已运行 {{ runningDays }} 天
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { siteLaunchDate, siteStats, siteTags } from '@/data/articles'

const numberFormat = new Intl.NumberFormat('zh-CN')

function formatNumber(value: number): string {
  return numberFormat.format(value)
}

const lastUpdateText = (() => {
  if (!siteStats.lastUpdatedAt) return '--'
  const date = new Date(siteStats.lastUpdatedAt)
  return `${date.getMonth() + 1}月${date.getDate()}日`
})()

const runningDays = (() => {
  const start = new Date(`${siteLaunchDate}T00:00:00`).getTime()
  const days = Math.floor((Date.now() - start) / 86_400_000) + 1
  return Math.max(1, days)
})()
</script>

<style scoped></style>
