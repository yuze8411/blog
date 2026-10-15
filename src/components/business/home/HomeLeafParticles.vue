<template>
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

/* ---------- 叶子精灵：预渲染一次带辉光的枫红叶子，绘制时只做 drawImage ---------- */
const SPRITE_SIZE = 96 // 精灵画布边长
const LEAF_HALF_H = 20 // 精灵中叶子的半高
const LEAF_HALF_W = 13 // 精灵中叶子的半宽

const MAX_LEAVES = 100 // 同屏最多几片（“别太多”）
const TOP_SPAWN_RATIO = 0.4 // 从顶部左半边出现的比例，其余从左侧边框出现

interface Leaf {
  x0: number
  y0: number
  cx: number // 弧线控制点
  cy: number
  x1: number
  y1: number
  t: number // 0 -> 1 的滑动进度
  speed: number // 每秒进度
  duration: number
  size: number // 初始半高（px）
  rot: number
  spin: number
  wobbleAmp: number
  wobbleFreq: number
  wobblePhase: number
}

let sprite: HTMLCanvasElement | null = null
let ctx2d: CanvasRenderingContext2D | null = null
let resizeObserver: ResizeObserver | null = null
let rafId: number | null = null
let leaves: Leaf[] = []

let width = 0
let height = 0
let dpr = 1
let lastTime = 0
let spawnTimer = 0
let seeded = false

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function leafPath(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - LEAF_HALF_H) // 叶尖
  ctx.bezierCurveTo(
    cx + LEAF_HALF_W * 1.15,
    cy - LEAF_HALF_H * 0.4,
    cx + LEAF_HALF_W * 0.8,
    cy + LEAF_HALF_H * 0.45,
    cx,
    cy + LEAF_HALF_H, // 叶柄
  )
  ctx.bezierCurveTo(
    cx - LEAF_HALF_W * 0.8,
    cy + LEAF_HALF_H * 0.45,
    cx - LEAF_HALF_W * 1.15,
    cy - LEAF_HALF_H * 0.4,
    cx,
    cy - LEAF_HALF_H,
  )
  ctx.closePath()
}

function createLeafSprite(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SPRITE_SIZE
  const ctx = canvas.getContext('2d')!
  const c = SPRITE_SIZE / 2

  // 外发光：叠加三层模糊，做出“发光”的枫红光晕
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glows = [
    { blur: 10, color: 'rgba(255, 122, 82, 0.85)' },
    { blur: 17, color: 'rgba(255, 72, 46, 0.55)' },
    { blur: 24, color: 'rgba(226, 44, 30, 0.35)' },
  ]
  for (const glow of glows) {
    ctx.shadowColor = glow.color
    ctx.shadowBlur = glow.blur
    ctx.fillStyle = glow.color
    leafPath(ctx, c, c)
    ctx.fill()
  }
  ctx.restore()

  // 叶身：枫红渐变
  const grad = ctx.createLinearGradient(
    c - LEAF_HALF_W,
    c - LEAF_HALF_H,
    c + LEAF_HALF_W,
    c + LEAF_HALF_H,
  )
  grad.addColorStop(0, '#ff9a6b')
  grad.addColorStop(0.45, '#ef4526')
  grad.addColorStop(1, '#b81a10')
  ctx.fillStyle = grad
  leafPath(ctx, c, c)
  ctx.fill()

  // 主叶脉
  ctx.strokeStyle = 'rgba(255, 214, 196, 0.5)'
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(c, c - LEAF_HALF_H + 3)
  ctx.lineTo(c, c + LEAF_HALF_H - 1)
  ctx.stroke()

  return canvas
}

/* --------------------------------- 粒子 --------------------------------- */
function createLeaf(w: number, h: number, startT = 0): Leaf {
  const x1 = w + rand(20, 140) // 终点在右边框外
  let x0: number
  let y0: number
  let y1: number

  if (Math.random() < TOP_SPAWN_RATIO) {
    // 顶部左半边：从上方边框外落下来
    x0 = rand(0, 0.5 * w)
    y0 = -rand(20, 120)
    y1 = rand(0.25 * h, 0.95 * h) // 右侧随机高度，一定在起点下方
  } else {
    // 左侧边框外：随机高度滑入
    x0 = -rand(20, 140)
    y0 = rand(-0.02 * h, 0.6 * h)
    y1 = Math.min(h * 1.05, y0 + rand(0.18 * h, 0.62 * h))
  }

  const duration = rand(6.5, 10.5)

  return {
    x0,
    y0,
    x1,
    y1,
    // 控制点相对连线中点往下拉，形成弧形滑落的轨迹
    cx: (x0 + x1) / 2 + rand(-0.07, 0.07) * w,
    cy: (y0 + y1) / 2 + rand(0.1, 0.28) * h,
    t: startT,
    duration,
    speed: 1 / duration,
    size: rand(4.2, 7.6), // 初始就小一点
    rot: rand(0, Math.PI * 2),
    spin: rand(-0.7, 0.7),
    wobbleAmp: rand(5, 15), // 飘落的轻微抖动
    wobbleFreq: rand(0.5, 1.1),
    wobblePhase: rand(0, Math.PI * 2),
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
  const t = leaf.t
  const inv = 1 - t

  // 贝塞尔弧线上的位置 + 轻微上下飘动
  const x = inv * inv * leaf.x0 + 2 * inv * t * leaf.cx + t * t * leaf.x1
  const baseY = inv * inv * leaf.y0 + 2 * inv * t * leaf.cy + t * t * leaf.y1
  const y = baseY + Math.sin(t * Math.PI * 2 * leaf.wobbleFreq + leaf.wobblePhase) * leaf.wobbleAmp

  const size = leaf.size * (1 - 0.8 * t) // 越滑越小
  const scale = size / LEAF_HALF_H
  const half = (SPRITE_SIZE * scale) / 2
  const alpha = Math.max(0, Math.min(1, t / 0.06) * Math.min(1, inv / 0.12))

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(leaf.rot + leaf.spin * t * leaf.duration)
  ctx.drawImage(sprite!, -half, -half, half * 2, half * 2)
  ctx.restore()
}

function frame(now: number) {
  rafId = requestAnimationFrame(frame)
  const ctx = ctx2d
  if (!ctx || !sprite || width <= 0 || height <= 0) {
    lastTime = now
    return
  }

  const dt = Math.min((now - lastTime) / 1000 || 0, 0.05)
  lastTime = now

  // 左侧源源不断滑出
  spawnTimer -= dt
  if (spawnTimer <= 0) {
    if (leaves.length < MAX_LEAVES) leaves.push(createLeaf(width, height))
    spawnTimer = rand(0.45, 0.95)
  }

  ctx.clearRect(0, 0, width, height)

  for (let i = leaves.length - 1; i >= 0; i--) {
    const leaf = leaves[i]
    if (!leaf) continue
    leaf.t += leaf.speed * dt
    if (leaf.t >= 1) {
      leaves.splice(i, 1) // 滑出右侧边框后消失
      continue
    }
    drawLeaf(ctx, leaf)
  }
}

/* --------------------------------- 尺寸 --------------------------------- */
function applySize() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const nextW = rect.width
  const nextH = rect.height
  const nextDpr = window.devicePixelRatio || 1
  if (nextW === width && nextH === height && nextDpr === dpr) return

  // 已有粒子按比例跟随新尺寸，避免 resize 时整屏重来
  if (width > 0 && height > 0 && nextW > 0 && nextH > 0) {
    const sx = nextW / width
    const sy = nextH / height
    for (const leaf of leaves) {
      leaf.x0 *= sx
      leaf.cx *= sx
      leaf.x1 *= sx
      leaf.y0 *= sy
      leaf.cy *= sy
      leaf.y1 *= sy
    }
  }

  width = nextW
  height = nextH
  dpr = nextDpr
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx2d = ctx

  // 首屏先铺几片，别一开始空荡荡
  if (!seeded && width > 0 && height > 0) {
    seeded = true
    for (let i = 0; i < 6; i++) leaves.push(createLeaf(width, height, rand(0, 0.55)))
  }
}

onMounted(() => {
  sprite = createLeafSprite()
  applySize()

  const canvas = canvasRef.value
  if (!canvas) return

  resizeObserver = new ResizeObserver(applySize)
  resizeObserver.observe(canvas)

  rafId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  resizeObserver?.disconnect()
  resizeObserver = null
  leaves = []
  ctx2d = null
  sprite = null
})
</script>
