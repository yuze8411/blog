<template>
  <section class="relative mx-auto w-full max-w-[1240px] px-4 pb-16 sm:px-6 lg:px-8">
    <MessageWallHeader :total="allTotal" :loading="loading" :loaded="loaded" />

    <!-- ========== 墙上留言 ========== -->
    <section class="mt-7">
      <div class="wall-filterbar">
        <div class="min-w-0">
          <p class="font-[huoxie] text-[10px] tracking-[0.3em] text-zinc-600 dark:text-zinc-300/80">
            WALL NOTES
          </p>
          <p class="mt-1 font-[huoxie] text-[13px] text-zinc-500 dark:text-zinc-400">
            <template v-if="loading && !loaded">正在把留言搬上墙…</template>
            <template v-else>{{ filterSummary }}</template>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- 筛选：全部 / 博主 / 访客 -->
          <div class="wall-filter-segment" role="group" aria-label="筛选留言">
            <button
              v-for="item in FILTERS"
              :key="item.value"
              type="button"
              class="wall-filter-btn"
              :class="{ 'is-active': filter === item.value }"
              :aria-pressed="filter === item.value"
              @click="setFilter(item.value)"
            >
              <span class="wall-filter-dot" :class="`is-${item.value}`" aria-hidden="true"></span>
              {{ item.label }}
            </button>
          </div>

          <button
            type="button"
            class="wall-refresh"
            :disabled="loading || loadingMore"
            :title="loading ? '正在刷新…' : '刷新留言墙'"
            :aria-label="loading ? '正在刷新留言墙' : '刷新留言墙'"
            @click="emit('refresh')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              :class="{ 'animate-spin': loading }"
              aria-hidden="true"
            >
              <path
                d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 首次加载：按瀑布流高度摆几张骨架卡片 -->
      <div
        v-if="loading && !loaded"
        class="wall-columns mt-5"
        aria-busy="true"
        aria-label="留言加载中"
      >
        <div
          v-for="(_, index) in 6"
          :key="`skeleton-${index}`"
          class="wall-skeleton-card"
          :style="{ minHeight: skeletonHeight(index) }"
        >
          <div class="flex items-center gap-3">
            <span class="wall-skeleton-avatar"></span>
            <div class="flex-1 space-y-2">
              <span class="wall-skeleton-line w-1/3"></span>
              <span class="wall-skeleton-line w-1/4"></span>
            </div>
          </div>
          <span class="wall-skeleton-line mt-4 w-full"></span>
          <span class="wall-skeleton-line mt-2 w-5/6"></span>
          <span class="wall-skeleton-line mt-2 w-2/3"></span>
        </div>
      </div>

      <!-- 首次加载失败：整块提示 + 重试 -->
      <div v-else-if="error && !loaded" class="wall-state mt-5">
        <span class="wall-state-icon is-error">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M12 8v5M12 16.5v.1" stroke-linecap="round" />
            <path
              d="M10.3 3.8 2.6 17.1A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.9L13.7 3.8a2 2 0 0 0-3.4 0Z"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="wall-state-title">留言墙暂时没加载出来</p>
        <p class="wall-state-text">{{ error }}</p>
        <button type="button" class="wall-state-btn" @click="emit('refresh')">重新加载</button>
      </div>

      <template v-else>
        <!-- 已加载过，刷新 / 加载更多失败时保留旧内容 -->
        <div v-if="error" class="wall-inline-error" role="alert">
          <span>{{ error }}</span>
          <button type="button" @click="emit('refresh')">刷新看看</button>
        </div>

        <!-- 空状态：按当前筛选给出不同的提示 -->
        <div v-if="!messages.length" class="wall-state mt-5">
          <span class="wall-state-icon">
            <IconFont name="liuyan" class="text-[24px]" />
          </span>
          <p class="wall-state-title">{{ emptyTitle }}</p>
          <p class="wall-state-text">{{ emptyText }}</p>
          <button type="button" class="wall-state-btn" @click="handleEmptyAction">
            {{ filter === 'all' ? '写下第一条留言' : '看看全部留言' }}
          </button>
        </div>

        <template v-else>
          <!-- 瀑布流：白色卡片，按内容长短自然错开 -->
          <div class="wall-columns mt-5">
            <MessageWallCard
              v-for="(message, index) in messages"
              :key="message.id"
              :message="message"
              :index="index"
            />
          </div>

          <!-- 加载更多 / 到底提示 -->
          <div v-if="hasMore" class="wall-loadmore">
            <button type="button" :disabled="loadingMore" @click="emit('load-more')">
              <span v-if="loadingMore" class="wall-loadmore-spinner" aria-hidden="true"></span>
              <template v-else>
                <span class="wall-loadmore-dot" aria-hidden="true"></span>
                再往前看看
              </template>
              {{ loadingMore ? '正在把留言搬过来…' : '' }}
            </button>
            <p>{{ messages.length }} / {{ total }}</p>
          </div>
          <div v-else class="wall-end">
            <span class="wall-end-line" aria-hidden="true"></span>
            <span class="inline-flex items-center gap-1.5">
              <IconFont name="liuyan" class="text-[13px]" />
              已经翻到墙的最早一条留言了
            </span>
            <span class="wall-end-line is-right" aria-hidden="true"></span>
          </div>
        </template>
      </template>
    </section>

    <!-- ========== 留言表单：放在墙的下方，先看留言再动笔 ========== -->
    <div
      id="wall-composer"
      class="wall-section-rise mx-auto mt-12 w-full max-w-[900px] scroll-mt-24"
    >
      <div class="wall-composer-lead" aria-hidden="true">
        <span class="wall-composer-lead-line"></span>
        <span class="wall-composer-lead-dot"></span>
        <span class="wall-composer-lead-line is-right"></span>
      </div>

      <MessageWallForm
        :owner="owner"
        :owner-name="ownerName"
        :owner-avatar="ownerAvatar"
        @submit="handleSubmit"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MessageFilter, PublicMessageRow } from '@/api/messages'
import type { MessageFormPayload } from '@/types/message'
import MessageWallCard from './MessageWallCard.vue'
import MessageWallForm from './MessageWallForm.vue'
import MessageWallHeader from './MessageWallHeader.vue'

type SubmitDone = (ok: boolean, message?: string) => void

const props = withDefaults(
  defineProps<{
    messages: PublicMessageRow[]
    /** 当前筛选条件下的留言数 */
    total: number
    /** 全部留言数，顶部标题固定用它，不随筛选变化 */
    allTotal?: number
    filter: MessageFilter
    loading?: boolean
    loaded?: boolean
    loadingMore?: boolean
    error?: string
    owner?: boolean
    ownerName?: string
    ownerAvatar?: string
  }>(),
  {
    allTotal: 0,
    loading: false,
    loaded: false,
    loadingMore: false,
    error: '',
    owner: false,
    ownerName: '博主',
    ownerAvatar: '',
  },
)

const emit = defineEmits<{
  'update:filter': [value: MessageFilter]
  'load-more': []
  refresh: []
  submit: [payload: MessageFormPayload, done: SubmitDone]
}>()

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'owner', label: '博主' },
  { value: 'guest', label: '访客' },
]

// 骨架卡片高低错开，加载时也能看出瀑布流的形状
const SKELETON_HEIGHTS = [156, 124, 180, 140, 164, 132]
function skeletonHeight(index: number) {
  return `${SKELETON_HEIGHTS[index] ?? 150}px`
}

const hasMore = computed(() => props.messages.length < props.total)

const filterSummary = computed(() => {
  if (props.filter === 'owner') return `${props.total} 条博主留言`
  if (props.filter === 'guest') return `${props.total} 条访客留言`
  return `${props.total} 条留言`
})

const emptyTitle = computed(() => {
  if (props.filter === 'owner') return '博主还没在墙上留下脚印'
  if (props.filter === 'guest') return '还没有访客留言'
  return '墙上还空着'
})

const emptyText = computed(() => {
  if (props.filter === 'owner') return '切换到「全部」看看，或者等博主下次路过。'
  if (props.filter === 'guest') return '来做第一个在墙上写字的人吧。'
  return '写下第一句话，让这面墙慢慢热闹起来。'
})

function setFilter(value: MessageFilter) {
  if (value === props.filter) return
  emit('update:filter', value)
}

function handleSubmit(payload: MessageFormPayload, done: SubmitDone) {
  emit('submit', payload, done)
}

function scrollToComposer() {
  document.getElementById('wall-composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleEmptyAction() {
  if (props.filter !== 'all') {
    setFilter('all')
    return
  }
  scrollToComposer()
}
</script>

<style scoped>
.wall-section-rise {
  animation: wall-section-rise 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s both;
}

@keyframes wall-section-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wall-filterbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 16px;
  border: 1px solid #e2e4e8;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 18px 40px -32px rgba(39, 39, 42, 0.24),
    0 1px 2px rgba(39, 39, 42, 0.03);
  backdrop-filter: blur(8px);
}

.wall-filter-segment {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid #eceef1;
  border-radius: 999px;
  background: #f7f8f9;
}

.wall-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 13px;
  border-radius: 999px;
  color: #71717a;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 20px;
  transition:
    color 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;
}

.wall-filter-btn:hover {
  color: #27272a;
}

.wall-filter-btn.is-active {
  background: #fff;
  color: #27272a;
  box-shadow: 0 4px 12px -8px rgba(63, 63, 70, 0.3);
}

.wall-filter-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #d4d4d8;
  transition: background-color 0.22s ease;
}

.wall-filter-dot.is-owner {
  background: #8a7cab;
}

.wall-filter-dot.is-guest {
  background: #a1a1aa;
}

.wall-filter-btn.is-active .wall-filter-dot {
  background: #6f628f;
}

.wall-refresh {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #71717a;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.wall-refresh svg {
  width: 14px;
  height: 14px;
}

.wall-refresh:hover:not(:disabled) {
  border-color: #e4e6e9;
  background: #fff;
  color: #27272a;
}

.wall-refresh:disabled {
  cursor: default;
  opacity: 0.55;
}

/* ---------- 瀑布流 ---------- */
.wall-columns {
  column-count: 1;
  column-gap: 1rem;
}

@media (min-width: 640px) {
  .wall-columns {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .wall-columns {
    column-count: 3;
  }
}

/* ---------- 骨架 ---------- */
.wall-skeleton-card {
  display: block;
  break-inside: avoid;
  margin-bottom: 1rem;
  padding: 1.15rem 1.2rem 1rem;
  border: 1px solid #e2e4e9;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
}

.wall-skeleton-avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #f1f2f4;
  animation: wall-skeleton-pulse 1.5s ease-in-out infinite;
}

.wall-skeleton-line {
  display: block;
  height: 11px;
  border-radius: 999px;
  background: #f1f2f4;
  animation: wall-skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes wall-skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

/* ---------- 空 / 错误状态 ---------- */
.wall-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 54px 20px;
  border: 1px dashed #e4e6e9;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  text-align: center;
}

.wall-state-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin-bottom: 3px;
  border: 1px solid #e7e2f0;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f6fc, #fcfbfe);
  color: #8b7fac;
  transform: rotate(-4deg);
  transition: transform 0.3s ease;
}

.wall-state:hover .wall-state-icon {
  transform: rotate(0deg) translateY(-2px);
}

.wall-state-icon.is-error {
  border-color: #f0d0d0;
  background: linear-gradient(135deg, #fdf3f3, #fffafa);
  color: #b04b4b;
}

.wall-state-icon svg {
  width: 22px;
  height: 22px;
}

.wall-state-title {
  font-family: 'huoxie', sans-serif;
  font-size: 16px;
  color: #52525b;
}

.wall-state-text {
  max-width: 340px;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 1.7;
  color: #a1a1aa;
}

.wall-state-btn {
  margin-top: 7px;
  padding: 5px 17px;
  border: 1px solid #e4e6e9;
  border-radius: 999px;
  background: #fff;
  color: #27272a;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.wall-state-btn:hover {
  border-color: #cfc6e2;
  background: #f8f6fc;
  transform: translateY(-1px);
}

.wall-inline-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 8px 12px;
  border-radius: 9px;
  background: rgba(254, 242, 242, 0.85);
  color: #b04b4b;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
}

.wall-inline-error button {
  flex-shrink: 0;
  padding: 2px 10px;
  border: 1px solid rgba(176, 75, 75, 0.22);
  border-radius: 999px;
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.wall-inline-error button:hover {
  background: rgba(176, 75, 75, 0.08);
}

/* ---------- 加载更多 / 底部 ---------- */
.wall-loadmore {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
}

.wall-loadmore button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 22px;
  border: 1px solid #e4e6e9;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #27272a;
  font-family: 'huoxie', sans-serif;
  font-size: 13.5px;
  box-shadow: 0 10px 24px -22px rgba(63, 63, 70, 0.3);
  transition:
    border-color 0.22s ease,
    background-color 0.22s ease,
    transform 0.22s ease;
}

.wall-loadmore button:hover:not(:disabled) {
  border-color: #cfc6e2;
  background: #f8f6fc;
  transform: translateY(-1px);
}

.wall-loadmore button:disabled {
  cursor: default;
  opacity: 0.75;
}

.wall-loadmore p {
  color: #a1a1aa;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

.wall-loadmore-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #8a7cab;
  box-shadow: 0 0 0 3px rgba(138, 124, 171, 0.14);
}

.wall-loadmore-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(111, 98, 143, 0.2);
  border-top-color: #6f628f;
  border-radius: 999px;
  animation: wall-spin 0.8s linear infinite;
}

@keyframes wall-spin {
  to {
    transform: rotate(360deg);
  }
}

.wall-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
  color: #a1a1aa;
  font-family: 'huoxie', sans-serif;
  font-size: 11.5px;
}

.wall-end-line {
  width: 38px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e4e6e9);
}

.wall-end-line.is-right {
  background: linear-gradient(90deg, #e4e6e9, transparent);
}

/* ---------- 表单前的分隔装饰 ---------- */
.wall-composer-lead {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
}

.wall-composer-lead-line {
  width: 56px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d4d4d8);
}

.wall-composer-lead-line.is-right {
  background: linear-gradient(90deg, #d4d4d8, transparent);
}

.wall-composer-lead-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #b3a7cf;
}

/* ---------- 深色模式 ---------- */
html.dark .wall-filterbar {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 22, 0.82);
  box-shadow:
    0 18px 40px -32px rgba(0, 0, 0, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.3);
}

html.dark .wall-filter-segment {
  border-color: rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
}

html.dark .wall-filter-btn {
  color: #a1a1aa;
}

html.dark .wall-filter-btn:hover {
  color: #fafafa;
}

html.dark .wall-filter-btn.is-active {
  background: rgba(255, 255, 255, 0.08);
  color: #fafafa;
  box-shadow: 0 4px 12px -8px rgba(0, 0, 0, 0.8);
}

html.dark .wall-refresh:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fafafa;
}

html.dark .wall-skeleton-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 22, 0.84);
}

html.dark .wall-skeleton-avatar,
html.dark .wall-skeleton-line {
  background: rgba(255, 255, 255, 0.08);
}

html.dark .wall-state {
  border-color: #2f3134;
  background: rgba(20, 20, 22, 0.4);
}

html.dark .wall-state-icon {
  border-color: rgba(190, 175, 225, 0.16);
  background: linear-gradient(135deg, rgba(160, 140, 200, 0.1), rgba(20, 20, 22, 0.3));
  color: #b3a7cf;
}

html.dark .wall-state-icon.is-error {
  border-color: rgba(240, 160, 160, 0.22);
  background: rgba(120, 40, 40, 0.16);
  color: #e0a0a0;
}

html.dark .wall-state-title {
  color: #a1a1aa;
}

html.dark .wall-state-text {
  color: #71717a;
}

html.dark .wall-state-btn {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #fafafa;
}

html.dark .wall-state-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

html.dark .wall-composer-lead-line {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16));
}

html.dark .wall-composer-lead-line.is-right {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.16), transparent);
}

html.dark .wall-composer-lead-dot {
  background: #7b6f94;
}

html.dark .wall-inline-error {
  background: rgba(120, 40, 40, 0.22);
  color: #f0b4b4;
}

html.dark .wall-inline-error button {
  border-color: rgba(240, 180, 180, 0.3);
}

html.dark .wall-loadmore button {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 22, 0.62);
  color: #fafafa;
}

html.dark .wall-loadmore button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

html.dark .wall-loadmore p,
html.dark .wall-end {
  color: #71717a;
}

html.dark .wall-end-line {
  background: linear-gradient(90deg, transparent, #2f3134);
}

html.dark .wall-end-line.is-right {
  background: linear-gradient(90deg, #2f3134, transparent);
}

@media (max-width: 639px) {
  .wall-filterbar {
    padding: 9px 10px;
  }

  .wall-filter-btn {
    padding: 4px 10px;
  }

  .wall-state {
    padding: 44px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wall-section-rise,
  .wall-skeleton-avatar,
  .wall-skeleton-line,
  .wall-loadmore-spinner {
    animation: none;
  }
  .wall-state-icon,
  .wall-state-btn,
  .wall-loadmore button {
    transition: none;
  }
}
</style>
