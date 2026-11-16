<template>
  <article class="essay-row" :class="accentClass">
    <!-- 左侧日期：保留原来的时间轴结构，用软色纸片代替纯文字 -->
    <div class="essay-date-col">
      <div class="essay-date-chip">
        <p class="essay-date-year">{{ dateInfo.year }}</p>
        <p class="essay-date-day">{{ dateInfo.day }}</p>
      </div>
    </div>

    <div class="essay-track" aria-hidden="true">
      <span class="essay-dot"></span>
    </div>

    <div class="essay-card">
      <header class="essay-card-head">
        <h2 class="essay-card-title">{{ essay.title }}</h2>
        <div class="essay-card-meta">
          <span class="essay-mobile-date">{{ dateInfo.fullDate }}</span>
          <span class="essay-card-no">NO.{{ String(index + 1).padStart(2, '0') }}</span>
        </div>
      </header>

      <div class="essay-body-shell">
        <div
          ref="bodyRef"
          class="essay-body essay-md"
          :class="{ 'is-expanded': expanded, 'is-clickable': canExpand && !expanded }"
          @click="handleBodyClick"
          v-html="html"
        ></div>
        <div v-if="canExpand && !expanded" class="essay-fade" aria-hidden="true"></div>
      </div>

      <button
        v-if="canExpand"
        type="button"
        class="essay-expand"
        :aria-expanded="expanded"
        @click="toggleExpanded"
      >
        {{ expanded ? '收起内容' : '展开全文' }}
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <footer class="essay-card-foot">
        <div class="essay-actions">
          <button
            type="button"
            class="essay-action essay-like"
            :class="{ 'is-bumping': likeBumping }"
            title="点赞，可以连续点"
            @click="like"
          >
            <svg class="essay-heart" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M9.65 17.15a.9.9 0 0 0 .7 0c.26-.1 6.4-3.68 6.4-8.4A4.35 4.35 0 0 0 12.4 4.4c-.98 0-1.9.37-2.4 1.02-.5-.65-1.42-1.02-2.4-1.02A4.35 4.35 0 0 0 3.25 8.75c0 4.72 6.14 8.3 6.4 8.4Z"
              />
            </svg>
            <span>点赞</span>
            <span class="essay-action-count">{{ likeCount }}</span>
          </button>

          <button
            type="button"
            class="essay-action essay-comment-toggle"
            :class="{ 'is-active': commentsOpen }"
            :aria-expanded="commentsOpen"
            @click="commentsOpen = !commentsOpen"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M3.5 3.75A1.75 1.75 0 0 1 5.25 2h9.5A1.75 1.75 0 0 1 16.5 3.75v7.5A1.75 1.75 0 0 1 14.75 13H9.06l-3.2 2.77A.75.75 0 0 1 4.67 15.2V13h-.92A1.75 1.75 0 0 1 2 11.25v-7.5A1.75 1.75 0 0 1 3.5 3.75Z"
              />
            </svg>
            <span>评论</span>
            <span class="essay-action-count">{{ commentCount }}</span>
          </button>

          <span v-if="likeError" class="essay-like-error" role="status">{{ likeError }}</span>
        </div>

        <span class="essay-card-length">约 {{ wordCount }} 字</span>
      </footer>

      <Transition name="essay-comment-panel">
        <EssayComments
          v-if="commentsOpen"
          :essay-id="essay.id"
          class="mx-[18px] mb-4 !mt-0 sm:mx-6 sm:mb-5"
          @count-change="handleCommentCount"
        />
      </Transition>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { incrementEssayLike } from '@/api/essays'
import type { Essay } from '@/types'
import { formatDate } from '@/utils/date'
import { md } from '@/utils/markdown'
import { countWords } from '@/utils/text'
import EssayComments from './EssayComments.vue'

const props = defineProps<{
  essay: Essay
  index: number
}>()

const ACCENT_COUNT = 5
const accentClass = computed(() => `essay-accent-${props.index % ACCENT_COUNT}`)

const html = computed(() => md.render(props.essay.content || ''))
const wordCount = computed(() => countWords(props.essay.content))

const dateInfo = computed(() => {
  const raw = props.essay.publishedAt || props.essay.createdAt
  const date = new Date(raw)

  if (Number.isNaN(date.getTime())) {
    return { year: '时间', day: '待定', fullDate: '时间未知' }
  }

  return {
    year: `${date.getFullYear()}年`,
    day: `${date.getMonth() + 1}月${date.getDate()}日`,
    fullDate: formatDate(raw, false),
  }
})

const likeCount = ref(props.essay.likeCount)
const commentCount = ref(props.essay.commentCount)
const commentsOpen = ref(false)

watch(
  () => props.essay.likeCount,
  (value) => {
    likeCount.value = value
  },
)

watch(
  () => props.essay.commentCount,
  (value) => {
    commentCount.value = value
  },
)

// ---------------- 点赞：不做用户限制，每点一次请求一次 +1 ----------------
const likeBumping = ref(false)
const likeError = ref('')
let bumpTimer: ReturnType<typeof setTimeout> | undefined
let errorTimer: ReturnType<typeof setTimeout> | undefined

function like() {
  likeCount.value += 1
  likeError.value = ''

  likeBumping.value = false
  requestAnimationFrame(() => {
    likeBumping.value = true
  })
  clearTimeout(bumpTimer)
  bumpTimer = setTimeout(() => {
    likeBumping.value = false
  }, 460)

  void incrementEssayLike(props.essay.id).catch((error) => {
    console.error('[indiction] 点赞失败', error)
    likeCount.value = Math.max(0, likeCount.value - 1)
    likeError.value = '点赞没成功，再试一次'
    clearTimeout(errorTimer)
    errorTimer = setTimeout(() => {
      likeError.value = ''
    }, 2600)
  })
}

function handleCommentCount(count: number) {
  commentCount.value = count
}

// ---------------- 长内容折叠 ----------------
const bodyRef = ref<HTMLElement | null>(null)
const expanded = ref(false)
const canExpand = ref(false)
let resizeObserver: ResizeObserver | null = null

function measureBody() {
  void nextTick(() => {
    const body = bodyRef.value
    if (!body || expanded.value) return
    // 只从「不需要展开」升级为「需要展开」：
    // 收起时高度还在过渡中，不能因为这一刻看起来没溢出就把按钮藏掉。
    if (body.scrollHeight > body.clientHeight + 4) canExpand.value = true
  })
}

function toggleExpanded() {
  expanded.value = !expanded.value
  if (!expanded.value) measureBody()
}

function handleBodyClick(event: MouseEvent) {
  if (!canExpand.value || expanded.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('a, button')) return
  if (window.getSelection()?.toString()) return
  expanded.value = true
}

onMounted(() => {
  measureBody()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measureBody())
    if (bodyRef.value) resizeObserver.observe(bodyRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(bumpTimer)
  clearTimeout(errorTimer)
})
</script>

<style scoped>
/* ==================== 卡片配色：每篇随笔换一套淡色 ==================== */
.essay-accent-0 {
  --accent: #6fa6cf;
  --accent-strong: #3f719b;
  --accent-soft: #eef6fd;
  --accent-line: #d6e7f4;
  --accent-glow: rgba(111, 166, 207, 0.24);
}

.essay-accent-1 {
  --accent: #97c8e8;
  --accent-strong: #4a7597;
  --accent-soft: #f0f9fe;
  --accent-line: #dcedf8;
  --accent-glow: rgba(151, 200, 232, 0.24);
}

.essay-accent-2 {
  --accent: #b6a2da;
  --accent-strong: #765f9e;
  --accent-soft: #f7f2fc;
  --accent-line: #e7ddf3;
  --accent-glow: rgba(182, 162, 218, 0.24);
}

.essay-accent-3 {
  --accent: #e4bc8d;
  --accent-strong: #99704a;
  --accent-soft: #fdf8f0;
  --accent-line: #f0e2d0;
  --accent-glow: rgba(228, 188, 141, 0.26);
}

.essay-accent-4 {
  --accent: #e3aab5;
  --accent-strong: #9c6270;
  --accent-soft: #fdf4f5;
  --accent-line: #f1dde1;
  --accent-glow: rgba(227, 170, 181, 0.26);
}

.essay-row {
  display: grid;
  grid-template-columns: 112px 28px minmax(0, 1fr);
  column-gap: 18px;
  position: relative;
}

/* ==================== 左侧日期纸片 ==================== */
.essay-date-col {
  padding-top: 9px;
}

.essay-date-chip {
  position: relative;
  border: 1px solid var(--accent-line);
  border-radius: 13px;
  padding: 11px 8px 10px;
  background: var(--accent-soft);
  box-shadow: 0 10px 22px -20px rgba(49, 85, 114, 0.65);
  text-align: center;
  transform: rotate(-1.2deg);
}

.essay-date-chip::before,
.essay-date-chip::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: 3px;
  background: var(--accent);
  opacity: 0.3;
}

.essay-date-chip::before {
  left: -8px;
  top: 10px;
  width: 27px;
  height: 8px;
  transform: rotate(-20deg);
}

.essay-date-chip::after {
  right: -7px;
  bottom: 10px;
  width: 21px;
  height: 7px;
  transform: rotate(17deg);
}

.essay-date-year {
  color: var(--accent-strong);
  font-family: 'huoxie', sans-serif;
  font-size: 16px;
  letter-spacing: 0.04em;
  line-height: 1.3;
}

.essay-date-day {
  margin-top: 2px;
  color: var(--accent-strong);
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  line-height: 1.5;
  opacity: 0.85;
}

/* ==================== 时间轴节点 ==================== */
.essay-track {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 27px;
}

.essay-dot {
  position: relative;
  z-index: 1;
  height: 11px;
  width: 11px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

/* ==================== 随笔卡片 ==================== */
.essay-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6eef7;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  box-shadow:
    0 18px 44px -34px rgba(50, 90, 120, 0.5),
    inset 0 1px 0 #fff;
}

.essay-card::before {
  content: '';
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-line) 48%, transparent 90%);
}

.essay-card::after {
  content: '';
  position: absolute;
  z-index: 0;
  top: -90px;
  right: -70px;
  height: 200px;
  width: 200px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--accent-glow), transparent 68%);
  pointer-events: none;
}

.essay-card > * {
  position: relative;
  z-index: 1;
}

.essay-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 22px 24px 0;
}

.essay-card-title {
  min-width: 0;
  color: #33475c;
  font-family: 'huoxie', sans-serif;
  font-size: 22px;
  font-weight: normal;
  letter-spacing: 0.04em;
  line-height: 1.45;
  word-break: break-word;
}

.essay-card-meta {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding-top: 3px;
}

.essay-mobile-date {
  display: none;
  border-radius: 999px;
  padding: 2px 8px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
}

.essay-card-no {
  color: #a5b2c1;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  font-variant-numeric: tabular-nums;
}

/* ==================== 正文折叠 ==================== */
.essay-body-shell {
  position: relative;
  margin-top: 12px;
  padding: 0 24px;
}

.essay-body {
  max-height: 17.5rem;
  overflow: hidden;
  transition: max-height 0.38s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.essay-body.is-expanded {
  max-height: 30000px;
}

.essay-body.is-clickable {
  cursor: pointer;
}

.essay-fade {
  position: absolute;
  right: 24px;
  bottom: 0;
  left: 24px;
  height: 86px;
  background: linear-gradient(180deg, rgba(252, 253, 255, 0), #fcfdff 86%);
  pointer-events: none;
}

.essay-expand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 1px 24px 0;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--accent-strong);
  font-size: 12px;
  letter-spacing: 0.03em;
  transition: opacity 0.2s ease;
}

.essay-expand:hover {
  opacity: 0.72;
}

.essay-expand svg {
  height: 12px;
  width: 12px;
  transition: transform 0.2s ease;
}

.essay-expand[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

/* ==================== 底部操作 ==================== */
.essay-card-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 16px 24px 20px;
  padding-top: 13px;
  border-top: 1px dashed #e8eef6;
}

.essay-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.essay-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e6eef7;
  border-radius: 999px;
  padding: 5px 12px;
  background: #f9fcff;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.essay-action svg {
  height: 14px;
  width: 14px;
}

.essay-action:hover {
  transform: translateY(-1px);
}

.essay-like:hover {
  border-color: #f0d4dc;
  background: #fff4f7;
  color: #b45f74;
}

.essay-like.is-bumping .essay-heart {
  animation: essay-heart-pop 0.46s ease;
}

.essay-comment-toggle:hover,
.essay-comment-toggle.is-active {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.essay-action-count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.essay-like-error {
  color: #c26a7c;
  font-size: 10.5px;
}

.essay-card-length {
  color: #a5b2c1;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

/* ==================== Markdown 正文排版 ==================== */
.essay-md {
  color: #526274;
  font-size: 14px;
  line-height: 1.9;
  letter-spacing: 0.01em;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.essay-md :deep(p) {
  margin: 0.72em 0;
}

.essay-md :deep(h1),
.essay-md :deep(h2),
.essay-md :deep(h3),
.essay-md :deep(h4) {
  margin: 1.1em 0 0.45em;
  color: #3c5166;
  font-family: 'huoxie', sans-serif;
  font-weight: normal;
  line-height: 1.5;
  letter-spacing: 0.03em;
}

.essay-md :deep(h1) {
  font-size: 21px;
}

.essay-md :deep(h2) {
  padding-left: 0.7rem;
  border-left: 3px solid var(--accent);
  font-size: 18px;
}

.essay-md :deep(h3) {
  font-size: 16px;
}

.essay-md :deep(h4) {
  font-size: 14.5px;
}

.essay-md :deep(a) {
  color: var(--accent-strong);
  text-decoration: underline;
  text-decoration-color: var(--accent-line);
  text-underline-offset: 3px;
}

.essay-md :deep(a:hover) {
  text-decoration-color: currentColor;
}

.essay-md :deep(strong) {
  color: #3d5268;
  font-weight: 600;
}

.essay-md :deep(em) {
  color: #465a6f;
}

.essay-md :deep(ul),
.essay-md :deep(ol) {
  margin: 0.72em 0;
  padding-left: 1.45em;
}

.essay-md :deep(ul) {
  list-style: disc;
}

.essay-md :deep(ol) {
  list-style: decimal;
}

.essay-md :deep(li) {
  margin: 0.26em 0;
}

.essay-md :deep(li::marker) {
  color: var(--accent-strong);
}

.essay-md :deep(blockquote) {
  margin: 0.9em 0;
  padding: 0.55em 0.9em;
  border-left: 3px solid var(--accent);
  border-radius: 0 9px 9px 0;
  background: var(--accent-soft);
  color: #64748b;
}

.essay-md :deep(blockquote p) {
  margin: 0;
}

.essay-md :deep(code) {
  border-radius: 5px;
  padding: 1px 5px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}

.essay-md :deep(pre) {
  margin: 0.9em 0;
  overflow-x: auto;
  border-radius: 10px;
  padding: 12px 14px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12.5px;
  line-height: 1.7;
}

.essay-md :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.essay-md :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.9em auto;
  border: 1px solid #e8eff7;
  border-radius: 10px;
}

.essay-md :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  margin: 0.9em 0;
  border-collapse: collapse;
  font-size: 12.5px;
}

.essay-md :deep(th),
.essay-md :deep(td) {
  border: 1px solid #e4edf6;
  padding: 6px 9px;
  text-align: left;
}

.essay-md :deep(th) {
  background: var(--accent-soft);
  color: #475569;
  font-weight: 600;
}

.essay-md :deep(hr) {
  margin: 1.4em 0;
  border: 0;
  border-top: 1px dashed #e3ebf4;
}

/* ==================== 评论面板过渡 ==================== */
.essay-comment-panel-enter-active,
.essay-comment-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.essay-comment-panel-enter-from,
.essay-comment-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes essay-heart-pop {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.45) rotate(-8deg);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* ==================== 暗色模式 ==================== */
.dark .essay-accent-0 {
  --accent: #8ecbff;
  --accent-strong: #c4e6fb;
  --accent-soft: rgba(95, 166, 221, 0.16);
  --accent-line: rgba(95, 166, 221, 0.24);
  --accent-glow: rgba(95, 166, 221, 0.18);
}

.dark .essay-accent-1 {
  --accent: #a8dcf5;
  --accent-strong: #d6f0ff;
  --accent-soft: rgba(70, 150, 190, 0.16);
  --accent-line: rgba(100, 180, 210, 0.24);
  --accent-glow: rgba(70, 150, 190, 0.18);
}

.dark .essay-accent-2 {
  --accent: #c8b5e8;
  --accent-strong: #e0d2f5;
  --accent-soft: rgba(150, 125, 195, 0.16);
  --accent-line: rgba(160, 140, 205, 0.24);
  --accent-glow: rgba(150, 125, 195, 0.18);
}

.dark .essay-accent-3 {
  --accent: #e8c39a;
  --accent-strong: #f4ddc0;
  --accent-soft: rgba(190, 145, 95, 0.16);
  --accent-line: rgba(190, 155, 110, 0.24);
  --accent-glow: rgba(190, 145, 95, 0.18);
}

.dark .essay-accent-4 {
  --accent: #efb6c1;
  --accent-strong: #f8d7dd;
  --accent-soft: rgba(195, 120, 140, 0.16);
  --accent-line: rgba(195, 135, 150, 0.24);
  --accent-glow: rgba(195, 120, 140, 0.18);
}

.dark .essay-date-chip {
  box-shadow: 0 10px 22px -20px rgba(0, 0, 0, 0.9);
}

.dark .essay-dot {
  border-color: #0b1320;
}

.dark .essay-card {
  border-color: #223047;
  background: linear-gradient(180deg, #101b2c 0%, #0c1522 100%);
  box-shadow:
    0 20px 46px -36px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.dark .essay-card-title {
  color: #e2e8f0;
}

.dark .essay-card-no,
.dark .essay-card-length {
  color: #5d7089;
}

.dark .essay-body {
  color: #b3c1d1;
}

.dark .essay-fade {
  background: linear-gradient(180deg, rgba(12, 21, 34, 0), #0c1522 86%);
}

.dark .essay-expand {
  color: var(--accent);
}

.dark .essay-card-foot {
  border-top-color: #223047;
}

.dark .essay-action {
  border-color: #26364d;
  background: rgba(17, 28, 44, 0.8);
  color: #94a3b8;
}

.dark .essay-like:hover {
  border-color: rgba(220, 120, 145, 0.35);
  background: rgba(150, 60, 80, 0.16);
  color: #f3a9b8;
}

.dark .essay-comment-toggle:hover,
.dark .essay-comment-toggle.is-active {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent);
}

.dark .essay-like-error {
  color: #f0a0b0;
}

.dark .essay-md {
  color: #b3c1d1;
}

.dark .essay-md :deep(h1),
.dark .essay-md :deep(h2),
.dark .essay-md :deep(h3),
.dark .essay-md :deep(h4) {
  color: #e0e8f2;
}

.dark .essay-md :deep(strong) {
  color: #dbe4ee;
}

.dark .essay-md :deep(em) {
  color: #c8d4e1;
}

.dark .essay-md :deep(blockquote) {
  color: #94a3b8;
}

.dark .essay-md :deep(img) {
  border-color: #26364d;
}

.dark .essay-md :deep(th),
.dark .essay-md :deep(td) {
  border-color: #26364d;
}

.dark .essay-md :deep(th) {
  color: #cbd5e1;
}

.dark .essay-md :deep(hr) {
  border-top-color: #223047;
}

/* ==================== 小屏 ==================== */
@media (max-width: 900px) {
  .essay-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .essay-date-col,
  .essay-track {
    display: none;
  }

  .essay-card-head {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 7px;
    padding: 19px 18px 0;
  }

  .essay-mobile-date {
    display: inline-flex;
  }

  .essay-card-meta {
    padding-top: 0;
  }

  .essay-body-shell {
    padding: 0 18px;
  }

  .essay-fade {
    right: 18px;
    left: 18px;
  }

  .essay-expand {
    margin-right: 18px;
    margin-left: 18px;
  }

  .essay-card-foot {
    margin: 14px 18px 18px;
  }

  .essay-card-title {
    font-size: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .essay-body,
  .essay-action,
  .essay-expand svg {
    transition: none;
  }

  .essay-like.is-bumping .essay-heart {
    animation: none;
  }

  .essay-comment-panel-enter-active,
  .essay-comment-panel-leave-active {
    transition: none;
  }
}
</style>
