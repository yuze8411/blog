<template>
  <div
    ref="container"
    class="relative h-[100vh] w-[100vw] overflow-hidden bg-slate-950"
    @wheel.prevent="handleWheel"
    @scroll.passive="requestPageMotion"
  >
    <div class="fixed top-0 left-0 overflow-hidden *:z-0 h-[100vh] w-[100vw]">
      <video autoplay muted loop playsinline class="h-full w-full object-cover">
        <source src="@/assets/images/星空_3.mp4" type="video/mp4" />
      </video>
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/35 to-slate-950/80"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(2,6,23,0.42)_100%)]"
      />
    </div>
    <AboutDot @myscroll="myScorll" :index="index"></AboutDot>

    <!-- 前两页参与滚出效果，第三页内容还没定，先保持原样 -->
    <div ref="pageOne" class="about-page-slot">
      <AboutContentMydata></AboutContentMydata>
    </div>
    <div ref="pageTwo" class="about-page-slot">
      <AboutContentIntro></AboutContentIntro>
    </div>
    <div ref="pageThree" class="about-page-slot">
      <AboutContentPlan></AboutContentPlan>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)
const pageOne = ref<HTMLDivElement | null>(null)
const pageTwo = ref<HTMLDivElement | null>(null)
const pageThree = ref<HTMLDivElement | null>(null)
const index = ref(0)

// 一屏滚动用时 0.75s，比浏览器自带的 smooth 更慢、更从容
const SCROLL_DURATION = 750
// 冷却时间略长于动画，避免触控板惯性在动画快结束时又翻一屏
const WHEEL_COOLDOWN = SCROLL_DURATION + 100

let lastWheelTime = 0
let animationFrame = 0
let motionFrame = 0
let reducedMotion = false

function easeInOutCubic(t: number) {
  // 控制滚动速度
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function scrollToY(targetTop: number) {
  // 实现滚动时间控制
  const el = container.value
  if (!el) return

  cancelAnimationFrame(animationFrame)

  const maxTop = Math.max(0, el.scrollHeight - el.clientHeight)
  const target = Math.max(0, Math.min(maxTop, targetTop))
  const start = el.scrollTop
  const distance = target - start
  if (distance === 0) return

  const startTime = performance.now()

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / SCROLL_DURATION)
    el.scrollTop = start + distance * easeInOutCubic(progress)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step)
    }
  }

  animationFrame = requestAnimationFrame(step)
}

function handleWheel(event: WheelEvent) {
  //实现滚动滚轮时的滑动，结合上面的函数
  if (event.deltaY === 0) return

  const now = performance.now()
  if (now - lastWheelTime < WHEEL_COOLDOWN) return
  lastWheelTime = now

  const nextIndex = Math.max(0, Math.min(2, index.value + (event.deltaY > 0 ? 1 : -1)))
  if (nextIndex === index.value) return

  index.value = nextIndex
  scrollToY(nextIndex * window.innerHeight)
}

function myScorll(targetIndex: number) {
  // 点击跳转时的回调
  const nextIndex = Math.max(0, Math.min(2, targetIndex))
  index.value = nextIndex
  // 点击圆点后也进入冷却，防止动画途中滚轮又插一脚
  lastWheelTime = performance.now()
  scrollToY(nextIndex * window.innerHeight)
}

/**
 * 每一页根据自己离“当前视口”的距离做淡出、轻微缩小和位移。
 * 只作用于前两页的容器，第三页不会被动到。
 */
function updatePageMotion() {
  motionFrame = 0

  const el = container.value
  if (!el || reducedMotion) return

  const viewport = el.clientHeight || window.innerHeight
  const scrollTop = el.scrollTop
  const slots = [pageOne.value, pageTwo.value, pageThree.value]

  slots.forEach((slot, pageIndex) => {
    if (!slot) return

    // 0 = 正好停在这一页；1 = 已经滚出一整屏；-1 = 还在下方一整屏
    const offset = Math.max(-1, Math.min(1, (scrollTop - pageIndex * viewport) / viewport))
    const distance = Math.abs(offset)

    slot.style.opacity = String(1 - distance * 0.55)
    slot.style.transform = `translate3d(0, ${offset * -34}px, 0) scale(${1 - distance * 0.035})`
  })
}

function requestPageMotion() {
  if (motionFrame) return
  motionFrame = requestAnimationFrame(updatePageMotion)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updatePageMotion()
  window.addEventListener('resize', requestPageMotion)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(motionFrame)
  window.removeEventListener('resize', requestPageMotion)
})
</script>

<style scoped>
.about-page-slot {
  transform-origin: center center;
  will-change: transform, opacity;
}
</style>
