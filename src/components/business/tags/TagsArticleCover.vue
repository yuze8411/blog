<template>
  <div class="relative h-[520px] w-full overflow-hidden sm:h-[600px]">
    <img
      src="@/assets/images/demoTextImages/demo4.jpg"
      alt=""
      class="h-full w-full object-cover object-center"
    />

    <!-- 压暗一点，保证白色文字可读 -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1a33]/45 via-[#0b1a33]/20 to-[#0b1a33]/50"
    ></div>

    <HomeLeafParticles />

    <!-- 标签信息 -->
    <div
      class="enter-fade-in absolute left-0 top-[44%] z-10 flex w-full -translate-y-1/2 flex-col items-center px-4 text-center"
      style="animation-delay: 0.15s"
    >
      <p class="font-[huoxie] text-[12px] tracking-[0.42em] text-white/70 sm:text-[13px]">
        TAG ARCHIVE
      </p>

      <h1
        class="mt-3 flex max-w-[92%] items-center gap-3 font-[huoxie] text-[34px] leading-tight text-white [text-shadow:0_5px_18px_rgba(0,0,0,0.85)] sm:text-[46px]"
      >
        <IconFont name="biaoqian1" class="shrink-0 text-[0.8em]" />
        <span class="overflow-hidden text-ellipsis whitespace-nowrap" :title="tag">#{{ tag }}</span>
        <span class="text-white/60">|</span>
        <span class="text-[0.78em] text-white/90">{{ total }}</span>
      </h1>

      <RouterLink
        to="/tags"
        class="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 font-[huoxie] text-[13px] text-white/85 backdrop-blur transition-all duration-300 hover:border-white/60 hover:bg-white/20"
      >
        <span class="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        返回标签墙
      </RouterLink>
    </div>

    <!-- 底部波浪，与下方内容区衔接 -->
    <canvas
      ref="canobj"
      class="pointer-events-none absolute bottom-0 left-0 h-[200px] w-full"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import HomeLeafParticles from '@/components/business/home/HomeLeafParticles.vue'

withDefaults(
  defineProps<{
    tag: string
    total?: number
  }>(),
  { total: 0 },
)

const canobj = ref<HTMLCanvasElement | null>(null)

let rafId: number | null = null
let offset = 0
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
    // 暗色主题：波浪换成内容区底色，与下方无缝衔接
    const grad = ctx.createLinearGradient(0, baseY - waveHeight, 0, logicalH)
    grad.addColorStop(0, 'rgba(3, 7, 18, 0.55)')
    grad.addColorStop(0.55, 'rgba(3, 7, 18, 0.92)')
    grad.addColorStop(1, 'rgba(3, 7, 18, 1)')
    ctx.fillStyle = grad
    ctx.shadowColor = 'rgba(3, 7, 18, 0.9)'
  } else {
    // 浅色主题：波浪与内容区底色一致
    ctx.fillStyle = 'rgba(250, 250, 250, 0.72)'
    ctx.shadowColor = 'rgba(250, 250, 250, 0.7)'
  }

  ctx.shadowBlur = 60
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = -10
  ctx.fill()
}

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, logicalW, logicalH)

  drawWave(ctx, offset, 22, logicalW, 165, 0)
  drawWave(ctx, offset, 16, logicalW, 172, Math.PI / 2)
  drawWave(ctx, offset, 10, logicalW, 178, Math.PI / 3)

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

<style scoped></style>
