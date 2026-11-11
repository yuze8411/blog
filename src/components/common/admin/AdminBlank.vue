<template>
  <!--
    后台空状态组件：搜索 / 筛选没有结果时展示。

    用法：
    <AdminBlank />                                  → 默认文案
    <AdminBlank title="没有匹配的文章" description="试试更换关键词或清空时间筛选" />

    compact：放进卡片、抽屉等空间较小的位置时使用
    <AdminBlank compact />

    需要「清空筛选」之类的操作时，用 action 插槽：
    <AdminBlank>
      <template #action>
        <button>清空筛选</button>
      </template>
    </AdminBlank>
  -->
  <div
    class="admin-blank flex w-full h-full flex-col items-center justify-center text-center"
    :class="paddingClass"
  >
    <!-- 插画：虚线圆环 + 空白文档 + 放大镜，暗示「没搜到内容」 -->
    <div class="relative grid place-items-center">
      <!-- 背后一团柔和的蓝色光晕，避免大面积留白太死板 -->
      <span
        class="pointer-events-none absolute h-24 w-24 rounded-full bg-sky-100/80 blur-2xl motion-safe:animate-pulse dark:bg-sky-950/60"
        aria-hidden="true"
      ></span>

      <svg
        class="admin-blank-float relative h-[132px] w-[156px]"
        viewBox="0 0 160 140"
        fill="none"
        aria-hidden="true"
      >
        <!-- 虚线圆环：像搜索范围的示意 -->
        <circle
          cx="80"
          cy="70"
          r="52"
          class="stroke-slate-200 dark:stroke-slate-700"
          stroke-width="1.5"
          stroke-dasharray="4 8"
          stroke-linecap="round"
        />

        <!-- 空白文档 -->
        <rect
          x="46"
          y="26"
          width="62"
          height="82"
          rx="10"
          class="fill-white stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-700"
          stroke-width="2"
        />
        <rect
          x="58"
          y="44"
          width="38"
          height="6"
          rx="3"
          class="fill-slate-200 dark:fill-slate-600"
        />
        <rect
          x="58"
          y="58"
          width="30"
          height="6"
          rx="3"
          class="fill-slate-200 dark:fill-slate-700"
        />
        <rect
          x="58"
          y="72"
          width="34"
          height="6"
          rx="3"
          class="fill-slate-100 dark:fill-slate-700"
        />

        <!-- 放大镜：镜片里一条短横线，表示「什么都没有」 -->
        <circle
          cx="107"
          cy="94"
          r="19"
          class="fill-white stroke-sky-400 dark:fill-slate-800 dark:stroke-sky-500"
          stroke-width="3.5"
        />
        <path
          d="M100 94h14"
          class="stroke-slate-300 dark:stroke-slate-600"
          stroke-width="3"
          stroke-linecap="round"
        />
        <path
          d="M120.5 107.5l9 9"
          class="stroke-sky-400 dark:stroke-sky-500"
          stroke-width="4"
          stroke-linecap="round"
        />

        <!-- 几点漂浮的小圆，增加一点生气 -->
        <circle cx="32" cy="44" r="3" class="fill-sky-200 dark:fill-sky-900" />
        <circle cx="130" cy="38" r="2.5" class="fill-slate-200 dark:fill-slate-700" />
        <circle cx="28" cy="96" r="2" class="fill-sky-100 dark:fill-sky-950" />
      </svg>
    </div>

    <!-- 文案 -->
    <h3 class="mt-5 text-[15px] font-medium text-slate-600 dark:text-slate-300">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-1.5 max-w-[320px] text-[13px] leading-6 text-slate-400 dark:text-slate-500"
    >
      {{ description }}
    </p>

    <!-- 可选操作区：由调用方决定放不放按钮 -->
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AdminBlankProps {
  /** 主标题 */
  title?: string
  /** 补充说明，传空字符串则不显示 */
  description?: string
  /** 紧凑模式：减少上下留白，适合放进卡片或弹层里 */
  compact?: boolean
}

const props = withDefaults(defineProps<AdminBlankProps>(), {
  title: '没有找到相关内容',
  description: '换个关键词，或调整一下筛选条件再试试',
  compact: false,
})

/** compact 只影响上下留白，插画和文案保持不变 */
const paddingClass = computed(() => (props.compact ? 'px-4 py-10' : 'px-6 py-16'))
</script>

<style scoped>
/* 插画轻轻上下浮动，让空状态不至于完全静止 */
.admin-blank-float {
  animation: admin-blank-float 3.6s ease-in-out infinite;
  will-change: transform;
}

@keyframes admin-blank-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 减少动态效果：去掉浮动，光晕也由 motion-safe 自动停掉 */
@media (prefers-reduced-motion: reduce) {
  .admin-blank-float {
    animation: none;
  }
}
</style>
