<template>
  <div class="fixed right-5 top-1/2 z-40 -translate-y-1/2 sm:right-[30px]">
    <nav class="about-switcher flex flex-col items-center gap-4" aria-label="关于页切换">
      <button
        type="button"
        class="about-switch"
        :class="{ 'is-active': index === 0 }"
        aria-label="切换到第一屏"
        :aria-current="index === 0 ? 'true' : undefined"
        @click="emit('myscroll', 0)"
      />

      <button
        type="button"
        class="about-switch"
        :class="{ 'is-active': index === 1 }"
        aria-label="切换到第二屏"
        :aria-current="index === 1 ? 'true' : undefined"
        @click="emit('myscroll', 1)"
      />

      <button
        type="button"
        class="about-switch"
        :class="{ 'is-active': index === 2 }"
        aria-label="切换到第三屏"
        :aria-current="index === 2 ? 'true' : undefined"
        @click="emit('myscroll', 2)"
      />
    </nav>
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
.about-switcher {
  padding: 12px 7px;
  border: 1px solid rgba(186, 230, 253, 0.14);
  border-radius: 999px;
  background: rgba(8, 15, 33, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 10px 28px rgba(2, 6, 23, 0.28);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  animation: switcher-in 0.55s cubic-bezier(0.22, 0.85, 0.3, 1) both;
}

/* 半透明圆形按钮：只保留一个圆、细边框和柔和阴影 */
.about-switch {
  position: relative;
  width: 12px;
  height: 12px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 2px 8px rgba(2, 6, 23, 0.35);
  cursor: pointer;
  transition:
    transform 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* 扩大点击热区，视觉上仍然只有一个小圆 */
.about-switch::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: inherit;
}

.about-switch:hover {
  transform: scale(1.16);
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 4px 14px rgba(2, 6, 23, 0.4),
    0 0 12px rgba(125, 211, 252, 0.18);
}

.about-switch.is-active {
  transform: scale(1.16);
  border-color: rgba(224, 242, 254, 0.65);
  background: rgba(186, 230, 253, 0.78);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 3px rgba(125, 211, 252, 0.12),
    0 0 16px rgba(56, 189, 248, 0.4),
    0 4px 14px rgba(2, 6, 23, 0.35);
}

.about-switch.is-active:hover {
  transform: scale(1.22);
  background: rgba(224, 242, 254, 0.9);
}

.about-switch:focus-visible {
  outline: 1px solid rgba(186, 230, 253, 0.9);
  outline-offset: 4px;
}

@keyframes switcher-in {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-switcher {
    animation: none;
  }

  .about-switch {
    transition: none;
  }
}
</style>
