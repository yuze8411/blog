<template>
  <button
    type="button"
    class="admin-add-button group relative inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 text-[13px] font-medium text-white shadow-[0_6px_16px_-8px_rgba(37,99,235,0.65)] transition-[transform,box-shadow,background-position] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] dark:shadow-[0_6px_18px_-10px_rgba(2,132,199,0.7)] dark:focus-visible:ring-offset-slate-900"
    @click="emit('addHandler')"
  >
    <span class="admin-add-sheen" aria-hidden="true"></span>

    <svg
      class="h-[15px] w-[15px] transition-transform duration-300 ease-out group-hover:rotate-90"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3.2v9.6M3.2 8h9.6"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>

    <span class="transition-transform duration-300 ease-out group-hover:translate-x-[1px]">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps(['text'])
const emit = defineEmits(['addHandler'])
</script>

<style scoped>
/* 背景渐变比按钮宽一些，悬停时慢慢向左流动，颜色过渡更活 */
.admin-add-button {
  background-size: 160% 100%;
  background-position: 0% 50%;
}

.admin-add-button:hover {
  background-position: 100% 50%;
}

/* ==================== 划过的高光 ==================== */
/*
 * 单独一层 span 来做「划开」效果：
 * 宽度只占按钮的一小半，带一点倾斜，靠动画从左往右穿过按钮。
 * 按钮本身 overflow-hidden，所以超出部分会被裁掉，看起来就是一束光划过去。
 */
.admin-add-sheen {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 55%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 35%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.15) 65%,
    transparent 100%
  );
  transform: skewX(-20deg) translateX(0);
  will-change: transform, opacity;
}

/* 悬停时才播放，播放完停在右侧外（透明度归零，看不到残留） */
.admin-add-button:hover .admin-add-sheen {
  animation: admin-add-sheen-run 0.75s cubic-bezier(0.25, 0.7, 0.35, 1);
}

@keyframes admin-add-sheen-run {
  0% {
    opacity: 0;
    transform: skewX(-20deg) translateX(0);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: skewX(-20deg) translateX(430%);
  }
}

/* ==================== 禁用态 ==================== */
.admin-add-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
  background-position: 0% 50%;
}

.admin-add-button:disabled .admin-add-sheen {
  display: none;
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-add-button,
  .admin-add-button svg,
  .admin-add-button span {
    transition: none;
  }

  .admin-add-button:hover .admin-add-sheen {
    animation: none;
  }

  .admin-add-button:hover svg {
    transform: none;
  }
}
</style>
