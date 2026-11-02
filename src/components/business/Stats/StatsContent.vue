<template>
  <div class="relative mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 lg:px-10">
    <!-- ========== 顶部标题：收小一点，把注意力留给下面的数据 ========== -->
    <header class="relative pb-6 pt-24 text-center sm:pt-28">
      <div class="relative">
        <p
          class="stats-rise inline-flex items-center gap-3 font-[huoxie] text-[11px] tracking-[0.38em] text-sky-600/75 dark:text-sky-300/70"
        >
          <span class="h-px w-6 bg-gradient-to-r from-transparent to-sky-400/70 sm:w-9" />
          SITE INSIGHTS
          <span class="h-px w-6 bg-gradient-to-l from-transparent to-sky-400/70 sm:w-9" />
        </p>

        <h1
          class="stats-rise mt-3 font-[huoxie] text-[34px] leading-[1.14] tracking-[0.05em] text-slate-800 dark:text-white sm:text-[44px]"
          style="animation-delay: 90ms"
        >
          数据<span class="text-sky-600 dark:text-sky-400">统计</span>
        </h1>

        <div
          class="stats-rise mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 text-[11.5px] text-slate-400 shadow-[0_10px_28px_-26px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500"
          style="animation-delay: 230ms"
        >
          <span class="relative flex h-1.5 w-1.5">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
            />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          数据更新于 {{ updatedLabel }}
        </div>
      </div>
    </header>

    <!-- ========== 四个核心数字 ========== -->
    <section aria-label="站点核心数据" class="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
      <div v-for="(metric, index) in metrics" :key="metric.label" v-reveal="index * 80">
        <StatsMetricCard v-bind="metric" />
      </div>
    </section>

    <!-- ========== 分类玫瑰图 + 标签墙 ========== -->
    <div class="mt-5 grid gap-5 lg:h-[600px] lg:grid-cols-[1.02fr_0.98fr]">
      <section
        v-reveal
        class="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-colors duration-500 hover:border-blue-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-400/25 sm:p-6"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p
              class="inline-flex items-center gap-2 font-[huoxie] text-[11px] tracking-[0.3em] text-blue-600/80 dark:text-blue-300/70"
            >
              <span class="h-px w-5 bg-gradient-to-r from-transparent to-blue-400/80" />
              CATEGORY SHARE
            </p>
            <h2
              class="mt-2 font-[huoxie] text-[24px] tracking-[0.04em] text-slate-800 dark:text-white"
            >
              分类占比
            </h2>
            <p class="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
              扇区的半径，就是文章的数量
            </p>
          </div>

          <span
            class="mt-1 shrink-0 rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-1.5 font-[huoxie] text-[11px] tracking-[0.06em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            {{ categoryTotal }} 篇
          </span>
        </div>

        <div class="relative mt-2 h-[300px] sm:h-[320px]">
          <StatsChart
            class="cursor-pointer"
            :option="categoryChartOption"
            aria-label="四个分类的文章数量玫瑰图，扇区越大表示文章越多"
            @hover="handleCategoryHover"
            @select="openCategory"
          />

          <!-- 圆环中间的数字：默认显示总数，悬停扇区时切换成该分类的占比 -->
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span class="absolute h-24 w-24 rounded-full bg-slate-200/20 blur-xl dark:bg-white/5" />
            <div class="relative text-center">
              <p
                class="font-[huoxie] text-[10.5px] tracking-[0.16em] text-slate-400 dark:text-slate-500"
              >
                {{ focusLabel }}
              </p>
              <p
                class="mt-1 font-[huoxie] text-[34px] leading-none tracking-[0.01em] text-slate-800 dark:text-white sm:text-[38px]"
              >
                {{ focusValue }}
                <span class="text-[12px] font-normal text-slate-500 dark:text-slate-400">
                  {{ focusCategory ? '%' : '篇' }}
                </span>
              </p>
              <p class="mt-1.5 text-[10.5px] text-slate-400 dark:text-slate-500">
                {{ focusHint }}
              </p>
            </div>
          </div>
        </div>

        <!-- 自定义图例：颜色、名称、数量、占比都在这里，不必只靠扇区认颜色 -->
        <div class="mt-2 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          <RouterLink
            v-for="item in categoryPalette"
            :key="item.name"
            :to="{ name: 'category', query: categoryQuery(item.name) }"
            class="group flex items-center gap-2 rounded-[12px] border px-3 py-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
            :class="
              activeCategory === item.name
                ? 'border-slate-300/80 bg-slate-50 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.4)] dark:border-white/20 dark:bg-white/[0.08]'
                : 'border-transparent bg-slate-50/60 hover:border-slate-200 hover:bg-slate-50 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.05]'
            "
            @mouseenter="activeCategory = item.name"
            @mouseleave="activeCategory = null"
            @focus="activeCategory = item.name"
            @blur="activeCategory = null"
          >
            <span
              class="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-125 dark:ring-[#0d1424]"
              :style="{ background: item.color }"
            />
            <span
              class="min-w-0 flex-1 truncate font-[huoxie] text-[12.5px] tracking-[0.03em] text-slate-600 dark:text-slate-300"
            >
              {{ item.name }}
            </span>
            <span
              class="shrink-0 font-[huoxie] text-[12px] tabular-nums text-slate-500 dark:text-slate-400"
            >
              {{ item.value }}
            </span>
            <span class="shrink-0 text-[10.5px] tabular-nums text-slate-400 dark:text-slate-500">
              {{ item.percent }}%
            </span>
          </RouterLink>
        </div>

        <p
          class="mt-auto flex items-center gap-1.5 pt-3 text-[11.5px] text-slate-400 dark:text-slate-500"
        >
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-blue-400/70" />
          悬停扇区看占比 · 点击进入对应分类
        </p>
      </section>

      <div v-reveal="80" class="h-full min-h-0">
        <StatsTagWall class="h-full" />
      </div>
    </div>

    <!-- ========== 发布趋势 + 月度归档 ========== -->
    <div class="mt-5 grid gap-5 lg:h-[520px] lg:grid-cols-[1.28fr_0.72fr]">
      <section
        v-reveal
        class="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-colors duration-500 hover:border-amber-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-amber-400/20 sm:p-6"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="inline-flex items-center gap-2 font-[huoxie] text-[11px] tracking-[0.3em] text-amber-600/80 dark:text-amber-300/70"
            >
              <span class="h-px w-5 bg-gradient-to-r from-transparent to-amber-400/80" />
              PUBLISHING RHYTHM
            </p>
            <h2
              class="mt-2 font-[huoxie] text-[24px] tracking-[0.04em] text-slate-800 dark:text-white"
            >
              发布节奏
            </h2>
            <p class="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
              近 12 个月，每个月写下多少篇
            </p>
          </div>

          <!-- 鼠标在折线上移动时，这块小胶囊会实时显示对应月份 -->
          <div
            class="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-3.5 py-1.5 text-[11.5px] text-slate-500 transition-colors duration-300 dark:border-amber-400/15 dark:bg-amber-400/[0.06] dark:text-slate-400"
          >
            <span
              class="h-1.5 w-1.5 rounded-full bg-amber-500 transition-transform duration-300"
              :class="hoveredGroup ? 'scale-125 animate-pulse' : ''"
            />
            <span class="font-[huoxie] tracking-[0.05em]">
              {{ hoveredGroup ? hoveredGroup.label : '近 12 个月' }}
            </span>
            <span class="font-[huoxie] text-[13px] text-amber-700 dark:text-amber-300">
              {{ hoveredGroup ? hoveredGroup.articles.length : recentTotal }} 篇
            </span>
          </div>
        </div>

        <div class="relative mt-3 h-[270px] sm:h-[300px] lg:h-auto lg:min-h-[250px] lg:flex-1">
          <StatsChart
            class="cursor-crosshair"
            :option="trendChartOption"
            aria-label="近十二个月文章发布数量折线图"
            @hover="handleTrendHover"
            @select="openMonth"
          />
        </div>

        <div
          class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11.5px] text-slate-400 dark:border-white/[0.06] dark:text-slate-500"
        >
          <span class="inline-flex items-center gap-1.5">
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
            点击折线上的月份，月度归档会跟着展开
          </span>
          <span class="font-[huoxie] tracking-[0.05em]">
            月均 {{ averagePerMonth }} 篇 · 峰值 {{ peakMonth?.articles.length ?? 0 }} 篇
          </span>
        </div>
      </section>

      <div v-reveal="80" class="min-h-0 lg:h-full">
        <StatsMonthlyLog
          v-model:active-month="activeMonth"
          class="h-full"
          :groups="monthlyArticles"
          :hovered-month="hoveredMonth"
        />
      </div>
    </div>

    <!-- ========== 三条小结论 ========== -->
    <section
      v-reveal
      class="relative mt-5 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/75 px-5 py-5 shadow-[0_18px_44px_-40px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] sm:px-6"
    >
      <span
        class="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
      />
      <span
        class="pointer-events-none absolute -bottom-24 -left-10 h-44 w-44 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-500/[0.07]"
      />

      <div class="relative grid gap-5 sm:grid-cols-3">
        <div
          v-for="(item, index) in highlights"
          :key="item.label"
          class="flex items-center gap-3.5"
          :class="{
            'sm:border-l sm:border-slate-200/80 sm:pl-5 dark:sm:border-white/[0.06]': index > 0,
          }"
        >
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border bg-gradient-to-br shadow-[0_8px_20px_-18px_rgba(15,23,42,0.45)]"
            :class="item.chip"
          >
            <svg
              v-if="item.icon === 'peak'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              class="h-[18px] w-[18px]"
            >
              <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" stroke-linecap="round" />
              <path d="M3 19.5h18" stroke-linecap="round" />
            </svg>
            <svg
              v-else-if="item.icon === 'category'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              class="h-[18px] w-[18px]"
            >
              <path d="M12 3.8a8.2 8.2 0 1 0 8.2 8.2H12Z" stroke-linejoin="round" />
              <path d="M14.6 3.8A8.2 8.2 0 0 1 20.2 9.4h-5.6Z" stroke-linejoin="round" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              class="h-[18px] w-[18px]"
            >
              <path
                d="M4 10.2V5.4c0-.8.6-1.4 1.4-1.4h4.8c.4 0 .8.2 1 .4l8.1 8.1c.5.5.5 1.4 0 2l-4.8 4.8c-.5.5-1.4.5-2 0l-8.1-8.1a1.4 1.4 0 0 1-.4-1Z"
                stroke-linejoin="round"
              />
              <circle cx="8.4" cy="8.4" r="1.1" />
            </svg>
          </span>

          <div class="min-w-0">
            <p
              class="font-[huoxie] text-[10.5px] tracking-[0.16em] text-slate-400 dark:text-slate-500"
            >
              {{ item.label }}
            </p>
            <p
              class="mt-1 truncate font-[huoxie] text-[16px] tracking-[0.03em] text-slate-700 dark:text-slate-200"
            >
              {{ item.value }}
            </p>
            <p class="mt-0.5 text-[11.5px] text-slate-400 dark:text-slate-500">
              {{ item.detail }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <p class="mt-6 text-center text-[11.5px] leading-5 text-slate-400 dark:text-slate-500">
      统计口径：文章按发布时间归入月份；评论数包含回复与楼中楼。
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { graphic } from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'
import StatsChart from './StatsChart.vue'
import StatsMetricCard from './StatsMetricCard.vue'
import StatsMonthlyLog from './StatsMonthlyLog.vue'
import StatsTagWall from './StatsTagWall.vue'
import { categoryStats, monthlyArticles, statsOverview } from '@/data/stats'
import { tagWall } from '@/data/tags'
import { vReveal } from '@/directives/reveal'

const router = useRouter()

/* ---------------- 主题 ----------------
 * 全站主题由 TopNavigation 写 <html class="dark">，这里盯着根节点的 class 变化，
 * 让图表和卡片颜色跟着切换，而不是只切 Tailwind 的 dark: 类。
 */
const isDark = ref(false)
let themeObserver: MutationObserver | null = null

function syncTheme() {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null
})

/* ---------------- 顶部四个数字 ---------------- */
const DAY_MS = 86_400_000

const runningDays = computed(() => {
  const start = new Date(`${statsOverview.launchDate}T00:00:00`).getTime()
  const end = new Date(`${statsOverview.updatedAt}T00:00:00`).getTime()
  return Math.max(1, Math.floor((end - start) / DAY_MS) + 1)
})

const launchLabel = statsOverview.launchDate.split('-').join('.')
const updatedLabel = statsOverview.updatedAt.split('-').join('.')

interface MetricItem {
  label: string
  value: number
  unit: string
  hint: string
  icon: 'article' | 'tag' | 'comment' | 'clock'
  accent: 'blue' | 'teal' | 'violet' | 'amber'
  delay: number
}

const metrics = computed<MetricItem[]>(() => [
  {
    label: '文章总数',
    value: statsOverview.articleCount,
    unit: '篇',
    hint: '四个分类累计',
    icon: 'article',
    accent: 'blue',
    delay: 0,
  },
  {
    label: '标签总数',
    value: statsOverview.tagCount,
    unit: '个',
    hint: '覆盖全部写作主题',
    icon: 'tag',
    accent: 'teal',
    delay: 90,
  },
  {
    label: '评论总数',
    value: statsOverview.commentCount,
    unit: '条',
    hint: '含回复与楼中楼',
    icon: 'comment',
    accent: 'violet',
    delay: 180,
  },
  {
    label: '运行时间',
    value: runningDays.value,
    unit: '天',
    hint: `自 ${launchLabel} 起`,
    icon: 'clock',
    accent: 'amber',
    delay: 270,
  },
])

/* ---------------- 分类玫瑰图 ---------------- */
const categoryTotal = computed(() => categoryStats.reduce((total, item) => total + item.value, 0))

/**
 * 同一份数据同时喂给图表和图例，颜色不会对不上。
 * 四个分类各用蓝、橙、紫、青中的一个色相，扇区相邻顺序也按这个次序排，
 * 避免橙黄、蓝紫这类容易混的近邻色挨在一起；暗色模式另取一档亮度。
 */
const categoryPalette = computed(() =>
  categoryStats.map((item) => ({
    ...item,
    color: isDark.value ? item.darkColor : item.lightColor,
    percent: Math.round((item.value / categoryTotal.value) * 100),
  })),
)

const activeCategory = ref<string | null>(null)

const focusCategory = computed(
  () => categoryPalette.value.find((item) => item.name === activeCategory.value) ?? null,
)

/** 悬停分类时中间显示占比，没有悬停时显示总数 */
const focusLabel = computed(() => focusCategory.value?.name ?? '累计文章')
const focusValue = computed(() => focusCategory.value?.percent ?? categoryTotal.value)
const focusHint = computed(() =>
  focusCategory.value ? `${focusCategory.value.value} 篇` : '四个分类汇总',
)

/** 分类页用 query 里的下标切换分类，这里保持同一套映射 */
const CATEGORY_INDEX: Record<string, number> = {
  开发笔记: 0,
  生活记录: 1,
  我的吐槽: 2,
  科技产品: 3,
}

function categoryQuery(name: string) {
  const index = CATEGORY_INDEX[name]
  return index === undefined ? {} : { classify: String(index) }
}

function handleCategoryHover(name: string | null) {
  activeCategory.value = name
}

function openCategory(name: string) {
  const index = CATEGORY_INDEX[name]
  if (index === undefined) return
  router.push({ name: 'category', query: { classify: String(index) } })
}

const chartSurface = computed(() => (isDark.value ? '#0d1424' : '#ffffff'))
const axisLabelColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))

const tooltipStyle = computed(() => ({
  backgroundColor: isDark.value ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
  borderColor: isDark.value ? 'rgba(148,163,184,0.22)' : 'rgba(203,213,225,0.9)',
  borderWidth: 1,
  padding: [10, 14] as [number, number],
  textStyle: {
    color: isDark.value ? '#e2e8f0' : '#334155',
    fontSize: 13,
  },
  extraCssText:
    'box-shadow:0 16px 38px -18px rgba(15,23,42,0.35);border-radius:12px;backdrop-filter:blur(6px);',
}))

const categoryChartOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    confine: true,
    ...tooltipStyle.value,
    formatter: '{b}<br/>{c} 篇 · {d}%',
  },
  series: [
    {
      type: 'pie',
      radius: ['37%', '76%'],
      center: ['50%', '50%'],
      roseType: 'radius',
      startAngle: 92,
      minAngle: 8,
      itemStyle: {
        // 用卡片底色描边，扇区之间留出 3px 的“呼吸缝”
        borderColor: chartSurface.value,
        borderWidth: 3,
        borderRadius: 7,
      },
      label: { show: false },
      labelLine: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 24,
          shadowColor: isDark.value ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.18)',
        },
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDuration: 850,
      animationDelay: (index: number) => index * 90,
      data: categoryPalette.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color },
      })),
    },
  ],
}))

/* ---------------- 发布趋势 ---------------- */
/** 数据按“新 -> 旧”存，折线图需要“旧 -> 新”，这里翻一次就够 */
const chronologicalMonths = computed(() => [...monthlyArticles].reverse())

const recentTotal = computed(() =>
  monthlyArticles.reduce((total, group) => total + group.articles.length, 0),
)

const averagePerMonth = computed(() =>
  (recentTotal.value / Math.max(1, monthlyArticles.length)).toFixed(1),
)

const peakMonth = computed(() => {
  let best: (typeof monthlyArticles)[number] | null = null
  for (const group of monthlyArticles) {
    if (!best || group.articles.length > best.articles.length) best = group
  }
  return best
})

const activeMonth = ref(monthlyArticles[0]?.month ?? '')
const hoveredMonth = ref<string | null>(null)

const hoveredGroup = computed(
  () => monthlyArticles.find((group) => group.month === hoveredMonth.value) ?? null,
)

function handleTrendHover(name: string | null) {
  if (name === null) {
    hoveredMonth.value = null
    return
  }
  // mouseover 有时会把系列名（“发布文章”）也抛过来，这里只认真正的年月
  if (monthlyArticles.some((group) => group.month === name)) hoveredMonth.value = name
}

function openMonth(name: string) {
  // 最高的那个点带了一个 markPoint，点它时名字是“最高”，这里翻回对应的月份
  const month = name === '最高' ? peakMonth.value?.month : name
  if (!month || !monthlyArticles.some((group) => group.month === month)) return
  activeMonth.value = month
  hoveredMonth.value = null
}

const trendChartOption = computed<EChartsCoreOption>(() => {
  const groups = chronologicalMonths.value

  return {
    backgroundColor: 'transparent',
    grid: { left: 2, right: 18, top: 38, bottom: 2, containLabel: true },
    tooltip: {
      trigger: 'axis',
      confine: true,
      ...tooltipStyle.value,
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(56,189,248,0.45)', width: 1 },
      },
      formatter: (params: unknown) => {
        const list = Array.isArray(params)
          ? (params as { axisValue?: string; data?: number }[])
          : []
        const point = list[0]
        const group = monthlyArticles.find((item) => item.month === point?.axisValue)
        const value = typeof point?.data === 'number' ? point.data : 0
        const muted = isDark.value ? '#94a3b8' : '#64748b'

        return `<div style="font-size:11.5px;letter-spacing:0.05em;color:${muted}">${
          group?.label ?? point?.axisValue ?? ''
        }</div><div style="margin-top:4px;font-size:14px;font-weight:600">${value} 篇</div>`
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: groups.map((group) => group.month),
      axisLine: {
        lineStyle: { color: isDark.value ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.28)' },
      },
      axisTick: { show: false },
      axisLabel: {
        color: axisLabelColor.value,
        fontSize: 10.5,
        margin: 12,
        hideOverlap: true,
        formatter: (value: string) => {
          const [year = '', month = ''] = value.split('-')
          return `${year.slice(2)}/${month}`
        },
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisLabelColor.value, fontSize: 10.5, margin: 8 },
      splitLine: {
        lineStyle: {
          color: isDark.value ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.16)',
          width: 1,
        },
      },
    },
    series: [
      {
        name: '发布文章',
        type: 'line',
        smooth: 0.38,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        /** 允许点击折线本身触发事件，而不是只能点中隐藏的小圆点 */
        triggerLineEvent: true,
        data: groups.map((group) => group.articles.length),
        lineStyle: {
          width: 2,
          color: isDark.value ? '#60a5fa' : '#2563eb',
          shadowBlur: 12,
          shadowColor: isDark.value ? 'rgba(96,165,250,0.32)' : 'rgba(37,99,235,0.22)',
          cap: 'round',
          join: 'round',
        },
        itemStyle: {
          color: isDark.value ? '#93c5fd' : '#2563eb',
          borderColor: chartSurface.value,
          borderWidth: 2,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: isDark.value ? 'rgba(96,165,250,0.22)' : 'rgba(37,99,235,0.18)',
            },
            { offset: 1, color: 'rgba(37,99,235,0)' },
          ]),
        },
        emphasis: {
          focus: 'series',
          scale: 1.2,
          itemStyle: {
            shadowBlur: 18,
            shadowColor: isDark.value ? 'rgba(147,197,253,0.5)' : 'rgba(37,99,235,0.45)',
          },
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 9,
          itemStyle: {
            color: isDark.value ? '#93c5fd' : '#1d4ed8',
            borderColor: chartSurface.value,
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'top',
            distance: 8,
            color: isDark.value ? '#bfdbfe' : '#1d4ed8',
            fontSize: 11,
            fontWeight: 600,
            formatter: '{c} 篇',
          },
          data: [{ type: 'max', name: '最高' }],
        },
        animationDuration: 1100,
        animationEasing: 'cubicOut',
      },
    ],
  }
})

/* ---------------- 底部三条小结论 ---------------- */
const highlights = computed(() => [
  {
    label: '最高产月份',
    value: peakMonth.value?.label ?? '——',
    detail: peakMonth.value
      ? `${peakMonth.value.articles.length} 篇 · 月均 ${averagePerMonth.value} 篇`
      : '暂无数据',
    icon: 'peak',
    chip: 'border-amber-100 from-amber-50 to-white text-amber-600 dark:border-amber-400/20 dark:from-amber-400/[0.12] dark:to-transparent dark:text-amber-300',
  },
  {
    label: '最常写的分类',
    value: categoryPalette.value[0]?.name ?? '——',
    detail: categoryPalette.value[0]
      ? `${categoryPalette.value[0].value} 篇 · 占 ${categoryPalette.value[0].percent}%`
      : '暂无数据',
    icon: 'category',
    chip: 'border-violet-100 from-violet-50 to-white text-violet-600 dark:border-violet-400/20 dark:from-violet-400/[0.12] dark:to-transparent dark:text-violet-300',
  },
  {
    label: '出现最多的标签',
    value: tagWall[0] ? `# ${tagWall[0].name}` : '——',
    detail: tagWall[0] ? `${tagWall[0].count} 次` : '暂无数据',
    icon: 'tag',
    chip: 'border-teal-100 from-teal-50 to-white text-teal-600 dark:border-teal-400/20 dark:from-teal-400/[0.12] dark:to-transparent dark:text-teal-300',
  },
])
</script>

<style scoped>
/* 顶部文字按顺序浮上来 */
.stats-rise {
  animation: stats-rise 0.75s cubic-bezier(0.22, 0.8, 0.3, 1) both;
}

@keyframes stats-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-rise {
    animation: none;
  }
}
</style>
