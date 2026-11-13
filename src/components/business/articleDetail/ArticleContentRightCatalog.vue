<template>
  <aside
    class="w-full rounded-xl border border-gray-200/80 bg-white/85 p-4 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/85"
  >
    <div class="flex items-center">
      <h2 class="text-[22px] tracking-[2px] text-gray-900 dark:text-gray-100 font-[huoxie]">
        目录
      </h2>

      <button
        type="button"
        class="group relative ml-auto grid h-7 w-7 place-items-center rounded-full"
        title="回到顶部"
        aria-label="回到顶部"
        @click="backToTop"
      >
        <svg class="absolute h-7 w-7 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            class="text-sky-500 transition-[stroke-dashoffset] duration-150 ease-out dark:text-sky-400"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="CIRCUMFERENCE * (1 - progress)"
          />
        </svg>
        <span
          v-if="showArrow"
          class="relative text-[12px] leading-none text-gray-400 transition-colors group-hover:text-sky-500 dark:text-gray-500 dark:group-hover:text-sky-400"
        >
          ↑
        </span>
        <span
          v-else
          class="relative text-[10px] leading-none tabular-nums text-gray-400 transition-colors group-hover:text-sky-500 dark:text-gray-500 dark:group-hover:text-sky-400"
        >
          {{ progressPercent }}
        </span>
      </button>
    </div>

    <div class="mt-3 border-t border-gray-100 dark:border-gray-800"></div>

    <nav
      v-if="toc.length"
      ref="navRef"
      class="catalog-scroll mt-2 max-h-[calc(100vh-220px)] overflow-y-auto"
      aria-label="文章目录"
    >
      <a
        v-for="(item, index) in toc"
        :key="item.id + '-' + index"
        :href="'#' + item.id"
        class="toc-link"
        :class="{ 'toc-link-active': item.id === activeId }"
        :aria-current="item.id === activeId ? 'location' : undefined"
        @click.prevent="scrollTo(item.id)"
      >
        <span
          class="toc-marker shrink-0"
          :class="`toc-marker-${depth(item.level)}`"
          :style="{ marginLeft: depth(item.level) * 12 + 'px' }"
          aria-hidden="true"
        ></span>
        <span class="line-clamp-2">{{ item.title }}</span>
      </a>
    </nav>

    <p v-else class="mt-3 font-[huoxie] text-[15px] text-gray-700 dark:text-gray-500">
      这篇文章还没有目录，慢慢读吧。
    </p>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ArticleDetailProps, TocItem } from '@/types'
import { extractToc } from '@/utils/markdown'

const props = defineProps<ArticleDetailProps>()

const toc = computed<TocItem[]>(() => extractToc(props.virtureData.content))
const minLevel = computed(() => toc.value.reduce((min, item) => Math.min(min, item.level), 4))

// 0~3 表示相对层级：层级越深，缩进越多、圆点越小
function depth(level: number) {
  return Math.min(Math.max(level - minLevel.value, 0), 3)
}

const CIRCUMFERENCE = 2 * Math.PI * 15
const progress = ref(0)
const progressPercent = computed(() => Math.min(100, Math.round(progress.value * 100)))

const scrollingUp = ref(false)
let lastScrollY = 0

const showArrow = computed(() => scrollingUp.value || progressPercent.value >= 100)

function updateProgress() {
  const y = window.scrollY
  if (y !== lastScrollY) {
    scrollingUp.value = y < lastScrollY
    lastScrollY = y
  }

  const article = document.getElementById('article-content')
  if (!article) return

  const rect = article.getBoundingClientRect()
  const scrollable = rect.height - window.innerHeight
  if (scrollable <= 0) {
    progress.value = rect.top < 0 ? 1 : 0
    return
  }
  const scrolled = -rect.top
  progress.value = Math.min(1, Math.max(0, scrolled / scrollable))
}

// 当前正在阅读的标题，用于目录高亮
const activeId = ref('')
const navRef = ref<HTMLElement | null>(null)
let activeRaf = 0
let articleObserver: MutationObserver | null = null
// 点击目录后平滑滚动期间锁住高亮，避免途经的标题来回闪烁
let lockUntil = 0
let unlockTimer: ReturnType<typeof setTimeout> | undefined

function getHeadings(): HTMLElement[] {
  return toc.value
    .map((item) => document.getElementById(item.id))
    .filter((element): element is HTMLElement => Boolean(element))
}

// 正文重新渲染后尺寸会变，主动再算一次高亮（监听正文是否重新渲染，重新渲染就主动调用updateActive更新高亮）
function observeArticle() {
  const article = document.getElementById('article-content')
  if (!article) return

  articleObserver?.disconnect()
  articleObserver = new MutationObserver(() => {
    if (activeRaf) return
    activeRaf = requestAnimationFrame(() => {
      activeRaf = 0
      updateProgress()
      updateActive()
    })
  })
  articleObserver.observe(article, { childList: true, subtree: true })
}

function updateActive() {
  // lockUtil是用来点击跳转时锁住滚动添加样式的
  if (Date.now() < lockUntil) return
  // 每次滑动都要获取新元素，因为markdown-it可能有两种渲染模式
  const headings = getHeadings()
  if (!headings.length) {
    activeId.value = ''
    return
  }

  // 顶部导航大约 80px，留些余量：标题越过这条线就算“当前标题”
  const threshold = 120
  let current = headings[0]?.id ?? ''
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > threshold) break
    current = heading.id
  }

  // 滚到页面底部时，最后一个标题可能到不了阈值，直接高亮最后一条
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = headings[headings.length - 1]?.id ?? current
  }

  activeId.value = current
}

// 让目录容器里的当前项保持在可视区域，长目录也不会跑出视野
function keepActiveVisible() {
  const nav = navRef.value
  if (!nav) return

  const index = toc.value.findIndex((item) => item.id === activeId.value)
  const anchor = nav.children[index] as HTMLElement | undefined
  if (!anchor) return

  const navRect = nav.getBoundingClientRect()
  const anchorRect = anchor.getBoundingClientRect()
  const top = anchorRect.top - navRect.top + nav.scrollTop
  const bottom = top + anchorRect.height

  if (top < nav.scrollTop) {
    nav.scrollTo({ top: Math.max(0, top - 4), behavior: 'smooth' })
  } else if (bottom > nav.scrollTop + nav.clientHeight) {
    nav.scrollTo({ top: bottom - nav.clientHeight + 4, behavior: 'smooth' })
  }
}

watch(activeId, keepActiveVisible)

function onScroll() {
  updateProgress()
  if (activeRaf) return
  activeRaf = requestAnimationFrame(() => {
    activeRaf = 0
    updateActive()
  })
}

function onResize() {
  updateProgress()
  updateActive()
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollTo(id: string) {
  activeId.value = id
  // 平滑滚动期间先锁住，避免高亮在途经的标题之间来回跳
  lockUntil = Date.now() + 800
  clearTimeout(unlockTimer)
  // 万一没有触发最后一次 scroll（目标已经在当前位置），也要保证能解锁
  unlockTimer = setTimeout(() => {
    lockUntil = 0
    updateActive()
  }, 820)

  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 文章内容变化（例如切换文章）后重新计算高亮
watch(
  () => props.virtureData.content,
  async () => {
    await nextTick()
    updateProgress()
    updateActive()
  },
)

onMounted(() => {
  lastScrollY = window.scrollY
  updateProgress()
  updateActive()
  observeArticle()

  // 用捕获阶段监听 document：页面内任何滚动容器滚动都能接住，
  // 不依赖 window 是否是真正的滚动容器。
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  window.addEventListener('resize', onResize)

  // 正文由 ArticleContentLeft 在 mounted 中写入，等 DOM 更新后再算一次
  nextTick(() => {
    updateProgress()
    updateActive()
  })
})

onUnmounted(() => {
  document.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onResize)
  if (activeRaf) cancelAnimationFrame(activeRaf)
  clearTimeout(unlockTimer)
  articleObserver?.disconnect()
})
</script>

<style scoped>
/* 目录项：当前阅读项用柔和底色 + 深色文字高亮 */
.toc-link {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  color: #64748b;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.toc-link:hover {
  background: rgba(139, 192, 226, 0.08);
  color: #3f719b;
}

.toc-link-active {
  background: rgba(139, 192, 226, 0.14);
  color: #3f719b;
}

.dark .toc-link {
  color: #94a3b8;
}

.dark .toc-link:hover {
  background: rgba(95, 166, 221, 0.08);
  color: #8ecbff;
}

.dark .toc-link-active {
  background: rgba(95, 166, 221, 0.12);
  color: #dbeafe;
}

/* 层级标识：统一用圆点/小方块，靠大小与缩进区分层级 */
.toc-marker {
  --marker: #cbd5e1;

  display: block;
  flex: 0 0 auto;
  background: var(--marker);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.dark .toc-marker {
  --marker: #475569;
}

/* 一级：圆角小方块 */
.toc-marker-0 {
  --marker: #94a3b8;

  width: 7px;
  height: 7px;
  margin-top: 6.5px;
  border-radius: 2px;
}

/* 二级：空心圆 */
.toc-marker-1 {
  width: 6px;
  height: 6px;
  margin-top: 7px;
  border: 1.5px solid var(--marker);
  border-radius: 999px;
  background: transparent;
}

/* 三级：小实心圆 */
.toc-marker-2 {
  width: 5px;
  height: 5px;
  margin-top: 7.5px;
  border-radius: 999px;
}

/* 四级及以下：更小的实心圆 */
.toc-marker-3 {
  width: 3px;
  height: 3px;
  margin-top: 8.5px;
  border-radius: 999px;
}

.dark .toc-marker-0 {
  --marker: #64748b;
}

.toc-link:hover .toc-marker {
  --marker: #7fb4d6;
}

/* 当前项：标识填成雾蓝，并带一圈很淡的光晕 */
.toc-link-active .toc-marker {
  --marker: #6ba3c9;

  border-color: var(--marker);
  background: var(--marker);
  box-shadow: 0 0 0 3px rgba(139, 192, 226, 0.18);
}

.dark .toc-link-active .toc-marker {
  --marker: #8ecbff;

  box-shadow: 0 0 0 3px rgba(142, 203, 255, 0.14);
}

.catalog-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

.catalog-scroll::-webkit-scrollbar {
  width: 3px;
}

.catalog-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background-color: rgba(148, 163, 184, 0.4);
}

.catalog-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
