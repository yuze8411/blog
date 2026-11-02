<template>
  <section
    class="group/card relative flex h-full max-h-[540px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-colors duration-500 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-400/25 sm:p-6 lg:max-h-none"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="inline-flex items-center gap-2 font-[huoxie] text-[11px] tracking-[0.3em] text-violet-600/80 dark:text-violet-300/70">
          <span class="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/80" />
          MONTHLY LOG
        </p>
        <h2 class="mt-2 font-[huoxie] text-[24px] tracking-[0.04em] text-slate-800 dark:text-white">
          月度归档
        </h2>
        <p class="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
          近 12 个月共 {{ totalArticles }} 篇，点开月份看标题
        </p>
      </div>

      <!-- 一键回到最新月份，不用在列表里往下找 -->
      <button
        type="button"
        class="mt-1 shrink-0 rounded-full border border-violet-100 bg-violet-50/60 px-3.5 py-1.5 text-[11.5px] text-violet-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-violet-300 dark:hover:border-violet-400/25 dark:hover:bg-white/[0.08]"
        @click="goLatest"
      >
        最新月份
      </button>
    </div>

    <div ref="scrollerRef" class="stats-month-scroll relative mt-4 min-h-0 flex-1 overflow-y-auto pr-1.5">
      <div class="space-y-2">
        <div
          v-for="group in groups"
          :key="group.month"
          :data-month="group.month"
          class="overflow-hidden rounded-[15px] border transition-all duration-300"
          :class="rowClass(group.month)"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300/60"
            :aria-expanded="isOpen(group.month)"
            @click="toggle(group.month)"
          >
            <!-- 月份左侧的小圆点：打开时填满，收起时只留一圈 -->
            <span
              class="relative grid h-3 w-3 shrink-0 place-items-center rounded-full border transition-all duration-300"
              :class="
                isOpen(group.month) || isHovered(group.month)
                  ? 'border-violet-400 bg-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.14)]'
                  : 'border-slate-200 bg-white dark:border-white/20 dark:bg-transparent'
              "
            >
              <span
                class="h-1 w-1 rounded-full transition-colors duration-300"
                :class="isOpen(group.month) || isHovered(group.month) ? 'bg-white' : 'bg-slate-300 dark:bg-white/30'"
              />
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex items-baseline justify-between gap-3">
                <span
                  class="font-[huoxie] text-[15px] tracking-[0.03em] transition-colors duration-300"
                  :class="
                    isOpen(group.month) || isHovered(group.month)
                      ? 'text-violet-700 dark:text-violet-200'
                      : 'text-slate-600 dark:text-slate-300'
                  "
                >
                  {{ group.label }}
                </span>
                <span class="shrink-0 text-[11.5px] tabular-nums text-slate-400 dark:text-slate-500">
                  {{ group.articles.length }} 篇
                </span>
              </span>

              <!-- 一条很细的相对产量条：一眼看出哪个月写得最多 -->
              <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <span
                  class="block h-full rounded-full bg-gradient-to-r from-violet-300 to-violet-500 transition-[width] duration-700 ease-out dark:from-violet-500 dark:to-violet-400"
                  :style="{ width: `${barWidth(group.articles.length)}%` }"
                />
              </span>
            </span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-slate-500"
              :class="isOpen(group.month) ? 'rotate-180 text-violet-500 dark:text-violet-300' : ''"
            >
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- 用 grid-template-rows 从 0fr 到 1fr 展开，高度过渡才平滑 -->
          <div
            class="grid transition-[grid-template-rows] duration-[400ms] ease-out"
            :class="isOpen(group.month) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            :aria-hidden="!isOpen(group.month)"
          >
            <div class="overflow-hidden">
              <ul class="space-y-0.5 pb-3 pr-4 pl-9">
                <li
                  v-for="(title, index) in group.articles"
                  :key="title"
                  class="group/item flex items-start gap-2 rounded-lg px-2 py-1 text-[13.5px] leading-[1.7] text-slate-500 transition-colors duration-200 hover:bg-white/80 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-violet-200"
                >
                  <span class="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-violet-300/80 transition-transform duration-300 group-hover/item:scale-150 dark:bg-violet-400/60" />
                  <span class="line-clamp-1">{{ title }}</span>
                  <span class="ml-auto hidden shrink-0 font-[huoxie] text-[10px] text-slate-300 group-hover/item:inline dark:text-slate-600">
                    {{ String(index + 1).padStart(2, '0') }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11.5px] text-slate-400 dark:border-white/[0.06] dark:text-slate-500">
      <span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
      悬停折线图，对应月份会同步亮起
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { MonthlyArticles } from '@/data/stats'

const props = withDefaults(
  defineProps<{
    groups: MonthlyArticles[]
    /** 当前展开的月份，由父组件统一管理，折线图点击时也会改它 */
    activeMonth: string
    /** 折线图上正悬停的月份，用来在列表里做同步高亮 */
    hoveredMonth?: string | null
  }>(),
  { hoveredMonth: null },
)

const emit = defineEmits<{
  'update:activeMonth': [month: string]
}>()

const scrollerRef = ref<HTMLDivElement | null>(null)

const totalArticles = computed(() =>
  props.groups.reduce((total, group) => total + group.articles.length, 0),
)

const maxCount = computed(() =>
  Math.max(1, ...props.groups.map((group) => group.articles.length)),
)

/** 最短也留 12%，不然只有两三篇的月份几乎看不见 */
function barWidth(count: number) {
  return Math.max(12, Math.round((count / maxCount.value) * 100))
}

function isOpen(month: string) {
  return props.activeMonth === month
}

function isHovered(month: string) {
  return props.hoveredMonth === month
}

function rowClass(month: string) {
  if (isOpen(month)) {
    return 'border-violet-200/90 bg-gradient-to-r from-violet-50/80 to-white shadow-[0_10px_26px_-24px_rgba(124,58,237,0.4)] dark:border-violet-400/25 dark:from-violet-400/[0.08] dark:to-transparent'
  }
  if (isHovered(month)) {
    return 'border-violet-200/70 bg-violet-50/50 dark:border-violet-400/20 dark:bg-violet-400/[0.05]'
  }
  return 'border-transparent bg-transparent hover:border-slate-200/80 hover:bg-slate-50/60 dark:hover:border-white/10 dark:hover:bg-white/[0.03]'
}

function toggle(month: string) {
  emit('update:activeMonth', props.activeMonth === month ? '' : month)
}

function goLatest() {
  const latest = props.groups[0]?.month
  if (latest) emit('update:activeMonth', latest)
}

/**
 * 折线图点了某个月份后，父组件会更新 activeMonth。
 * 这里负责把对应行滚进视野——注意只滚卡片内部，不带着整页跳。
 */
watch(
  () => props.activeMonth,
  async (month) => {
    if (!month) return
    await nextTick()

    const scroller = scrollerRef.value
    const target = scroller?.querySelector<HTMLElement>(`[data-month="${month}"]`)
    if (!scroller || !target) return

    const targetTop = target.offsetTop
    const visibleTop = scroller.scrollTop
    const visibleBottom = visibleTop + scroller.clientHeight

    if (targetTop < visibleTop || targetTop + target.offsetHeight > visibleBottom) {
      scroller.scrollTo({
        top: Math.max(0, targetTop - 12),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }
  },
)
</script>

<style scoped>
.stats-month-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.32) transparent;
}

.stats-month-scroll::-webkit-scrollbar {
  width: 5px;
}

.stats-month-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.stats-month-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.26);
}

.stats-month-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.42);
}
</style>
