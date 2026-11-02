<template>
  <div class="fixed right-5 top-1/2 z-40 -translate-y-1/2 sm:right-[30px]">
    <div class="about-dot-capsule relative flex flex-col items-center gap-5 rounded-full px-3 py-4">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute bottom-5 left-1/2 top-5 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/25 to-transparent"
      />

      <div
        aria-hidden="true"
        class="about-dot dot_1"
        @click="emit('myscroll', 0)"
        :class="index == 0 ? 'dot_active' : ''"
      />
      <div
        aria-hidden="true"
        class="about-dot dot_2"
        @click="emit('myscroll', 1)"
        :class="index == 1 ? 'dot_active' : ''"
      />
      <div
        aria-hidden="true"
        class="about-dot dot_3"
        @click="emit('myscroll', 2)"
        :class="index == 2 ? 'dot_active' : ''"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
let emit = defineEmits<{
  (e: 'myscroll', index: number): void
}>()
let props = defineProps<{
  index: number
}>()
</script>

<style scoped>
.about-dot-capsule {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.06));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    0 10px 34px rgba(3, 7, 18, 0.22);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  animation: capsule-in 0.65s cubic-bezier(0.22, 0.8, 0.3, 1) both;
}

.about-dot {
  position: relative;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.08),
    0 0 12px rgba(255, 255, 255, 0.48);
  cursor: pointer;
  transition:
    transform 0.35s ease,
    background-color 0.3s ease,
    box-shadow 0.35s ease;
  /* backwards：入场结束后把 transform 交还给 hover，放大效果不会被锁住 */
  animation: dot-in 0.7s cubic-bezier(0.22, 1.25, 0.36, 1) backwards;
}

/* 渐变背景单独放在伪元素上：background-image 本身不能过渡，用 opacity 做淡入淡出 */
.about-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, #f5d0fe 0%, #d858ff 62%, #a855f7 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.about-dot:hover {
  transform: scale(1.22);
  background: #fff;
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.1),
    0 0 18px rgba(255, 255, 255, 0.75);
}

/* 三个点错峰进场：每个都从右侧轻轻弹进来 */
.dot_1 {
  animation-delay: 0.16s;
}

.dot_2 {
  animation-delay: 0.3s;
}

.dot_3 {
  animation-delay: 0.44s;
}

/* 当前所在的点：淡紫色渐变 + 一圈缓慢扩散的光环 */
.dot_active {
  transform: scale(1.08);
  box-shadow:
    0 0 0 3px rgba(216, 88, 255, 0.16),
    0 0 18px rgba(216, 88, 255, 0.78);
}

.dot_active::after {
  opacity: 1;
}

.dot_active::before {
  content: '';
  position: absolute;
  inset: -5px;
  border: 1px solid rgba(216, 88, 255, 0.45);
  border-radius: inherit;
  animation: dot-pulse 2.4s ease-out 1s infinite;
}

.dot_active:hover::after {
  background: linear-gradient(135deg, #fae8ff 0%, #e879f9 58%, #c084fc 100%);
}

.dot_active:hover {
  box-shadow:
    0 0 0 4px rgba(216, 88, 255, 0.2),
    0 0 22px rgba(216, 88, 255, 0.95);
}

@keyframes capsule-in {
  from {
    opacity: 0;
    transform: translateX(22px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes dot-in {
  from {
    opacity: 0;
    transform: translateX(16px) scale(0.35);
    filter: blur(2px);
  }
  65% {
    opacity: 1;
    filter: blur(0);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes dot-pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.8);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.65);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-dot-capsule,
  .about-dot,
  .dot_active::before {
    animation: none;
  }
}
</style>
