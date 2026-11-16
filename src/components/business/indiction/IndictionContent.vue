<template>
  <section class="indiction-content">
    <div class="indiction-inner">
      <div v-if="essays.length" class="indiction-feed-head">
        <p class="indiction-eyebrow">DAILY NOTES</p>
        <p class="indiction-summary">
          共 <span>{{ total }}</span> 篇随笔 · 生活、学习和一些慢慢写下来的碎碎念
        </p>
      </div>

      <!-- 首次加载：用和随笔行等高的骨架占位 -->
      <div v-if="initialLoading" class="indiction-state" role="status" aria-live="polite">
        <div v-for="n in 3" :key="n" class="indiction-skeleton-row">
          <span class="indiction-skeleton-date"></span>
          <div class="indiction-skeleton-card">
            <span class="indiction-skeleton-line is-title"></span>
            <span class="indiction-skeleton-line"></span>
            <span class="indiction-skeleton-line is-short"></span>
          </div>
        </div>
      </div>

      <!-- 首次加载失败 -->
      <div v-else-if="loadError && !essays.length" class="indiction-state is-panel" role="alert">
        <span class="indiction-state-icon is-error" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M12 8.5v4.2" stroke-linecap="round" />
            <path d="M12 16.2h.01" stroke-linecap="round" stroke-width="2.2" />
            <path
              d="M10.3 4.6 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="indiction-state-title">随笔暂时没有加载出来</p>
        <p class="indiction-state-desc">{{ loadError }}</p>
        <button type="button" class="indiction-retry" @click="retry">重新加载</button>
      </div>

      <!-- 还没有随笔 -->
      <div v-else-if="!essays.length" class="indiction-state is-panel">
        <span class="indiction-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 3.5h9.5L20 8v12.5H6V3.5Z" stroke-linejoin="round" />
            <path d="M15 3.8V8h4.2M9 12h8M9 15.5h6" stroke-linecap="round" />
          </svg>
        </span>
        <p class="indiction-state-title">随笔页还空着</p>
        <p class="indiction-state-desc">等博主写下第一篇生活碎碎念，这里就会热闹起来。</p>
      </div>

      <!-- 随笔时间轴 -->
      <div v-else class="essay-feed">
        <IndictionContentCard
          v-for="(essay, index) in essays"
          :key="essay.id"
          :essay="essay"
          :index="index"
        />

        <div ref="sentinel" class="essay-feed-sentinel" aria-live="polite">
          <template v-if="loading">
            <span class="essay-sentinel-spinner" aria-hidden="true"></span>
            正在翻下一页随笔…
          </template>
          <template v-else-if="loadError">
            <span>后面还有内容没有加载出来</span>
            <button type="button" @click="retry">重试</button>
          </template>
          <template v-else-if="!hasMore">
            <span class="essay-sentinel-end">已经到底啦 · 慢慢生活，慢慢记录</span>
          </template>
          <template v-else>
            <span>继续向下滑动，加载更多随笔</span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ESSAY_PAGE_SIZE, essayErrorMessage, fetchEssays } from '@/api/essays'
import type { Essay } from '@/types'
import IndictionContentCard from './IndictionContentCard.vue'

const essays = ref<Essay[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const initialLoading = ref(true)
const loadError = ref('')
const hasMore = ref(true)

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let requestId = 0

/** 一次拿 10 篇；滚动到接近底部时再拿下一页 */
async function loadMore() {
  if (loading.value || !hasMore.value) return

  const current = ++requestId
  loading.value = true
  loadError.value = ''

  try {
    const result = await fetchEssays(page.value, ESSAY_PAGE_SIZE)
    if (current !== requestId) return

    const seen = new Set(essays.value.map((item) => item.id))
    essays.value.push(...result.list.filter((item) => !seen.has(item.id)))
    total.value = result.total
    page.value += 1
    hasMore.value = essays.value.length < result.total && result.list.length > 0
  } catch (error) {
    if (current !== requestId) return
    console.error('[indiction] 加载随笔失败', error)
    loadError.value = essayErrorMessage(error)
  } finally {
    if (current === requestId) {
      loading.value = false
      initialLoading.value = false
      await nextTick()
      fillViewport()
    }
  }
}

/**
 * 如果一页内容还撑不满视口，IntersectionObserver 不会再触发，
 * 这里主动检查一次哨兵位置，避免用户看到“继续向下滑动”却滑无可滑。
 */
function fillViewport() {
  if (loading.value || !hasMore.value || loadError.value) return
  const el = sentinel.value
  if (!el) return

  if (el.getBoundingClientRect().top <= window.innerHeight + 420) {
    void loadMore()
  }
}

function retry() {
  if (loading.value) return
  loadError.value = ''
  if (!essays.value.length) initialLoading.value = true
  void loadMore()
}

function onScroll() {
  if (loading.value || !hasMore.value || loadError.value) return
  const el = sentinel.value
  if (!el) return
  if (el.getBoundingClientRect().top <= window.innerHeight + 420) {
    void loadMore()
  }
}

// 哨兵只在已经有随笔时渲染，等它出现后再交给 IntersectionObserver 观察
watch(
  sentinel,
  (element) => {
    observer?.disconnect()
    if (element) observer?.observe(element)
  },
  { flush: 'post' },
)

onMounted(() => {
  void loadMore()

  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { rootMargin: '420px 0px' },
    )
    if (sentinel.value) observer.observe(sentinel.value)
  } else {
    window.addEventListener('scroll', onScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* ==================== 页面底色：淡色网格 + 柔和色块 ==================== */
.indiction-content {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  padding: 58px 20px 90px;
  background-color: #f7fafd;
  background-image:
    linear-gradient(180deg, #fff 0, rgba(255, 255, 255, 0) 190px),
    radial-gradient(circle at 12% 6%, rgba(186, 224, 241, 0.28), transparent 38%),
    radial-gradient(circle at 88% 24%, rgba(219, 205, 243, 0.22), transparent 36%),
    radial-gradient(circle at 50% 82%, rgba(188, 219, 244, 0.22), transparent 42%),
    linear-gradient(rgba(120, 160, 200, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 160, 200, 0.07) 1px, transparent 1px);
  background-size:
    auto,
    auto,
    auto,
    auto,
    34px 34px,
    34px 34px;
}

.indiction-inner {
  position: relative;
  width: min(1180px, 100%);
  margin: 0 auto;
}

/* ==================== 小标题 ==================== */
.indiction-feed-head {
  margin: 0 0 26px calc(112px + 18px + 28px + 18px);
}

.indiction-eyebrow {
  color: #8ba3ba;
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  letter-spacing: 0.34em;
}

.indiction-summary {
  margin-top: 5px;
  color: #7d8fa2;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  letter-spacing: 0.03em;
}

.indiction-summary span {
  color: #5d7f9e;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

/* ==================== 时间轴和卡片 ==================== */
.essay-feed {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 贯穿所有日期节点的竖线，位置和三列网格的中间节点列对齐 */
.essay-feed::before {
  content: '';
  position: absolute;
  top: 28px;
  bottom: 84px;
  left: calc(112px + 18px + 13px);
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(124, 174, 219, 0.42),
    rgba(141, 187, 230, 0.34) 38%,
    rgba(182, 162, 218, 0.32) 70%,
    rgba(228, 188, 141, 0.2)
  );
}

.essay-feed-sentinel {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  letter-spacing: 0.03em;
}

.essay-feed-sentinel button {
  border: 1px solid #dbe7f4;
  border-radius: 999px;
  padding: 2px 10px;
  background: #fff;
  color: #557a9d;
  font-size: 11.5px;
}

.essay-sentinel-end {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.essay-sentinel-end::before,
.essay-sentinel-end::after {
  content: '';
  width: 34px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cdd9e5);
}

.essay-sentinel-end::after {
  background: linear-gradient(90deg, #cdd9e5, transparent);
}

.essay-sentinel-spinner {
  height: 13px;
  width: 13px;
  border: 2px solid rgba(107, 163, 201, 0.24);
  border-top-color: #6ba3c9;
  border-radius: 999px;
  animation: indiction-spin 0.8s linear infinite;
}

/* ==================== 加载 / 错误 / 空状态 ==================== */
.indiction-state {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.indiction-state.is-panel {
  align-items: center;
  border: 1px dashed #dbe6f1;
  border-radius: 18px;
  padding: 58px 24px;
  background: rgba(255, 255, 255, 0.62);
  text-align: center;
}

.indiction-state-icon {
  display: grid;
  height: 48px;
  width: 48px;
  place-items: center;
  border-radius: 15px;
  background: linear-gradient(135deg, #edf5fd, #edf6fd 55%, #f6f1fb);
  color: #8aa5bb;
  box-shadow: 0 12px 28px -20px rgba(64, 102, 132, 0.5);
}

.indiction-state-icon svg {
  height: 23px;
  width: 23px;
}

.indiction-state-icon.is-error {
  color: #c28a68;
  background: linear-gradient(135deg, #fdf6ee, #fdf1f2);
}

.indiction-state-title {
  color: #53677c;
  font-family: 'huoxie', sans-serif;
  font-size: 18px;
  letter-spacing: 0.04em;
}

.indiction-state-desc {
  max-width: 430px;
  color: #8b9bac;
  font-size: 12.5px;
  line-height: 1.8;
}

.indiction-retry {
  border: 1px solid #d6e5f2;
  border-radius: 999px;
  padding: 7px 20px;
  background: #fff;
  color: #5a819f;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.indiction-retry:hover {
  border-color: #b8d5ea;
  background: #f4fafe;
}

/* ==================== 骨架 ==================== */
.indiction-skeleton-row {
  display: grid;
  grid-template-columns: 112px 28px minmax(0, 1fr);
  column-gap: 18px;
}

.indiction-skeleton-date {
  height: 66px;
  border-radius: 13px;
  background: #edf3f9;
  animation: indiction-pulse 1.5s ease-in-out infinite;
}

.indiction-skeleton-card {
  grid-column: 3;
  border: 1px solid #e8eef6;
  border-radius: 18px;
  padding: 23px 24px 28px;
  background: rgba(255, 255, 255, 0.72);
}

.indiction-skeleton-line {
  display: block;
  height: 11px;
  margin-bottom: 13px;
  border-radius: 999px;
  background: #edf3f9;
  animation: indiction-pulse 1.5s ease-in-out infinite;
}

.indiction-skeleton-line.is-title {
  width: 42%;
  height: 17px;
  margin-bottom: 20px;
}

.indiction-skeleton-line.is-short {
  width: 64%;
  margin-bottom: 0;
}

.dark .indiction-content {
  background-color: #030712;
  background-image:
    radial-gradient(circle at 12% 6%, rgba(55, 105, 135, 0.16), transparent 38%),
    radial-gradient(circle at 88% 24%, rgba(90, 75, 130, 0.13), transparent 36%),
    radial-gradient(circle at 50% 82%, rgba(55, 95, 130, 0.14), transparent 42%),
    linear-gradient(rgba(148, 163, 184, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.055) 1px, transparent 1px);
  background-size:
    auto,
    auto,
    auto,
    34px 34px,
    34px 34px;
}

.dark .indiction-eyebrow {
  color: #657b92;
}

.dark .indiction-summary {
  color: #7b8ea4;
}

.dark .indiction-summary span {
  color: #9cb9d2;
}

.dark .essay-feed::before {
  background: linear-gradient(
    180deg,
    rgba(83, 137, 188, 0.36),
    rgba(95, 140, 180, 0.28) 38%,
    rgba(130, 105, 170, 0.26) 70%,
    rgba(170, 130, 85, 0.16)
  );
}

.dark .essay-feed-sentinel {
  color: #64748b;
}

.dark .essay-feed-sentinel button {
  border-color: #2a3a50;
  background: #0d1726;
  color: #8ecbff;
}

.dark .essay-sentinel-end::before {
  background: linear-gradient(90deg, transparent, #2a3a50);
}

.dark .essay-sentinel-end::after {
  background: linear-gradient(90deg, #2a3a50, transparent);
}

.dark .indiction-state.is-panel {
  border-color: #223047;
  background: rgba(12, 20, 32, 0.6);
}

.dark .indiction-state-icon {
  background: linear-gradient(135deg, rgba(55, 95, 130, 0.24), rgba(64, 92, 150, 0.2));
  color: #7f9ab0;
}

.dark .indiction-state-title {
  color: #cbd5e1;
}

.dark .indiction-state-desc {
  color: #7b8ea4;
}

.dark .indiction-retry {
  border-color: #2a3a50;
  background: #0d1726;
  color: #9cb9d2;
}

.dark .indiction-skeleton-date,
.dark .indiction-skeleton-line {
  background: #172335;
}

.dark .indiction-skeleton-card {
  border-color: #1e2d42;
  background: rgba(13, 23, 38, 0.72);
}

@keyframes indiction-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@keyframes indiction-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 小屏 ==================== */
@media (max-width: 900px) {
  .indiction-content {
    padding: 38px 14px 68px;
  }

  .indiction-feed-head {
    margin: 0 0 20px;
    padding-left: 2px;
  }

  .essay-feed {
    gap: 20px;
  }

  .essay-feed::before {
    display: none;
  }

  .indiction-skeleton-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .indiction-skeleton-date {
    display: none;
  }

  .indiction-skeleton-card {
    grid-column: 1;
    padding: 20px 18px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .indiction-skeleton-date,
  .indiction-skeleton-line,
  .essay-sentinel-spinner {
    animation: none;
  }
}
</style>
