<!--
  后台轻提示的渲染宿主。
  一般在 App.vue 里挂载一次即可，然后在任意组件里通过 useAdminAlert() 触发：
    const alert = useAdminAlert()
    alert.success('添加成功')
    alert.error('保存失败，请稍后重试', { title: '出错了', duration: 4000 })
-->
<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-5 z-[3100] flex justify-center px-4"
      aria-live="polite"
    >
      <TransitionGroup
        name="admin-alert"
        tag="div"
        class="flex w-full max-w-[380px] flex-col items-stretch gap-2.5"
      >
        <div
          v-for="alert of alerts"
          :key="alert.id"
          class="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.3)] dark:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.85)]"
          :class="[THEMES[alert.type].border, THEMES[alert.type].bg]"
          role="status"
        >
          <!-- 类型图标：放在白色小圆底上，颜色再浅也不会糊在提示底色里 -->
          <span
            class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full shadow-sm"
            :class="THEMES[alert.type].iconBg"
          >
            <el-icon :size="14" :class="THEMES[alert.type].iconColor">
              <component :is="THEMES[alert.type].icon" />
            </el-icon>
          </span>

          <!-- 文字内容 -->
          <div class="min-w-0 flex-1">
            <p
              v-if="alert.title"
              class="text-[13px] font-medium leading-5 text-slate-800 dark:text-slate-100"
            >
              {{ alert.title }}
            </p>
            <p
              class="text-[13px] leading-5 text-slate-600 dark:text-slate-300"
              :class="alert.title ? 'mt-0.5 text-slate-500 dark:text-slate-400' : ''"
            >
              {{ alert.message }}
            </p>
          </div>

          <!-- 手动关闭 -->
          <button
            type="button"
            class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:text-slate-500 dark:hover:bg-slate-700/60 dark:hover:text-slate-300 dark:focus-visible:ring-slate-700"
            aria-label="关闭提示"
            @click="close(alert.id)"
          >
            <el-icon :size="12"><Close /></el-icon>
          </button>

          <!-- 自动关闭的进度条：duration 为 0 时不显示 -->
          <span
            v-if="alert.duration > 0"
            class="admin-alert-progress pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left"
            :class="THEMES[alert.type].bar"
            :style="{ animationDuration: `${alert.duration}ms` }"
            aria-hidden="true"
          ></span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Close,
  InfoFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import { useAdminAlert } from './useAdminAlert'
import type { AdminAlertType } from './useAdminAlert'

interface AlertTheme {
  border: string
  bg: string
  iconBg: string
  iconColor: string
  bar: string
  icon: Component
}

/*
 * 淡色提示条：整体是很浅的类型底色，图标用白色圆底托住，文字保持深灰保证清晰。
 * 黑夜模式下底色换成同色系的深色，图标圆底跟着变成深灰，避免一块白点扎眼。
 */
const THEMES: Record<AdminAlertType, AlertTheme> = {
  success: {
    border: 'border-emerald-100 dark:border-emerald-900/60',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/40',
    iconBg: 'bg-white dark:bg-slate-900',
    iconColor: 'text-emerald-400',
    bar: 'bg-emerald-300 dark:bg-emerald-500/80',
    icon: CircleCheckFilled,
  },
  error: {
    border: 'border-rose-100 dark:border-rose-900/60',
    bg: 'bg-rose-50/50 dark:bg-rose-950/40',
    iconBg: 'bg-white dark:bg-slate-900',
    iconColor: 'text-rose-400',
    bar: 'bg-rose-300 dark:bg-rose-500/80',
    icon: CircleCloseFilled,
  },
  warning: {
    border: 'border-amber-100 dark:border-amber-900/60',
    bg: 'bg-amber-50/50 dark:bg-amber-950/40',
    iconBg: 'bg-white dark:bg-slate-900',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-300 dark:bg-amber-500/80',
    icon: WarningFilled,
  },
  info: {
    border: 'border-sky-100 dark:border-sky-900/60',
    bg: 'bg-sky-50/50 dark:bg-sky-950/40',
    iconBg: 'bg-white dark:bg-slate-900',
    iconColor: 'text-sky-400',
    bar: 'bg-sky-300 dark:bg-sky-500/80',
    icon: InfoFilled,
  },
}

const { alerts, close } = useAdminAlert()
</script>

<style scoped>
/* 进度条随 duration 匀速走完，和自动关闭的定时器保持同步 */
.admin-alert-progress {
  animation-name: admin-alert-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes admin-alert-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* 出入场：从上方落下并淡入，离开时上移淡出 */
.admin-alert-enter-active,
.admin-alert-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.admin-alert-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.admin-alert-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.admin-alert-move {
  transition: transform 0.22s ease;
}

@media (prefers-reduced-motion: reduce) {
  .admin-alert-enter-active,
  .admin-alert-leave-active,
  .admin-alert-move {
    transition: none;
  }

  .admin-alert-progress {
    animation: none;
  }
}
</style>
