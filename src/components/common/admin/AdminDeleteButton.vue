<template>
  <button
    type="button"
    class="admin-delete-button group relative inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-4 text-[13px] font-medium text-rose-500 shadow-[0_4px_12px_-8px_rgba(244,63,94,0.35)] transition-[transform,box-shadow,background-position,color,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 hover:shadow-[0_10px_22px_-12px_rgba(244,63,94,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] dark:border-rose-900/60 dark:from-rose-950/40 dark:to-rose-900/30 dark:text-rose-300 dark:shadow-[0_4px_14px_-10px_rgba(244,63,94,0.45)] dark:hover:border-rose-800 dark:hover:text-rose-200 dark:focus-visible:ring-rose-800 dark:focus-visible:ring-offset-slate-900"
    @click="emit('delHandler')"
  >
    <span class="admin-delete-sheen" aria-hidden="true"></span>

    <svg
      class="admin-delete-icon h-[15px] w-[15px]"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5h10M6.2 4.5V3.4c0-.5.4-.9.9-.9h1.8c.5 0 .9.4.9.9v1.1M4.4 4.5l.5 8c0 .6.5 1 1 1h4.2c.6 0 1-.4 1-1l.5-8"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.7 7.2v3.6M9.3 7.2v3.6"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
    </svg>

    <span class="transition-transform duration-300 ease-out group-hover:-translate-x-[1px]">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps(['text'])
const emit = defineEmits(['delHandler'])
</script>

<style scoped>
.admin-delete-button {
  background-size: 160% 100%;
  background-position: 0% 50%;
}

.admin-delete-button:hover {
  background-position: 100% 50%;
}

/* ==================== 划过的高光 ==================== */
.admin-delete-sheen {
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
    rgba(251, 113, 133, 0.12) 35%,
    rgba(251, 113, 133, 0.3) 50%,
    rgba(251, 113, 133, 0.12) 65%,
    transparent 100%
  );
  transform: skewX(-20deg) translateX(0);
  will-change: transform, opacity;
}

/* 悬停时播放一次，划完停在右侧外面并淡出 */
.admin-delete-button:hover .admin-delete-sheen {
  animation: admin-delete-sheen-run 0.75s cubic-bezier(0.25, 0.7, 0.35, 1);
}

@keyframes admin-delete-sheen-run {
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

/* ==================== 图标摇头 ==================== */
.admin-delete-button:hover .admin-delete-icon {
  animation: admin-delete-wiggle 0.5s ease-in-out;
}

@keyframes admin-delete-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-8deg);
  }
  60% {
    transform: rotate(6deg);
  }
}

/* ==================== 禁用态 ==================== */
.admin-delete-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
  background-position: 0% 50%;
}

.admin-delete-button:disabled .admin-delete-sheen {
  display: none;
}

/* ==================== 黑夜模式下高光淡一点 ==================== */
:global(html.dark) .admin-delete-sheen {
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(251, 113, 133, 0.08) 35%,
    rgba(251, 113, 133, 0.2) 50%,
    rgba(251, 113, 133, 0.08) 65%,
    transparent 100%
  );
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-delete-button,
  .admin-delete-button span {
    transition: none;
  }

  .admin-delete-button:hover .admin-delete-sheen,
  .admin-delete-button:hover .admin-delete-icon {
    animation: none;
  }
}
</style>
