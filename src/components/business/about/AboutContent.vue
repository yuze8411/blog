<template>
  <div
    ref="container"
    class="relative h-[100vh] w-[100vw] overflow-hidden"
    @wheel.prevent="handleWheel"
  >
    <AboutDot @myscroll="myScorll" :index="index"></AboutDot>
    <AboutContentMydata></AboutContentMydata>
    <AboutContentIntro></AboutContentIntro>
    <AboutContentWebdata></AboutContentWebdata>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)
const index = ref(0)

// 一屏滚动用时 1s，比浏览器自带的 smooth 更慢、更从容
const SCROLL_DURATION = 750
// 冷却时间略长于动画，避免触控板惯性在动画快结束时又翻一屏
const WHEEL_COOLDOWN = SCROLL_DURATION + 100

let lastWheelTime = 0
let animationFrame = 0

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function scrollToY(targetTop: number) {
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
  const nextIndex = Math.max(0, Math.min(2, targetIndex))
  index.value = nextIndex
  // 点击圆点后也进入冷却，防止动画途中滚轮又插一脚
  lastWheelTime = performance.now()
  scrollToY(nextIndex * window.innerHeight)
}

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped></style>
