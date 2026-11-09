<template>
  <section class="relative h-[600px] w-full overflow-hidden" aria-label="游记封面">
    <img
      src="@/assets/images/demoTextImages/demo4.jpg"
      alt=""
      class="h-full w-full object-cover object-center"
    />

    <div
      class="pointer-events-none absolute inset-0 bg-[rgba(45,60,85,0.45)]"
      aria-hidden="true"
    ></div>

    <HomeLeafParticles />
    <div
      v-reveal.fade="120"
      class="absolute inset-x-0 top-[45%] z-10 -translate-y-1/2 px-4 text-center"
    >
      <h1
        class="font-[huoxie] text-[34px] leading-tight text-white [text-shadow:0_4px_22px_rgba(0,0,0,0.55)] sm:text-[48px]"
      >
        游记
      </h1>

      <p class="mx-auto mt-4 max-w-[560px] text-[13px] leading-6 text-white/65 sm:text-[14px]">
        旅游走到哪里，哪里的回忆就装进这里。当然，还记录了一些其它的东西~
      </p>

      <p
        class="mt-4 flex items-center justify-center gap-3 text-[11px] tracking-[0.16em] text-white/45"
      >
        <span>PHOTOS</span>
        <span class="h-3 w-px bg-white/20"></span>
        <span class="tracking-normal">
          共收录
          <span class="mx-1 font-[huoxie] text-[18px] leading-none text-white/90">{{ total }}</span>
          张图片
        </span>
      </p>
    </div>

    <canvas
      ref="canvasRef"
      class="pointer-events-none absolute bottom-0 left-0 z-[1] h-[200px] w-full"
      aria-hidden="true"
    ></canvas>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { vReveal } from '@/directives/reveal'
import HomeLeafParticles from '@/components/business/home/HomeLeafParticles.vue'

withDefaults(defineProps<{ total?: number }>(), { total: 0 })

const canvasRef = ref<HTMLCanvasElement | null>(null)

/* ---------------- 底部波浪 ---------------- */

let rafId: number | null = null
let resizeTimer: number | null = null
let waveOffset = 0
let logicalW = 0
let logicalH = 0
let dpr = 1

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
    const grad = ctx.createLinearGradient(0, baseY - waveHeight, 0, logicalH)
    grad.addColorStop(0, 'rgba(5, 10, 18, 0.55)')
    grad.addColorStop(0.55, 'rgba(5, 10, 18, 0.92)')
    grad.addColorStop(1, 'rgba(5, 10, 18, 1)')
    ctx.fillStyle = grad
    ctx.shadowColor = 'rgba(5, 10, 18, 0.9)'
  } else {
    // #f5f8fc：和 TravelNote.vue 的浅色页面底色保持一致
    ctx.fillStyle = 'rgba(245, 248, 252, 0.7)'
    ctx.shadowColor = 'rgba(245, 248, 252, 0.7)'
  }

  ctx.shadowBlur = 60
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = -10
  ctx.fill()
}

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, logicalW, logicalH)

  drawWave(ctx, waveOffset, 22, logicalW, 165, 0)
  drawWave(ctx, waveOffset, 16, logicalW, 172, Math.PI / 2)
  drawWave(ctx, waveOffset, 10, logicalW, 178, Math.PI / 3)

  waveOffset += 0.005
  rafId = requestAnimationFrame(() => draw(ctx))
}

function measureCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  dpr = window.devicePixelRatio || 1
  logicalW = rect.width
  logicalH = rect.height
  canvas.width = logicalW * dpr
  canvas.height = logicalH * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // 用 setTransform 而不是反复 scale，避免同一 context 上变换累乘
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function resizeCanvas() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(measureCanvas, 80)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  measureCanvas()
  window.addEventListener('resize', resizeCanvas)
  rafId = requestAnimationFrame(() => draw(ctx))
})

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
  if (rafId !== null) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
canvas {
  background: transparent;
}
</style>
