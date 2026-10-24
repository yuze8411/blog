<template>
  <div
    ref="rootRef"
    class="not-found relative flex min-h-screen flex-col overflow-hidden bg-[#f5f9ff] text-[#0f172a] transition-colors duration-300 dark:bg-[#050b14] dark:text-[#e8eff8]"
    @pointermove.passive="onPointerMove"
  >
    <!-- ========== 背景 ========== -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="bg-grid absolute inset-0"></div>
      <div
        class="absolute -left-[10%] top-[4%] h-[380px] w-[380px] rounded-full bg-[#7dd3fc]/30 blur-[120px] dark:bg-[#1d4ed8]/20"
      ></div>
      <div
        class="absolute -right-[6%] bottom-[2%] h-[420px] w-[420px] rounded-full bg-[#bae6fd]/50 blur-[130px] dark:bg-[#075985]/35"
      ></div>
      <div class="spotlight absolute inset-0"></div>
      <div class="noise absolute inset-0"></div>
    </div>

    <!-- 背景大号 404：只描边，不抢正文 -->
    <span
      class="ghost-404 pointer-events-none absolute -right-8 top-[8%] hidden select-none font-[xuanzong] sm:block lg:right-[2%] lg:top-[10%]"
      aria-hidden="true"
    >
      404
    </span>

    <!-- ========== 品牌 ========== -->
    <RouterLink
      to="/"
      class="absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-[#2563eb] transition-opacity hover:opacity-65 dark:text-[#dbeafe] sm:left-10 sm:top-8"
    >
      <span
        class="h-2 w-2 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#2563eb] dark:from-[#7dd3fc] dark:to-[#38bdf8]"
      ></span>
      <span class="font-[xuanzong] text-[20px] tracking-[0.18em]">雨落千山</span>
    </RouterLink>

    <!-- 右侧竖排小字 -->
    <span
      class="pointer-events-none absolute right-7 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.42em] text-[#2563eb]/25 [writing-mode:vertical-rl] dark:text-sky-200/20 lg:block"
      aria-hidden="true"
    >
      off the map
    </span>

    <!-- ========== 正文 ========== -->
    <main
      class="relative z-10 flex flex-1 items-center justify-center px-6 pb-16 pt-28 sm:px-10 lg:px-16"
    >
      <div
        class="grid w-full max-w-[1120px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
      >
        <!-- 左侧文案 -->
        <section class="reveal">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.1)] bg-white/70 px-3 py-[6px] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-70"
              ></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500"></span>
            </span>
            <span
              class="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3b82f6] dark:text-sky-300"
            >
              404 · not found
            </span>
          </div>

          <h1
            class="mt-6 text-[42px] leading-[1.15] tracking-[0.01em] sm:text-[54px] lg:text-[60px]"
          >
            这条路，<span class="text-gradient">404 了。</span>
          </h1>

          <p
            class="mt-5 max-w-[430px] text-[15px] leading-[1.95] text-[#475569] dark:text-[#94a3b8]"
          >
            页面可能被山雨冲走，也可能只是地址写错了一个字。
            <br class="hidden sm:block" />
            别急，回到山脚重新出发就好。
          </p>

          <!-- 出错路径 -->
          <div
            class="mt-6 flex max-w-full items-center gap-2 rounded-xl border border-[rgba(37,99,235,0.1)] bg-white/60 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
          >
            <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d9db2]">
              GET
            </span>
            <span class="truncate font-mono text-[12.5px] text-[#2563eb] dark:text-[#bfdbfe]">
              {{ route.fullPath }}
            </span>
            <button
              type="button"
              class="ml-auto shrink-0 rounded-md px-2 py-1 font-mono text-[10.5px] uppercase tracking-wider text-[#3b82f6] transition-colors hover:bg-[#2563eb]/[0.06] dark:text-sky-300 dark:hover:bg-white/[0.06]"
              :title="copied ? '链接已复制' : '复制当前链接'"
              @click="copyPath"
            >
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <RouterLink to="/" class="cta-primary">
              <IconFont name="shouye" class="text-[17px]" />
              回到首页
              <span class="cta-arrow" aria-hidden="true">→</span>
            </RouterLink>

            <button type="button" class="cta-ghost" @click="goBack">
              <span aria-hidden="true">←</span>
              返回上一页
            </button>
          </div>

          <!-- 快捷键提示 -->
          <p
            class="mt-7 flex flex-wrap items-center gap-2 text-[12px] text-[#94a3b8] dark:text-[#64748b]"
          >
            <kbd class="kbd">Enter</kbd>
            <span>回首页</span>
            <span class="opacity-40">/</span>
            <kbd class="kbd">Esc</kbd>
            <span>返回</span>
          </p>
        </section>

        <!-- 右侧请求追踪卡片 -->
        <section class="reveal reveal-delay relative">
          <div
            class="absolute -inset-5 rounded-[34px] bg-gradient-to-br from-[#7dd3fc]/25 via-transparent to-transparent blur-2xl dark:from-[#1d4ed8]/20"
            aria-hidden="true"
          ></div>

          <div class="trace-card relative overflow-hidden rounded-2xl">
            <!-- 卡片标题栏 -->
            <div
              class="flex items-center gap-1.5 border-b border-[rgba(37,99,235,0.08)] px-4 py-3 dark:border-white/[0.07]"
            >
              <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/85"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]/85"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]/85"></span>
              <span class="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8d9db2]">
                route trace
              </span>
              <span
                class="ml-auto flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400"
              >
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                live
              </span>
            </div>

            <!-- 追踪信息 -->
            <dl class="space-y-3.5 px-5 py-6 font-mono text-[12.5px] leading-relaxed">
              <div class="flex gap-4">
                <dt class="trace-key">method</dt>
                <dd class="text-[#2563eb] dark:text-[#dbeafe]">GET</dd>
              </div>
              <div class="flex gap-4">
                <dt class="trace-key">path</dt>
                <dd class="min-w-0 break-all text-[#2563eb] dark:text-[#dbeafe]">
                  {{ route.fullPath }}
                </dd>
              </div>
              <div class="flex gap-4">
                <dt class="trace-key">status</dt>
                <dd class="text-rose-500 dark:text-rose-400">404 Not Found</dd>
              </div>
              <div class="flex gap-4">
                <dt class="trace-key">trace</dt>
                <dd class="text-[#8d9db2]">no route matched</dd>
              </div>
            </dl>

            <!-- 终端行 -->
            <div
              class="mx-5 mb-5 rounded-lg border border-dashed border-[rgba(37,99,235,0.12)] bg-[#2563eb]/[0.025] px-3.5 py-3 font-mono text-[11.5px] text-[#8d9db2] dark:border-white/10 dark:bg-white/[0.025]"
            >
              <span class="text-sky-500 dark:text-sky-400">$</span>
              cd ~/yuluo-qianshan
              <span class="caret" aria-hidden="true"></span>
            </div>

            <!-- 卡片底部 -->
            <div
              class="flex items-center justify-between border-t border-[rgba(37,99,235,0.08)] px-5 py-3 dark:border-white/[0.07]"
            >
              <span class="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#a3b1c2]">
                response time
              </span>
              <span class="font-mono text-[11px] text-[#475569] dark:text-[#94a3b8]">0.4 ms</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const rootRef = ref<HTMLElement | null>(null)
const copied = ref(false)

let copyTimer: ReturnType<typeof setTimeout> | undefined
let pointerRaf = 0

// ---------- 鼠标跟随光斑 ----------
function onPointerMove(event: PointerEvent) {
  if (pointerRaf) return
  const x = event.clientX
  const y = event.clientY

  pointerRaf = requestAnimationFrame(() => {
    pointerRaf = 0
    const el = rootRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${x - rect.left}px`)
    el.style.setProperty('--spot-y', `${y - rect.top}px`)
  })
}

// ---------- 复制出错链接 ----------
async function copyPath() {
  const text = window.location.href
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // 非安全上下文（http）下 clipboard 不可用时，走临时 textarea 方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }

  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 1600)
}

// ---------- 返回 ----------
function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function isInteractive(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('a, button, input, textarea, select, [contenteditable="true"]'))
}

// Enter 回首页，Esc 返回；焦点在按钮/链接上时交给浏览器原生行为
function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return

  if (event.key === 'Enter') {
    if (isInteractive(event.target)) return
    event.preventDefault()
    router.push('/')
  } else if (event.key === 'Escape') {
    event.preventDefault()
    goBack()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(copyTimer)
  if (pointerRaf) cancelAnimationFrame(pointerRaf)
})
</script>

<style scoped>
.not-found {
  --spot-x: 50%;
  --spot-y: 30%;
}

/* ---------- 背景：网格 / 光斑 / 噪点 ---------- */
.bg-grid {
  background-image:
    linear-gradient(to right, rgba(37, 99, 235, 0.055) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(37, 99, 235, 0.055) 1px, transparent 1px);
  background-size: 54px 54px;
  -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 72%);
  mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 72%);
}

.dark .bg-grid {
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
}

.spotlight {
  background: radial-gradient(
    560px circle at var(--spot-x) var(--spot-y),
    rgba(56, 189, 248, 0.15),
    transparent 62%
  );
}

.dark .spotlight {
  background: radial-gradient(
    560px circle at var(--spot-x) var(--spot-y),
    rgba(56, 189, 248, 0.11),
    transparent 62%
  );
}

.noise {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.035;
  mix-blend-mode: multiply;
}

.dark .noise {
  opacity: 0.05;
  filter: invert(1);
  mix-blend-mode: screen;
}

/* ---------- 背景描边 404 ---------- */
.ghost-404 {
  font-size: clamp(220px, 32vw, 440px);
  line-height: 0.8;
  letter-spacing: 0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(37, 99, 235, 0.13);
  animation: ghost-drift 14s ease-in-out infinite;
}

.dark .ghost-404 {
  -webkit-text-stroke-color: rgba(125, 211, 252, 0.18);
}

@keyframes ghost-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -16px, 0);
  }
}

/* ---------- 标题渐变字 ---------- */
.text-gradient {
  background: linear-gradient(105deg, #2563eb 0%, #3b82f6 42%, #38bdf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dark .text-gradient {
  background-image: linear-gradient(105deg, #e8eff8 0%, #7dd3fc 55%, #38bdf8 100%);
}

/* ---------- 按钮 ---------- */
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.78rem 1.5rem;
  border-radius: 14px;
  background-image: linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #38bdf8 100%);
  color: #fff;
  font-family: 'huoxie', sans-serif;
  font-size: 18px;
  letter-spacing: 0.02em;
  box-shadow:
    0 14px 30px -16px rgba(37, 99, 235, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;
}

.cta-primary:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow:
    0 20px 40px -18px rgba(37, 99, 235, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.cta-primary:active {
  transform: translateY(0);
}

.cta-arrow {
  transition: transform 0.25s ease;
}

.cta-primary:hover .cta-arrow {
  transform: translateX(3px);
}

.cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.78rem 1.35rem;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  color: #2563eb;
  font-family: 'huoxie', sans-serif;
  font-size: 18px;
  backdrop-filter: blur(10px);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;
}

.cta-ghost:hover {
  border-color: rgba(56, 189, 248, 0.55);
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
}

.dark .cta-ghost {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #bfdbfe;
}

.dark .cta-ghost:hover {
  border-color: rgba(125, 211, 252, 0.4);
  background: rgba(255, 255, 255, 0.07);
}

/* ---------- 键盘键帽 ---------- */
.kbd {
  display: inline-flex;
  min-width: 2.4rem;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-bottom-width: 2px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.75);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  line-height: 1.5;
  color: #64748b;
}

.dark .kbd {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

/* ---------- 右侧追踪卡片 ---------- */
.trace-card {
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  box-shadow:
    0 40px 90px -50px rgba(37, 99, 235, 0.3),
    0 0 0 1px rgba(37, 99, 235, 0.04);
}

.dark .trace-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(10, 18, 32, 0.82);
  box-shadow:
    0 40px 90px -50px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.06);
}

.trace-key {
  flex: none;
  width: 58px;
  padding-top: 1px;
  font-size: 9.5px;
  line-height: 1.9;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a3b1c2;
}

.caret {
  display: inline-block;
  width: 6px;
  height: 12px;
  margin-left: 3px;
  background: #38bdf8;
  translate: 0 1px;
  animation: caret-blink 1.1s steps(1, end) infinite;
}

@keyframes caret-blink {
  0%,
  55% {
    opacity: 1;
  }
  56%,
  100% {
    opacity: 0;
  }
}

/* ---------- 入场动画 ---------- */
.reveal {
  animation: rise-in 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.reveal-delay {
  animation-delay: 0.12s;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .ghost-404,
  .caret {
    animation: none;
  }

  .cta-primary,
  .cta-ghost,
  .cta-arrow {
    transition: none;
  }
}
</style>
