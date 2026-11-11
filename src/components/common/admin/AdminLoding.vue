<template>
  <!--
    后台通用加载中组件。

    两种用法：
    1. 局部占位（默认）：直接放在内容区里，自带上下留白
       <AdminLoding />
       <AdminLoding text="正在加载文章列表…" size="lg" />

    2. 覆盖父容器：父元素需要 position: relative，
       会铺满父容器并盖一层半透明遮罩，同时挡住点击
       <div class="relative">
         <文章列表 />
         <AdminLoding v-if="loading" overlay text="正在加载…" />
       </div>
  -->
  <div
    class="admin-loading select-none"
    :class="
      overlay
        ? 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 rounded-[inherit] bg-white/70 backdrop-blur-[2px] dark:bg-slate-900/60'
        : 'flex flex-col items-center justify-center gap-2.5 py-8'
    "
    role="status"
    aria-live="polite"
    aria-busy="true"
    :aria-label="text"
  >
    <div class="relative grid shrink-0 place-items-center">
      <span
        class="pointer-events-none absolute inset-0 scale-150 rounded-full bg-sky-400/20 blur-md motion-safe:animate-pulse dark:bg-sky-500/15"
        aria-hidden="true"
      ></span>

      <svg
        class="admin-loading-spinner relative"
        :class="sizeConfig.ring"
        viewBox="0 0 50 50"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          class="text-slate-200 dark:text-slate-700"
          stroke="currentColor"
          stroke-width="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          class="text-sky-500 dark:text-sky-400"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="80 160"
        />
      </svg>
    </div>

    <p
      class="admin-loading-text font-medium tracking-wide text-slate-500 dark:text-slate-400"
      :class="sizeConfig.text"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AdminLoadingProps {
  /** 加载提示文字 */
  text?: string
  /** 转圈大小：sm 5px / md 8px / lg 12px 对应的尺寸档位 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否铺满父容器并盖一层半透明遮罩（父元素需要 position: relative） */
  overlay?: boolean
}

const props = withDefaults(defineProps<AdminLoadingProps>(), {
  text: '加载中',
  size: 'md',
  overlay: false,
})

/** 三档尺寸：只控制转圈直径和文字字号，颜色统一交给样式类 */
const SIZE_MAP = {
  sm: { ring: 'h-5 w-5', text: 'text-[12px]' },
  md: { ring: 'h-8 w-8', text: 'text-[13px]' },
  lg: { ring: 'h-12 w-12', text: 'text-[14px]' },
} as const

const sizeConfig = computed(() => SIZE_MAP[props.size])
</script>

<style scoped>
/* ==================== 转圈 ==================== */
.admin-loading-spinner {
  animation: admin-loading-spin 0.9s linear infinite;
  transform-origin: center;
}

@keyframes admin-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 文字呼吸 ==================== */
.admin-loading-text {
  animation: admin-loading-breathe 1.8s ease-in-out infinite;
}

@keyframes admin-loading-breathe {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-loading-spinner {
    animation: none;
  }

  .admin-loading-text {
    animation: none;
    opacity: 1;
  }
}
</style>
