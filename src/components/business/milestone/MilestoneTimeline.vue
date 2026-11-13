<template>
  <section class="relative">
    <!-- ========== 小标题 + 当前年份 + 左右按钮 ========== -->
    <div class="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p
          class="inline-flex items-center gap-2 font-[huoxie] text-[10px] tracking-[0.35em] text-amber-200/60"
        >
          <span class="h-px w-6 bg-gradient-to-r from-transparent to-amber-500/70" />
          TIMELINE · 时光轴
        </p>
        <p class="mt-2 max-w-md text-[13px] leading-6 text-slate-400">
          沿着这条金色的光线横向走，每一站都是一篇写过的文章。
        </p>
      </div>

      <div class="flex items-end justify-between gap-6 sm:justify-end">
        <div class="text-left sm:text-right">
          <p class="font-[huoxie] text-[9px] tracking-[0.28em] text-slate-500">NOW READING</p>
          <p class="mt-1 font-[huoxie] text-[32px] leading-none tracking-[0.08em] text-amber-300">
            {{ activeYear }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="group grid h-10 w-10 place-items-center rounded-full border border-amber-100/10 bg-slate-900/60 text-amber-200 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-35"
            :disabled="!canPrev"
            aria-label="查看上一个节点"
            @click="scrollByStep(-1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M15 18 9 12l6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            class="group grid h-10 w-10 place-items-center rounded-full border border-amber-100/10 bg-slate-900/60 text-amber-200 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-35"
            :disabled="!canNext"
            aria-label="查看下一个节点"
            @click="scrollByStep(1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            >
              <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 横向滚动的舞台 ========== -->
    <div
      ref="scrollerRef"
      class="milestone-scroller relative select-none overflow-x-auto overflow-y-hidden pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/35"
      role="region"
      aria-label="文章时光轴，可左右拖动或使用方向键浏览"
      tabindex="0"
      @scroll.passive="updateScroll"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
      @click.capture="handleClickCapture"
      @keydown.left.prevent="scrollByStep(-1)"
      @keydown.right.prevent="scrollByStep(1)"
    >
      <div
        class="relative mx-auto"
        :style="{ width: `${trackWidth}px`, height: `${TRACK_HEIGHT}px` }"
      >
        <!-- 时光线本体：一条横贯左右的金线，上面有两束缓慢流动的光 -->
        <div class="pointer-events-none absolute inset-x-0 z-0" :style="{ top: `${TRACK_Y}px` }">
          <div
            class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent"
          />
          <div
            class="absolute inset-x-0 -top-[2px] h-[5px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-[2px]"
          />
          <span class="beam beam-a" />
          <span class="beam beam-b" />
          <span
            class="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 rounded-[2px] bg-amber-500/45"
          />
          <span
            class="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 rounded-[2px] bg-amber-500/45"
          />
        </div>

        <template v-for="(article, index) in articles" :key="article.id">
          <!-- 竖直连接线：把卡片和时光线上的节点缝在一起 -->
          <span
            class="absolute z-10 w-px"
            :class="
              isUp(index)
                ? 'bg-gradient-to-b from-amber-300/0 via-amber-300/20 to-amber-300/60'
                : 'bg-gradient-to-b from-amber-300/60 via-amber-300/20 to-amber-300/0'
            "
            :style="{
              left: `${nodeX(index)}px`,
              top: `${isUp(index) ? TRACK_Y - STEM_HEIGHT : TRACK_Y}px`,
              height: `${STEM_HEIGHT}px`,
            }"
          />

          <!-- 连接线与卡片相接处的小光点 -->
          <span
            class="absolute z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500/65 shadow-[0_0_9px_rgba(245,185,66,0.85)]"
            :style="{
              left: `${nodeX(index)}px`,
              top: `${isUp(index) ? TRACK_Y - STEM_HEIGHT : TRACK_Y + STEM_HEIGHT}px`,
            }"
          />

          <!-- 文章卡片：绝对定位在节点正上方或正下方，自然形成左右交叉 -->
          <div
            v-reveal="Math.min(index, 5) * 70"
            class="absolute z-10"
            :style="
              isUp(index)
                ? {
                    left: `${cardLeft(index)}px`,
                    bottom: `${TRACK_HEIGHT - TRACK_Y + STEM_HEIGHT}px`,
                    width: `${CARD_WIDTH}px`,
                  }
                : {
                    left: `${cardLeft(index)}px`,
                    top: `${TRACK_Y + STEM_HEIGHT}px`,
                    width: `${CARD_WIDTH}px`,
                  }
            "
          >
            <MilestoneCard :article="article" :side="isUp(index) ? 'up' : 'down'" />
          </div>

          <!-- 年份只在“跨年”的节点显示，避免每个节点都堆一个年份 -->
          <div
            v-if="showYear(index)"
            class="pointer-events-none absolute z-10 flex items-baseline gap-1.5 transition-opacity duration-300"
            :class="index === activeIndex ? 'opacity-100' : 'opacity-55'"
            :style="{
              left: `${nodeX(index) + 22}px`,
              top: `${isUp(index) ? TRACK_Y + 18 : TRACK_Y - 46}px`,
            }"
          >
            <span
              class="font-[huoxie] text-[24px] leading-none tracking-[0.08em] text-amber-200/85"
            >
              {{ yearOf(index) }}
            </span>
            <span class="font-[huoxie] text-[9px] tracking-[0.22em] text-slate-500"> YEAR </span>
          </div>

          <!-- 节点：旋转 45° 的小金块 + 一圈会呼吸的方框 -->
          <div class="absolute z-20" :style="{ left: `${nodeX(index)}px`, top: `${TRACK_Y}px` }">
            <div
              class="node relative -translate-x-1/2 -translate-y-1/2"
              :class="index === activeIndex ? 'node-active' : ''"
            >
              <span
                class="node-halo absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-[2px]"
              />
              <span
                class="node-ring absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[5px] border border-amber-300/35"
              />
              <span
                class="node-core absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,185,66,0.9)]"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== 底部进度条：看一眼就知道走到哪了 ========== -->
    <div class="mt-5 flex items-center gap-4">
      <span class="font-[huoxie] text-[9px] tracking-[0.22em] text-slate-500"> 起点 </span>
      <div class="relative h-px flex-1 overflow-hidden rounded-full bg-amber-100/10">
        <span
          class="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400 transition-[width] duration-200 ease-out"
          :style="{ width: `${Math.max(2, progress * 100)}%` }"
        />
        <span
          class="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] bg-amber-500 shadow-[0_0_8px_rgba(245,185,66,0.9)] transition-[left] duration-200 ease-out"
          :style="{ left: `${Math.min(98, Math.max(2, progress * 100))}%` }"
        />
      </div>
      <span class="font-[huoxie] text-[9px] tracking-[0.22em] text-slate-500"> 未完 </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MilestoneCard from './MilestoneCard.vue'
import { vReveal } from '@/directives/reveal'
import type { MilestoneArticle } from '@/types'

const props = defineProps<{
  articles: MilestoneArticle[]
}>()

/* ---------------- 舞台尺寸 ----------------
 * 所有卡片和节点都用绝对定位摆放，所以这些数字就是整条时光轴的“骨架”。
 * 调整 CARD_WIDTH / ITEM_WIDTH 就能控制卡片大小和节点疏密。
 */
const CARD_WIDTH = 350
const ITEM_WIDTH = 420
const TRACK_PADDING = 200
const TRACK_Y = 280
const TRACK_HEIGHT = 560
const STEM_HEIGHT = 58

const scrollerRef = ref<HTMLDivElement | null>(null)

const scrollLeft = ref(0)
const maxScroll = ref(0)
const viewportWidth = ref(0)

/** 整条轨道有多宽：首尾各留出一段空隙，第一张和最后一张卡片才不会贴边 */
const trackWidth = computed(
  () => TRACK_PADDING * 2 + Math.max(0, props.articles.length - 1) * ITEM_WIDTH,
)

/** 第 index 个节点在轨道里的横坐标 */
function nodeX(index: number) {
  return TRACK_PADDING + index * ITEM_WIDTH
}

/** 卡片左侧坐标：让卡片中心正好压在节点上 */
function cardLeft(index: number) {
  return nodeX(index) - CARD_WIDTH / 2
}

/** 偶数项放线上方，奇数项放线下方，一上一下形成交叉 */
function isUp(index: number) {
  return index % 2 === 0
}

function yearOf(index: number) {
  return props.articles[index]?.date.slice(0, 4) ?? ''
}

function showYear(index: number) {
  if (index === 0) return true
  return yearOf(index) !== yearOf(index - 1)
}

/* ---------------- 滚动状态 ---------------- */

const progress = computed(() => {
  if (maxScroll.value <= 0) return 0
  return Math.min(1, Math.max(0, scrollLeft.value / maxScroll.value))
})

const canPrev = computed(() => scrollLeft.value > 4)
const canNext = computed(() => scrollLeft.value < maxScroll.value - 4)

/** 离视口中心最近的那个节点，就是当前“读到”的年份 */
const activeIndex = computed(() => {
  if (props.articles.length === 0) return 0

  const center = scrollLeft.value + viewportWidth.value / 2
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  props.articles.forEach((_, index) => {
    const distance = Math.abs(center - nodeX(index))
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }
  })

  return bestIndex
})

const activeYear = computed(() => yearOf(activeIndex.value) || '——')

function updateScroll() {
  const scroller = scrollerRef.value
  if (!scroller) return

  scrollLeft.value = scroller.scrollLeft
  maxScroll.value = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
  viewportWidth.value = scroller.clientWidth
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollByStep(direction: -1 | 1) {
  const scroller = scrollerRef.value
  if (!scroller) return

  scroller.scrollBy({
    left: direction * ITEM_WIDTH * 0.92,
    behavior: scrollBehavior(),
  })
}

/* ---------------- 鼠标拖拽 ----------------
 * 触摸屏直接交给浏览器原生滑动；这里只处理鼠标按住拖动。
 * 注意：指针移动超过阈值后才 setPointerCapture，
 * 否则普通点击也会被“捕获”，文章卡片就点不进去了。
 */
let pointerDown = false
let dragging = false
let dragged = false
let dragStartX = 0
let dragStartLeft = 0
let suppressClickTimer: number | undefined

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === 'touch' || event.button !== 0) return

  const scroller = scrollerRef.value
  if (!scroller) return

  pointerDown = true
  dragging = false
  dragged = false
  dragStartX = event.clientX
  dragStartLeft = scroller.scrollLeft
}

function handlePointerMove(event: PointerEvent) {
  if (!pointerDown) return

  const scroller = scrollerRef.value
  if (!scroller) return

  const distance = event.clientX - dragStartX

  if (!dragging) {
    if (Math.abs(distance) < 5) return
    dragging = true
    dragged = true
    scroller.setPointerCapture(event.pointerId)
    scroller.classList.add('is-dragging')
  }

  scroller.scrollLeft = dragStartLeft - distance
}

function handlePointerUp(event: PointerEvent) {
  if (!pointerDown) return
  pointerDown = false

  if (!dragging) return
  dragging = false

  const scroller = scrollerRef.value
  if (scroller?.hasPointerCapture(event.pointerId)) {
    scroller.releasePointerCapture(event.pointerId)
  }
  scroller?.classList.remove('is-dragging')

  // 拖拽结束时浏览器还会补一个 click，等它冒泡完再解除拦截
  window.clearTimeout(suppressClickTimer)
  suppressClickTimer = window.setTimeout(() => {
    dragged = false
  }, 0)
}

function handleClickCapture(event: MouseEvent) {
  if (!dragged) return
  event.preventDefault()
  event.stopPropagation()
}

/* ---------------- 生命周期 ---------------- */

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScroll()

  if (scrollerRef.value) {
    resizeObserver = new ResizeObserver(updateScroll)
    resizeObserver.observe(scrollerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  window.clearTimeout(suppressClickTimer)
})
</script>

<style scoped>
/* 隐藏原生滚动条：横向拖拽和左右按钮已经足够，视觉上更干净 */
.milestone-scroller {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.milestone-scroller::-webkit-scrollbar {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .milestone-scroller {
    cursor: grab;
  }

  .milestone-scroller.is-dragging {
    cursor: grabbing;
  }
}

/* 流动的光束：用 left 动画从轨道一头跑到另一头 */
.beam {
  position: absolute;
  top: -0.5px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(245, 190, 80, 0.95), transparent);
  filter: blur(0.4px);
  opacity: 0;
  animation: beam-flow 13s linear infinite;
}

.beam-a {
  width: 190px;
}

.beam-b {
  width: 90px;
  animation-duration: 19s;
  animation-delay: -7s;
}

@keyframes beam-flow {
  0% {
    left: -10%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 105%;
    opacity: 0;
  }
}

/* 节点外圈呼吸：只动 box-shadow，不碰 transform，避免和居中的位移打架 */
.node-ring {
  animation: node-ring-pulse 3.6s ease-in-out infinite;
}

@keyframes node-ring-pulse {
  0%,
  100% {
    opacity: 0.5;
    box-shadow: 0 0 0 0 rgba(245, 185, 66, 0.28);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 0 8px rgba(245, 185, 66, 0);
  }
}

/* 当前节点更亮一点，像刚被手指按住的站点 */
.node-active .node-core {
  box-shadow:
    0 0 0 3px rgba(245, 185, 66, 0.16),
    0 0 18px rgba(245, 185, 66, 0.95);
}

@media (prefers-reduced-motion: reduce) {
  .beam,
  .node-ring {
    animation: none;
  }
}
</style>
