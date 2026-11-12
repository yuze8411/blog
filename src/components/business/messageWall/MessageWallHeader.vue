<template>
  <header class="relative pb-2 pt-24 text-center sm:pt-28">
    <!-- 顶部小标签：左右两条渐变细线，把标题收在中间 -->
    <p
      class="wall-rise inline-flex items-center gap-3 font-[huoxie] text-[11px] tracking-[0.38em] text-zinc-500 dark:text-zinc-400"
    >
      <span
        class="h-px w-7 bg-gradient-to-r from-transparent to-zinc-300 sm:w-10 dark:to-zinc-600"
      />
      MESSAGE WALL
      <span
        class="h-px w-7 bg-gradient-to-l from-transparent to-zinc-300 sm:w-10 dark:to-zinc-600"
      />
    </p>

    <!-- 标题两侧各两颗跳动的小球，颜色比页面其它部分稍微活泼一点 -->
    <div
      class="wall-rise mt-4 flex items-center justify-center gap-3 sm:gap-5"
      style="animation-delay: 80ms"
    >
      <span class="wall-dots is-left" aria-hidden="true">
        <span class="wall-dot is-teal"></span>
        <span class="wall-dot is-lilac"></span>
      </span>

      <h1
        class="font-[huoxie] text-[38px] leading-[1.12] tracking-[0.06em] text-zinc-800 dark:text-zinc-50 sm:text-[52px]"
      >
        留言墙
      </h1>

      <span class="wall-dots is-right" aria-hidden="true">
        <span class="wall-dot is-lilac"></span>
        <span class="wall-dot is-teal"></span>
      </span>
    </div>

    <!-- 标题下一条很安静的细线 -->
    <span class="wall-title-line" aria-hidden="true"></span>

    <p
      class="wall-rise mx-auto mt-4 max-w-[560px] text-[13px] leading-7 text-zinc-500 dark:text-zinc-400 sm:text-[13.5px]"
      style="animation-delay: 170ms"
    >
      把想说的话留在这里。可以是一句问候、一点建议，或者只是路过时的心情。
    </p>

    <div
      class="wall-rise mt-6 inline-flex flex-wrap items-center justify-center gap-2"
      style="animation-delay: 250ms"
    >
      <span class="wall-status-pill">
        <span class="relative flex h-1.5 w-1.5 shrink-0">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60"
          />
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-500" />
        </span>
        <template v-if="loading && !loaded">正在数墙上的留言…</template>
        <template v-else
          >墙上已有 <b class="tabular-nums">{{ total }}</b> 条留言</template
        >
      </span>

      <span class="wall-status-pill is-soft">
        <IconFont name="liuyan" class="text-[12px]" />
        审核通过后展示
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    total: number
    loading?: boolean
    loaded?: boolean
  }>(),
  {
    loading: false,
    loaded: false,
  },
)
</script>

<style scoped>
.wall-rise {
  animation: wall-rise 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes wall-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- 标题两侧的小球 ---------- */
.wall-dots {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
}

.wall-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  animation: wall-dot-bounce 1.15s ease-in-out infinite;
}

.wall-dot.is-teal {
  width: 5px;
  height: 5px;
  background: #43a99e;
}

.wall-dot.is-lilac {
  background: #a99bd0;
}

.wall-dots.is-left .wall-dot:nth-child(2) {
  animation-delay: 0.18s;
}

.wall-dots.is-right .wall-dot:nth-child(1) {
  animation-delay: 0.36s;
}

.wall-dots.is-right .wall-dot:nth-child(2) {
  animation-delay: 0.54s;
}

@keyframes wall-dot-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.wall-title-line {
  display: block;
  width: 64px;
  height: 1px;
  margin: 16px auto 0;
  background: linear-gradient(90deg, transparent, rgba(161, 161, 170, 0.6), transparent);
}

.wall-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e8eaed;
  border-radius: 999px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.88);
  color: #71717a;
  font-size: 11.5px;
  line-height: 18px;
  box-shadow: 0 10px 26px -24px rgba(63, 63, 70, 0.24);
  backdrop-filter: blur(6px);
}

.wall-status-pill b {
  color: #27272a;
  font-weight: 600;
}

.wall-status-pill.is-soft {
  border-color: #eceef1;
  background: rgba(250, 250, 251, 0.9);
  color: #71717a;
}

html.dark .wall-status-pill {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
}

html.dark .wall-status-pill b {
  color: #f4f4f5;
}

html.dark .wall-status-pill.is-soft {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #a1a1aa;
}

@media (max-width: 639px) {
  .wall-dots {
    gap: 4px;
  }

  .wall-dot {
    width: 6px;
    height: 6px;
  }

  .wall-dot.is-teal {
    width: 4px;
    height: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wall-rise,
  .wall-dot {
    animation: none;
  }
}
</style>
