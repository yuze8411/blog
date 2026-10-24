<template>
  <div class="floating-tags" aria-hidden="true">
    <span
      v-for="item in items"
      :key="item.key"
      class="floating-tag"
      :class="`ft-${item.tone}`"
      :style="{
        top: `${item.top}%`,
        fontSize: `${item.size}px`,
        opacity: item.opacity,
        animationDuration: `${item.duration}s`,
        animationDelay: `${item.delay}s`,
      }"
    >
      #{{ item.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { tagWall } from '@/data/tags'

interface FloatingItem {
  key: string
  name: string
  top: number
  size: number
  duration: number
  delay: number
  opacity: number
  tone: number
}

// 用固定公式而不是 Math.random：每次进入页面分布一致，也不会挤成一团
const items: FloatingItem[] = Array.from({ length: 24 }, (_, index) => {
  const tag = tagWall[(index * 7) % tagWall.length]

  return {
    key: `${index}-${tag?.name ?? 'tag'}`,
    name: tag?.name ?? '标签',
    top: (index * 41 + 7) % 100,
    size: 14 + ((index * 5) % 18),
    duration: 30 + ((index * 7) % 26),
    delay: -((index * 11) % 55),
    opacity: 0.1 + ((index * 3) % 6) * 0.022,
    tone: index % 12,
  }
})
</script>

<style scoped>
.floating-tags {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-tag {
  position: absolute;
  left: 0;
  padding: 4px 12px;
  border: 1px solid color-mix(in srgb, var(--float-color) 24%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--float-color) 7%, transparent);
  color: var(--float-color);
  font-family: 'huoxie', serif;
  line-height: 1.2;
  white-space: nowrap;
  animation-name: tag-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

@keyframes tag-drift {
  0% {
    transform: translate3d(-24vw, 0, 0) rotate(-4deg);
  }
  50% {
    transform: translate3d(48vw, -18px, 0) rotate(3deg);
  }
  100% {
    transform: translate3d(122vw, 0, 0) rotate(-4deg);
  }
}

/* 十二组低透明度标签色，跟随主题 */
.ft-0 {
  --float-color: #9d2f53;
}

.ft-1 {
  --float-color: #a1481f;
}

.ft-2 {
  --float-color: #8a5a0b;
}

.ft-3 {
  --float-color: #56661a;
}

.ft-4 {
  --float-color: #1e6b45;
}

.ft-5 {
  --float-color: #1d6662;
}

.ft-6 {
  --float-color: #1c5f8d;
}

.ft-7 {
  --float-color: #3a4f9e;
}

.ft-8 {
  --float-color: #6241a0;
}

.ft-9 {
  --float-color: #8c3786;
}

.ft-10 {
  --float-color: #a03b30;
}

.ft-11 {
  --float-color: #3c5a68;
}

.dark .ft-0 {
  --float-color: #f2aec8;
}

.dark .ft-1 {
  --float-color: #f7c09a;
}

.dark .ft-2 {
  --float-color: #f2d191;
}

.dark .ft-3 {
  --float-color: #d5e3a0;
}

.dark .ft-4 {
  --float-color: #a5dcc0;
}

.dark .ft-5 {
  --float-color: #9edbd6;
}

.dark .ft-6 {
  --float-color: #a9d6f5;
}

.dark .ft-7 {
  --float-color: #b8c5f5;
}

.dark .ft-8 {
  --float-color: #cfbcf5;
}

.dark .ft-9 {
  --float-color: #e9b6e7;
}

.dark .ft-10 {
  --float-color: #f0b3aa;
}

.dark .ft-11 {
  --float-color: #bcd2dc;
}

@media (prefers-reduced-motion: reduce) {
  .floating-tags {
    display: none;
  }
}
</style>
