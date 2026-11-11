<template>
  <!--
    时间筛选：年份 + 月份两级下拉，并支持「全部时间」。
    - 年份选「全部时间」：不限制时间，月份下拉自动禁用
    - 年份选具体年份：月份可选该年份范围内的月份
      · 2024 年只提供 9 ~ 12 月（最早的数据从 2024.9.1 开始）
      · 当前年份只提供到当前月份
  -->
  <div class="flex shrink-0 items-center gap-1.5">
    <!-- 一级：年份 / 全部时间 -->
    <div
      class="group relative flex h-[38px] w-[100px] items-center rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-slate-300 focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(186,230,253,0.45)] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:focus-within:border-sky-500/70 dark:focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.18)]"
    >
      <select
        v-model.number="selectedYear"
        class="admin-select-native h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent pl-3 pr-7 text-[13px] text-slate-600 focus:outline-none dark:text-slate-300"
        aria-label="选择年份或全部时间"
      >
        <option :value="null">全部时间</option>
        <option v-for="year of years" :key="year" :value="year">{{ year }} 年</option>
      </select>

      <svg
        class="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-focus-within:rotate-180 dark:text-slate-500"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6.5 8 10l4-3.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 二级：月份；全部时间时禁用，并显示「全部月份」 -->
    <div
      class="group relative flex h-[38px] w-[100px] items-center rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,opacity,background-color] duration-200 hover:border-slate-300 focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(186,230,253,0.45)] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:focus-within:border-sky-500/70 dark:focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.18)]"
      :class="selectedYear === null ? 'pointer-events-none opacity-60' : ''"
    >
      <select
        v-model.number="selectedMonth"
        class="admin-select-native h-full w-full appearance-none rounded-xl bg-transparent pl-3 pr-7 text-[13px] text-slate-600 focus:outline-none dark:text-slate-300"
        :class="
          selectedYear === null
            ? 'cursor-not-allowed text-slate-400 dark:text-slate-600'
            : 'cursor-pointer'
        "
        :disabled="selectedYear === null"
        aria-label="选择月份"
      >
        <option v-if="selectedYear === null" :value="null">全部月份</option>
        <option v-for="month of months" :key="month" :value="month">{{ month }} 月</option>
      </select>

      <svg
        class="pointer-events-none absolute right-2.5 h-3.5 w-3.5 transition-transform duration-200 group-focus-within:rotate-180"
        :class="
          selectedYear === null
            ? 'text-slate-300 dark:text-slate-700'
            : 'text-slate-400 dark:text-slate-500'
        "
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6.5 8 10l4-3.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/** 博客最早的数据从 2024 年 9 月开始 */
const EARLIEST_YEAR = 2024
const EARLIEST_MONTH = 9

// 以用户本地时间的当前年月作为可选范围的上限
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

/** 年份倒序排列：当前年份在最上面，越往下越早 */
const years = Array.from(
  { length: currentYear - EARLIEST_YEAR + 1 },
  (_, index) => currentYear - index,
)

// null 表示「全部时间 / 全部月份」，具体值表示筛选某一个年月
const selectedYear = ref<number | null>(null)
const selectedMonth = ref<number | null>(null)

/** 某一年允许选择的月份区间：2024 从 9 月开始，当前年份只到当前月 */
function getMonthRange(year: number) {
  return {
    min: year === EARLIEST_YEAR ? EARLIEST_MONTH : 1,
    max: year === currentYear ? currentMonth : 12,
  }
}

/** 二级月份：跟着一级年份实时变化；全部时间时不提供月份选项 */
const months = computed(() => {
  const year = selectedYear.value
  if (year === null) return []

  const { min, max } = getMonthRange(year)
  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
})

/**
 * 切换年份后：
 * - 切到「全部时间」：月份一并清空
 * - 切到具体年份：月份如果不在新范围内，自动收敛到最近的合法月份
 *   （例如从 6 月切到 2024 年 → 变成 9 月）
 */
watch(selectedYear, (year) => {
  if (year === null) {
    selectedMonth.value = null
    return
  }

  const { min, max } = getMonthRange(year)
  const month = selectedMonth.value
  if (month === null || month < min) selectedMonth.value = min
  else if (month > max) selectedMonth.value = max
})

/**
 * 把选中的年月抛给父组件，后续接列表查询时直接用：
 * - { year: null, month: null } → 查全部时间
 * - { year: 2025, month: 3 }    → 查 2025 年 3 月
 */
const emit = defineEmits<{
  change: [value: { year: number | null; month: number | null }]
}>()

watch([selectedYear, selectedMonth], ([year, month]) => {
  emit('change', { year, month })
})
</script>

<style scoped>
/* 让下拉选项的颜色和整个后台的深灰文字保持一致 */
.admin-select-native option {
  background-color: #fff;
  color: #334155;
}

/* 黑夜模式下原生下拉列表也跟着变深 */
:global(html.dark) .admin-select-native option {
  background-color: #1e293b;
  color: #e2e8f0;
}
</style>
