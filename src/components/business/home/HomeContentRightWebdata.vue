<template>
  <div
    class="relative mt-3 overflow-hidden rounded-[10px] border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:bg-gray-900/70 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-[16px] font-[huoxie] text-gray-800 dark:text-gray-100">站点数据</span>
        <!-- 刷新成功后的轻提示，停留两秒自动消失 -->
        <Transition name="stat-fade">
          <span v-if="justUpdated" class="stat-updated">已更新</span>
        </Transition>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="text-[10px] tracking-[0.22em] text-gray-400 dark:text-gray-500">SITE DATA</span>
        <!-- 手动刷新：重新拉一次统计数据 -->
        <button
          type="button"
          class="stat-refresh"
          :class="{ 'is-loading': loading }"
          :disabled="loading"
          :title="loading ? '刷新中…' : '刷新站点数据'"
          :aria-label="loading ? '正在刷新站点数据' : '刷新站点数据'"
          :aria-busy="loading"
          @click="loadStats"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <dl class="mt-3 border-t border-gray-100 dark:border-gray-700/60" :aria-busy="loading && !loaded">
      <div
        v-for="item in statRows"
        :key="item.label"
        class="flex items-center justify-between gap-3 border-b border-gray-100 py-[14px] transition-colors duration-200 last:border-b-0 hover:bg-sky-50/60 dark:border-gray-700/60 dark:hover:bg-sky-400/5"
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
          <!-- 首次加载显示和卡片同色系的占位条，数字回来后再替换 -->
          <span v-if="loading && !loaded" class="stat-skeleton" aria-hidden="true"></span>
          <template v-else-if="loaded">
            <span class="tabular-nums">{{ item.value }}</span>
            <span v-if="item.unit" class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ item.unit }}
            </span>
          </template>
          <!-- 首次加载失败：不要显示一排 0，用 -- 更诚实 -->
          <span v-else class="tabular-nums">--</span>
        </dd>
      </div>
    </dl>

    <!-- 首次加载失败 / 刷新失败都走这里，点击可以重试 -->
    <div v-if="loadError" class="stat-error" role="status">
      <span>{{ loadError }}</span>
      <button type="button" @click="loadStats">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { supabase } from '@/api/supabase'
import { siteLaunchDate } from '@/data/articles'

interface SiteStatsRow {
  article_count: number | null
  tag_count: number | null
  category_count: number | null
  word_count: number | null
  view_count: number | null
  comment_count: number | null
  last_updated_at: string | null
}

/** 需要做数字滚动动画的字段 */
interface StatNumbers {
  article_count: number
  tag_count: number
  category_count: number
  word_count: number
  view_count: number
  comment_count: number
}

const stats = ref<SiteStatsRow | null>(null)

// 页面展示的是这份数值，刷新时从旧值平滑滚到新值
const display = reactive<StatNumbers>({
  article_count: 0,
  tag_count: 0,
  category_count: 0,
  word_count: 0,
  view_count: 0,
  comment_count: 0,
})

const loading = ref(true)
const loaded = ref(false)
const loadError = ref('')
const justUpdated = ref(false)

// 防止刷新按钮连点导致多个请求同时跑
let fetching = false
let numberRaf = 0
let flashTimer: ReturnType<typeof setTimeout> | undefined

const numberFormat = new Intl.NumberFormat('zh-CN')

function formatNumber(value: number | null | undefined) {
  return numberFormat.format(value ?? 0)
}

/** 最后更新时间显示成“11月11日 21:08” */
function formatUpdatedAt(value: string | null) {
  if (!value) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 站点从上线日期开始算运行天数，当天也算一天 */
const runningDays = computed(() => {
  const start = new Date(`${siteLaunchDate}T00:00:00`).getTime()
  const days = Math.floor((Date.now() - start) / 86_400_000) + 1
  return Math.max(1, days)
})

const statRows = computed(() => [
  {
    label: '文章数',
    value: formatNumber(display.article_count),
    unit: '篇',
    icon: 'xiangzi',
  },
  {
    label: '分类数',
    value: formatNumber(display.category_count),
    unit: '个',
    icon: 'fenlei1',
  },
  {
    label: '标签数',
    value: formatNumber(display.tag_count),
    unit: '个',
    icon: 'biaoqian1',
  },
  {
    label: '总字数',
    value: formatNumber(display.word_count),
    unit: '字',
    icon: 'chengguozishu',
  },
  {
    label: '访问量',
    value: formatNumber(display.view_count),
    unit: '次',
    icon: 'eye',
  },
  {
    label: '评论数',
    value: formatNumber(display.comment_count),
    unit: '条',
    icon: 'pinglun',
  },
  {
    label: '运行时长',
    value: formatNumber(runningDays.value),
    unit: '天',
    icon: 'rili',
  },
  {
    label: '最后更新时间',
    value: formatUpdatedAt(stats.value?.last_updated_at ?? null),
    unit: '',
    icon: 'shijian',
  },
])

/** 数字滚动：首次从 0 开始，刷新时从当前值滚到新值 */
function animateNumbers(target: StatNumbers) {
  cancelAnimationFrame(numberRaf)

  const from = { ...display }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    Object.assign(display, target)
    return
  }

  const duration = 560
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    // ease-out cubic：开头快、结尾稳，数字不会匀速跳得生硬
    const eased = 1 - Math.pow(1 - progress, 3)

    for (const key of Object.keys(target) as (keyof StatNumbers)[]) {
      display[key] = Math.round(from[key] + (target[key] - from[key]) * eased)
    }

    if (progress < 1) numberRaf = requestAnimationFrame(tick)
  }

  numberRaf = requestAnimationFrame(tick)
}

/** 刷新成功后的“已更新”提示 */
function flashUpdated() {
  justUpdated.value = true
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    justUpdated.value = false
  }, 2000)
}

async function loadStats() {
  if (fetching) return
  fetching = true
  loading.value = true
  loadError.value = ''

  const isRefresh = loaded.value

  try {
    // 统计字段现在都在 site_stats 视图里，一次请求就够
    const { data, error } = await supabase
      .from('site_stats')
      .select(
        'article_count, tag_count, category_count, word_count, view_count, comment_count, last_updated_at',
      )
      .single()

    if (error) throw error

    const row = data as SiteStatsRow
    stats.value = row
    loaded.value = true

    animateNumbers({
      article_count: row.article_count ?? 0,
      tag_count: row.tag_count ?? 0,
      category_count: row.category_count ?? 0,
      word_count: row.word_count ?? 0,
      view_count: row.view_count ?? 0,
      comment_count: row.comment_count ?? 0,
    })

    if (isRefresh) flashUpdated()
  } catch (error) {
    console.error('[home] 站点数据加载失败', error)
    loadError.value = isRefresh ? '刷新失败，请稍后重试' : '站点数据加载失败'
  } finally {
    fetching = false
    loading.value = false
  }
}

onUnmounted(() => {
  cancelAnimationFrame(numberRaf)
  clearTimeout(flashTimer)
})

// 组件首次挂载时加载，不需要额外监听滚动或路由
void loadStats()
</script>

<style scoped>
.stat-refresh {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 999px;
  color: #94a3b8;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.stat-refresh svg {
  width: 14px;
  height: 14px;
}

.stat-refresh:hover:not(:disabled) {
  background: rgba(83, 157, 253, 0.08);
  color: #539dfd;
}

.stat-refresh:disabled {
  cursor: default;
}

.stat-refresh.is-loading svg {
  animation: stat-spin 0.8s linear infinite;
}

@keyframes stat-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 刷新成功的小徽标 */
.stat-updated {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0284c7;
  font-size: 10px;
  line-height: 1.4;
}

:global(html.dark .stat-updated) {
  background: rgba(2, 132, 199, 0.18);
  color: #7dd3fc;
}

.stat-fade-enter-active,
.stat-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.stat-fade-enter-from,
.stat-fade-leave-to {
  opacity: 0;
  transform: translateY(2px);
}

/* 数值占位条：浅色页面用浅灰，暗色模式自动换深灰 */
.stat-skeleton {
  display: inline-block;
  width: 46px;
  height: 16px;
  border-radius: 6px;
  background: #edf1f6;
  animation: stat-pulse 1.5s ease-in-out infinite;
}

@keyframes stat-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

.stat-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  font-size: 11px;
  color: #b45309;
}

.stat-error button {
  flex-shrink: 0;
  color: #2f6fbf;
  font-size: 11px;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.stat-error button:hover {
  color: #539dfd;
}

:global(html.dark .stat-skeleton) {
  background: rgba(148, 163, 184, 0.18);
}

:global(html.dark .stat-error) {
  color: #fbbf24;
}

:global(html.dark .stat-error button) {
  color: #8ecbff;
}
</style>
