<template>
  <div
    class="relative mt-3 overflow-hidden rounded-[10px] border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:bg-gray-900/70 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
  >
    <div class="flex items-center justify-between">
      <span class="text-[16px] font-[huoxie] text-gray-800 dark:text-gray-100">站点数据</span>
      <span class="text-[10px] tracking-[0.22em] text-gray-400 dark:text-gray-500">SITE DATA</span>
    </div>

    <dl class="mt-3 border-t border-gray-100 dark:border-gray-700/60">
      <div
        v-for="item in statRows"
        :key="item.label"
        class="flex items-center justify-between gap-3 border-b border-gray-100 py-[14px] last:border-b-0 dark:border-gray-700/60"
      >
        <dt class="flex min-w-0 items-center gap-2.5 text-[13px] text-gray-500 dark:text-gray-400">
          <IconFont
            :name="item.icon"
            class="shrink-0 text-[15px] text-sky-500/80 dark:text-sky-300/70"
          ></IconFont>
          <span class="truncate">{{ item.label }}</span>
        </dt>

        <dd
          class="flex shrink-0 items-baseline gap-1 font-[huoxie] text-[18px] leading-none text-gray-900 dark:text-gray-50"
        >
          <span class="tabular-nums">{{ item.value }}</span>
          <span v-if="item.unit" class="text-[11px] text-gray-400 dark:text-gray-500">
            {{ item.unit }}
          </span>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { siteLaunchDate, siteStats } from '@/data/articles'

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

// 目前全部是假数据，后续接真实接口时只需要替换这个数组里的 value 即可
const statRows = [
  { label: '文章数', value: formatNumber(siteStats.articleCount), unit: '篇', icon: 'xiangzi' },
  { label: '分类数', value: '4', unit: '个', icon: 'fenlei1' },
  { label: '标签数', value: formatNumber(siteStats.tagCount), unit: '个', icon: 'biaoqian1' },
  { label: '总字数', value: '128,600', unit: '字', icon: 'chengguozishu' },
  { label: '访问量', value: formatNumber(siteStats.viewCount), unit: '次', icon: 'eye' },
  { label: '评论数', value: formatNumber(siteStats.commentCount), unit: '条', icon: 'pinglun' },
  { label: '运行时长', value: String(runningDays), unit: '天', icon: 'rili' },
  { label: '最后更新时间', value: lastUpdateText, unit: '', icon: 'shijian' },
]
</script>

<style scoped></style>
