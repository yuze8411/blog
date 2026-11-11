<!--
  后台确认框：用于删除、退出登录等需要二次确认的操作。

  用法：
  <AdminConfirm
    v-model="visible"
    type="danger"
    title="删除这篇文章？"
    message="删除后无法恢复，请谨慎操作。"
    confirm-text="删除"
    @confirm="handleDelete"
  />

  说明：
  - 点击遮罩 / 按 Esc / 点取消，都会触发 cancel 并关闭，效果等同于取消。
  - 点确认只触发 confirm，不会自动关闭。这样可以在异步请求成功后再手动关闭，
    请求失败时把 loading 关掉，弹窗还能留在原地：
      async function handleDelete() {
        loading.value = true
        try { await api.delete() ; visible.value = false; alert.success('删除成功') }
        finally { loading.value = false }
      }
-->
<template>
  <Teleport to="body">
    <Transition name="admin-confirm">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        role="presentation"
      >
        <!-- 遮罩：点击等同于取消 -->
        <div
          class="admin-confirm-mask absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] dark:bg-black/60"
          aria-hidden="true"
          @click="onMaskClick"
        ></div>

        <!-- 弹窗主体 -->
        <div
          ref="dialogRef"
          class="admin-confirm-card relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_24px_56px_-28px_rgba(15,23,42,0.28)] focus:outline-none dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-[0_24px_56px_-28px_rgba(0,0,0,0.8)]"
          role="dialog"
          aria-modal="true"
          :aria-label="displayTitle"
          tabindex="-1"
        >
          <!-- 顶部色带：用颜色暗示操作类型 -->
          <div class="h-1 w-full" :class="theme.bar"></div>

          <div class="px-6 pb-6 pt-5">
            <div class="flex items-start gap-4">
              <span
                class="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                :class="theme.iconBg"
              >
                <el-icon :size="22" :class="theme.iconColor">
                  <component :is="theme.icon" />
                </el-icon>
              </span>

              <div class="min-w-0 flex-1">
                <h3 class="text-[16px] font-medium leading-6 text-slate-800 dark:text-slate-100">
                  {{ displayTitle }}
                </h3>
                <p
                  v-if="message"
                  class="mt-1.5 text-[13px] leading-6 text-slate-500 dark:text-slate-400"
                >
                  {{ message }}
                </p>

                <!-- 需要更复杂的内容（例如勾选项）时直接写在默认插槽里 -->
                <slot />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-2.5">
              <button type="button" class="admin-confirm-cancel" @click="cancel">
                {{ cancelText }}
              </button>

              <button
                type="button"
                class="admin-confirm-ok focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="theme.confirmBtn"
                :disabled="loading"
                @click="confirm"
              >
                <el-icon v-if="loading" :size="14" class="animate-spin">
                  <Loading />
                </el-icon>
                {{ loading ? loadingText : confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  InfoFilled,
  Loading,
  WarningFilled,
} from '@element-plus/icons-vue'

/** 确认框类型：决定图标、色带和确认按钮的颜色 */
type AdminConfirmType = 'info' | 'success' | 'warning' | 'danger'

interface ConfirmTheme {
  bar: string
  iconBg: string
  iconColor: string
  confirmBtn: string
  icon: Component
  title: string
}

/* 整体走淡色系：浅色底 + 深一点的文字，保证对比度但不刺眼 */
const THEMES: Record<AdminConfirmType, ConfirmTheme> = {
  info: {
    bar: 'bg-gradient-to-r from-sky-100 via-sky-300 to-sky-100 dark:from-sky-900/60 dark:via-sky-500/70 dark:to-sky-900/60',
    iconBg: 'bg-sky-50 ring-1 ring-inset ring-sky-100 dark:bg-sky-950/50 dark:ring-sky-900/60',
    iconColor: 'text-sky-400',
    confirmBtn:
      'border border-sky-200 bg-sky-50 text-sky-600 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-200 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-900/50 dark:focus-visible:ring-sky-800',
    icon: InfoFilled,
    title: '确认操作',
  },
  success: {
    bar: 'bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 dark:from-emerald-900/60 dark:via-emerald-500/70 dark:to-emerald-900/60',
    iconBg:
      'bg-emerald-50 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/50 dark:ring-emerald-900/60',
    iconColor: 'text-emerald-400',
    confirmBtn:
      'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:ring-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/50 dark:focus-visible:ring-emerald-800',
    icon: CircleCheckFilled,
    title: '操作成功',
  },
  warning: {
    bar: 'bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 dark:from-amber-900/60 dark:via-amber-500/70 dark:to-amber-900/60',
    iconBg:
      'bg-amber-50 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/50 dark:ring-amber-900/60',
    iconColor: 'text-amber-400',
    confirmBtn:
      'border border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100 focus-visible:ring-amber-200 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-900/50 dark:focus-visible:ring-amber-800',
    icon: WarningFilled,
    title: '请注意',
  },
  danger: {
    bar: 'bg-gradient-to-r from-rose-100 via-rose-300 to-rose-100 dark:from-rose-900/60 dark:via-rose-500/70 dark:to-rose-900/60',
    iconBg:
      'bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-950/50 dark:ring-rose-900/60',
    iconColor: 'text-rose-400',
    confirmBtn:
      'border border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100 focus-visible:ring-rose-200 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:border-rose-700 dark:hover:bg-rose-900/50 dark:focus-visible:ring-rose-800',
    icon: CircleCloseFilled,
    title: '危险操作',
  },
}

const props = withDefaults(
  defineProps<{
    /** 控制弹窗显示，配合 v-model 使用 */
    modelValue: boolean
    /** 操作类型：info / success / warning / danger */
    type?: AdminConfirmType
    /** 标题，不传时按类型给默认标题 */
    title?: string
    /** 正文说明 */
    message?: string
    /** 确认按钮文字 */
    confirmText?: string
    /** 取消按钮文字 */
    cancelText?: string
    /** 确认操作进行中的状态，会禁用确认按钮并显示转圈 */
    loading?: boolean
    /** 进行中时确认按钮显示的文字 */
    loadingText?: string
    /** 点遮罩是否关闭，默认 true */
    maskClosable?: boolean
  }>(),
  {
    type: 'info',
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    loading: false,
    loadingText: '处理中…',
    maskClosable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const dialogRef = ref<HTMLElement | null>(null)

const theme = computed(() => THEMES[props.type])
const displayTitle = computed(() => props.title || theme.value.title)

/** 关闭弹窗（不区分确认还是取消） */
function close() {
  emit('update:modelValue', false)
}

/** 取消：关闭 + 抛出 cancel，遮罩和 Esc 也走这里 */
function cancel() {
  close()
  emit('cancel')
}

function confirm() {
  if (props.loading) return
  emit('confirm')
}

function onMaskClick() {
  if (props.maskClosable) cancel()
}

/** Esc 等同于取消 */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.modelValue) return
  event.preventDefault()
  cancel()
}

// 打开时锁住页面滚动，并把焦点放进弹窗，方便键盘操作
let previousOverflow = ''
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      void nextTick(() => dialogRef.value?.focus())
    } else {
      document.body.style.overflow = previousOverflow
    }
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  // 组件在打开状态下被销毁时，恢复页面滚动
  document.body.style.overflow = previousOverflow
})
</script>

<style scoped>
.admin-confirm-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #fff;
  padding: 0.5rem 1rem;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.admin-confirm-cancel:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #1e293b;
}

.admin-confirm-cancel:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #cbd5e1;
}

/* 黑夜模式：取消按钮也跟着变成深色 */
:global(html.dark) .admin-confirm-cancel {
  border-color: #334155;
  background: #1e293b;
  color: #cbd5e1;
}

:global(html.dark) .admin-confirm-cancel:hover {
  border-color: #475569;
  background: #334155;
  color: #f1f5f9;
}

:global(html.dark) .admin-confirm-cancel:focus-visible {
  box-shadow:
    0 0 0 2px #0f172a,
    0 0 0 4px #475569;
}

.admin-confirm-ok {
  display: inline-flex;
  min-width: 88px;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 13px;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.admin-confirm-ok:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 弹窗和遮罩的过渡 */
.admin-confirm-enter-active,
.admin-confirm-leave-active {
  transition: opacity 0.2s ease;
}

.admin-confirm-enter-from,
.admin-confirm-leave-to {
  opacity: 0;
}

.admin-confirm-enter-active .admin-confirm-card {
  animation: admin-confirm-pop 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.admin-confirm-leave-active .admin-confirm-card {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.admin-confirm-leave-to .admin-confirm-card {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

@keyframes admin-confirm-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-confirm-enter-active .admin-confirm-card,
  .admin-confirm-leave-active .admin-confirm-card {
    animation: none;
    transition: none;
  }
}
</style>
