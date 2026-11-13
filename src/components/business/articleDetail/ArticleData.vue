<template>
  <div class="w-full h-[600px] relative">
    <img
      :src="virtureData.coverUrl || fallbackCover"
      :alt="virtureData.title"
      class="w-full h-full object-cover object-center"
      @error="handleCoverError"
    />
    <HomeLeafParticles />
    <!-- 文章基本信息 -->
    <ArticleDataText :virtureData="virtureData"></ArticleDataText>
    <canvas
      ref="canobj"
      class="absolute bottom-0 left-0 w-full h-[200px] pointer-events-none"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HomeLeafParticles from '../home/HomeLeafParticles.vue'
import type { ArticleDetailProps } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

defineProps<ArticleDetailProps>()

// 封面地址失效时换成本地默认图，避免详情页头图裂开
function handleCoverError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}

const canobj = ref<HTMLCanvasElement | null>(null)

let rafId: number | null = null
let offset = 0 //
let logicalW = 0
let logicalH = 0
let dpr = window.devicePixelRatio || 1
function drawWave(
  ctx: CanvasRenderingContext2D,
  offset: number,
  waveHeight: number,
  waveLength: number,
  baseY: number,
  phase: number,
) {
  ctx.beginPath()
  ctx.moveTo(0, baseY)
  for (let i = 0; i <= logicalW; i++) {
    const rad = (i / waveLength) * Math.PI * 2 + offset + phase
    const y = baseY + Math.sin(rad) * waveHeight
    ctx.lineTo(i, y)
  }
  ctx.lineTo(logicalW, logicalH)
  ctx.lineTo(0, logicalH)
  ctx.closePath()
  if (document.documentElement.classList.contains('dark')) {
    // 暗色主题：波浪换成内容区底色，顶部半透明、底部收严实，和下面的内容区无缝衔接
    const grad = ctx.createLinearGradient(0, baseY - waveHeight, 0, logicalH)
    grad.addColorStop(0, 'rgba(3, 7, 18, 0.55)')
    grad.addColorStop(0.55, 'rgba(3, 7, 18, 0.92)')
    grad.addColorStop(1, 'rgba(3, 7, 18, 1)')
    ctx.fillStyle = grad
    ctx.shadowColor = 'rgba(3, 7, 18, 0.9)'
  } else {
    // 浅色主题：波浪与下方内容区同色，底部能自然衔接
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.72)' // 阴影颜色
  }
  ctx.shadowBlur = 60 // 阴影模糊大小
  ctx.shadowOffsetX = 3 // X偏移
  ctx.shadowOffsetY = -10 // Y偏移
  ctx.fill()
}

function draw(ctx: CanvasRenderingContext2D) {
  let w = canobj.value?.width || 0
  ctx.clearRect(0, 0, logicalW, logicalH)

  drawWave(ctx, offset, 22, w, 165, 0)
  drawWave(ctx, offset, 16, w, 172, Math.PI / 2)
  drawWave(ctx, offset, 10, w, 178, Math.PI / 3)

  offset += 0.005
  rafId = requestAnimationFrame(() => draw(ctx))
}

let resizeTimer: number | null = null
function resizeCanvas() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    const canvas = canobj.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    dpr = window.devicePixelRatio || 1
    logicalW = rect.width
    logicalH = rect.height
    canvas.width = logicalW * dpr
    canvas.height = logicalH * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // setTransform 而非 scale：getContext 返回同一个实例，反复 scale 会累乘
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, 80)
}

onMounted(() => {
  const canvas = canobj.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  rafId = requestAnimationFrame(() => draw(ctx))
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (resizeTimer) clearTimeout(resizeTimer)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
canvas {
  background: transparent;
}
</style>
