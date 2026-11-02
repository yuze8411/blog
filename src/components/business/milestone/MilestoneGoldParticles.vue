<template>
  <!-- 一整块画布铺满页面，粒子全部在 canvas 里画，DOM 只留这一个节点 -->
  <canvas ref="canvasRef" class="h-full w-full" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

/** 一颗金色尘埃：dust 是普通光点，star 是偶尔闪过的小星星 */
interface GoldParticle {
  kind: 'dust' | 'star'
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseAlpha: number
  phase: number
  twinkle: number
  sway: number
  swayFreq: number
  rot: number
  spin: number
}

const MAX_PARTICLES = 56
const DUST_SPRITE_SIZE = 64
const STAR_SPRITE_SIZE = 64

let ctx: CanvasRenderingContext2D | null = null
let dustSprite: HTMLCanvasElement | null = null
let starSprite: HTMLCanvasElement | null = null
let particles: GoldParticle[] = []

let width = 0
let height = 0
let dpr = 1
let rafId: number | null = null
let lastTime = 0
let elapsed = 0

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** 把「画一次精灵」封装起来，避免每一帧都重复创建渐变 */
function makeSprite(size: number, draw: (context: CanvasRenderingContext2D, c: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (context) draw(context, size / 2)
  return canvas
}

/** 普通金色尘埃：中心亮、边缘慢慢化开，像被风吹散的烛火余烬 */
function createDustSprite() {
  return makeSprite(DUST_SPRITE_SIZE, (context, c) => {
    const glow = context.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255, 249, 226, 1)')
    glow.addColorStop(0.16, 'rgba(255, 223, 145, 0.95)')
    glow.addColorStop(0.46, 'rgba(245, 181, 61, 0.36)')
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(c, c, c, 0, Math.PI * 2)
    context.fill()
  })
}

/** 十字小星星：数量不多，作为画面里的“眨眼” */
function createStarSprite() {
  return makeSprite(STAR_SPRITE_SIZE, (context, c) => {
    const glow = context.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255, 250, 232, 0.95)')
    glow.addColorStop(0.28, 'rgba(255, 214, 120, 0.42)')
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(c, c, c, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = 'rgba(255, 246, 218, 0.9)'
    context.lineWidth = 1.4
    context.beginPath()
    context.moveTo(c, 7)
    context.lineTo(c, c * 2 - 7)
    context.moveTo(7, c)
    context.lineTo(c * 2 - 7, c)
    context.stroke()

    // 斜向的短光稍微淡一点，星星才有层次
    context.globalAlpha = 0.42
    context.beginPath()
    context.moveTo(18, 18)
    context.lineTo(46, 46)
    context.moveTo(46, 18)
    context.lineTo(18, 46)
    context.stroke()
  })
}

/** 根据屏幕面积决定粒子数量：大屏多一点，手机少一点，别糊成一片 */
function targetCount() {
  return Math.min(MAX_PARTICLES, Math.max(24, Math.round((width * height) / 32000)))
}

function createParticle(seeded = false): GoldParticle {
  const isStar = Math.random() < 0.16

  return {
    kind: isStar ? 'star' : 'dust',
    x: rand(0, width),
    // seeded 为 true 时首屏铺满，否则从屏幕底部慢慢升上来
    y: seeded ? rand(0, height) : height + rand(10, 90),
    vx: rand(-5, 5),
    vy: -rand(8, 26),
    size: isStar ? rand(10, 20) : rand(5, 13),
    baseAlpha: rand(0.26, 0.72),
    phase: rand(0, Math.PI * 2),
    twinkle: rand(0.5, 1.7),
    sway: rand(4, 14),
    swayFreq: rand(0.2, 0.6),
    rot: rand(0, Math.PI * 2),
    spin: rand(-0.35, 0.35),
  }
}

function respawn(particle: GoldParticle) {
  Object.assign(particle, createParticle(false))
}

function ensurePopulation() {
  const target = targetCount()

  while (particles.length < target) particles.push(createParticle(true))
  if (particles.length > target) particles.length = target
}

function drawFrame(now: number) {
  rafId = requestAnimationFrame(drawFrame)

  const context = ctx
  if (!context || !dustSprite || !starSprite || width <= 0 || height <= 0) {
    lastTime = now
    return
  }

  // 夹一下 dt：切回标签页时不会因为时间差太大而“瞬移”
  const dt = Math.min((now - lastTime) / 1000 || 0, 0.05)
  lastTime = now
  elapsed += dt

  context.clearRect(0, 0, width, height)
  // 叠加模式让金色粒子在深色底上真正“发光”，而不是像贴纸一样浮着
  context.globalCompositeOperation = 'lighter'

  for (const particle of particles) {
    // 横向轻微摆动，纵向持续上升，像缓慢飘起的金色尘埃
    particle.x += (particle.vx + Math.sin(elapsed * particle.swayFreq + particle.phase) * particle.sway) * dt
    particle.y += particle.vy * dt
    particle.rot += particle.spin * dt

    // 飘出画面就从底部重新开始，粒子池永远保持活力
    if (particle.y < -40 || particle.x < -50 || particle.x > width + 50) {
      respawn(particle)
    }

    const twinkle = 0.55 + 0.45 * Math.sin(elapsed * particle.twinkle + particle.phase)
    const sprite = particle.kind === 'star' ? starSprite : dustSprite
    const size = particle.size * (0.92 + twinkle * 0.08)

    context.save()
    context.globalAlpha = particle.baseAlpha * twinkle
    context.translate(particle.x, particle.y)
    context.rotate(particle.rot)
    context.drawImage(sprite, -size / 2, -size / 2, size, size)
    context.restore()
  }

  context.globalAlpha = 1
  context.globalCompositeOperation = 'source-over'
}

function applySize() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const nextWidth = rect.width
  const nextHeight = rect.height
  if (nextWidth <= 0 || nextHeight <= 0) return

  const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
  if (nextWidth === width && nextHeight === height && nextDpr === dpr) return

  // 尺寸变化时让已有粒子按比例跟着走，不至于整屏突然重排
  if (width > 0 && height > 0) {
    const scaleX = nextWidth / width
    const scaleY = nextHeight / height
    for (const particle of particles) {
      particle.x *= scaleX
      particle.y *= scaleY
    }
  }

  width = nextWidth
  height = nextHeight
  dpr = nextDpr

  // 物理像素放大，CSS 像素不变，这样高分屏也不会糊
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  const context = canvas.getContext('2d')
  if (context) {
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx = context
  }

  ensurePopulation()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  dustSprite = createDustSprite()
  starSprite = createStarSprite()
  applySize()

  const canvas = canvasRef.value
  if (!canvas) return

  resizeObserver = new ResizeObserver(applySize)
  resizeObserver.observe(canvas)

  rafId = requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null

  particles = []
  ctx = null
  dustSprite = null
  starSprite = null
})
</script>
