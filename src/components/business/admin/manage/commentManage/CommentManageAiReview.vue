<template>
  <Teleport to="body">
    <Transition name="ai-review">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-6"
        role="presentation"
      >
        <!-- 遮罩：AI 处理中 / 提交中不关闭，避免误触 -->
        <div
          class="ai-review-mask absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] dark:bg-black/65"
          aria-hidden="true"
          @click="onMaskClick"
        ></div>

        <section
          ref="dialogRef"
          class="ai-review-card relative flex max-h-[90vh] w-full max-w-[880px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_28px_70px_-30px_rgba(15,23,42,0.4)] focus:outline-none dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]"
          role="dialog"
          aria-modal="true"
          aria-label="AI 评论审核"
          tabindex="-1"
        >
          <!-- 头部 -->
          <header
            class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-white px-5 py-4 dark:border-slate-800 dark:from-indigo-950/35 dark:via-sky-950/20 dark:to-slate-900"
          >
            <div class="flex min-w-0 items-start gap-3">
              <span class="ai-review-icon">
                <el-icon :size="17"><MagicStick /></el-icon>
              </span>
              <div class="min-w-0">
                <h2 class="text-[16px] font-semibold text-slate-800 dark:text-slate-100">
                  AI 评论审核
                </h2>
                <p class="mt-0.5 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
                  AI 先给建议，你可以逐条改掉不同意的判断，再一起通过。
                </p>
              </div>
            </div>

            <button
              type="button"
              class="ai-review-close"
              aria-label="关闭 AI 审核"
              :disabled="loading || submitting"
              @click="close"
            >
              <el-icon :size="14"><Close /></el-icon>
            </button>
          </header>

          <!-- 内容区 -->
          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <!-- AI 正在审核 -->
            <div v-if="loading" class="space-y-3" aria-busy="true" aria-label="AI 审核中">
              <div class="ai-review-loading-tip">
                <span class="ai-review-spinner" aria-hidden="true"></span>
                <div>
                  <p class="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                    AI 正在阅读这 {{ items.length }} 条评论…
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    识别广告、攻击、刷屏等内容，通常需要几秒钟。
                  </p>
                </div>
              </div>

              <div v-for="n in Math.min(items.length || 3, 5)" :key="n" class="ai-review-skeleton">
                <span class="ai-review-skeleton-avatar"></span>
                <div class="min-w-0 flex-1 space-y-2">
                  <span class="ai-review-skeleton-line w-28"></span>
                  <span class="ai-review-skeleton-line w-full"></span>
                  <span class="ai-review-skeleton-line w-3/5"></span>
                </div>
              </div>
            </div>

            <!-- AI 调用失败：保留重试，不丢已勾选的评论 -->
            <div v-else-if="error" class="ai-review-error">
              <span class="ai-review-error-icon">
                <el-icon :size="20"><WarningFilled /></el-icon>
              </span>
              <p class="mt-3 text-[14px] font-medium text-slate-700 dark:text-slate-200">
                AI 审核没有完成
              </p>
              <p
                class="mt-1 max-w-[420px] text-[12.5px] leading-6 text-slate-500 dark:text-slate-400"
              >
                {{ error }}
              </p>
              <button type="button" class="ai-review-retry" @click="emit('retry')">
                <el-icon :size="13" class="mr-1"><RefreshRight /></el-icon>
                重新让 AI 审核
              </button>
            </div>

            <!-- 审核结果列表 -->
            <div v-else class="space-y-3">
              <article
                v-for="item in localItems"
                :key="item.comment.id"
                class="ai-review-item"
                :class="item.pass ? 'is-pass' : 'is-reject'"
              >
                <div class="flex min-w-0 flex-1 items-start gap-3">
                  <CommentAvatar
                    :name="item.comment.nickname"
                    :src="item.comment.avatar_url || undefined"
                    :size="36"
                  />

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        class="truncate text-[13.5px] font-medium text-slate-700 dark:text-slate-200"
                      >
                        {{ item.comment.nickname }}
                      </span>
                      <span v-if="item.comment.is_owner" class="ai-review-badge is-owner"
                        >博主</span
                      >
                      <span v-if="item.comment.root_id" class="ai-review-badge is-reply">回复</span>
                      <span class="truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {{ item.comment.post_title }}
                      </span>
                    </div>

                    <p
                      v-if="item.comment.reply_to_nickname"
                      class="mt-1 text-[11.5px] text-slate-400 dark:text-slate-500"
                    >
                      回复 @{{ item.comment.reply_to_nickname }}
                    </p>

                    <div class="ai-review-content mt-2" :title="item.comment.content">
                      {{ item.comment.content }}
                    </div>

                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                      <span
                        class="ai-review-verdict"
                        :class="
                          item.aiPass === true
                            ? 'is-pass'
                            : item.aiPass === false
                              ? 'is-reject'
                              : 'is-unknown'
                        "
                      >
                        <el-icon :size="12">
                          <CircleCheckFilled v-if="item.aiPass === true" />
                          <CircleCloseFilled v-else-if="item.aiPass === false" />
                          <WarningFilled v-else />
                        </el-icon>
                        {{
                          item.aiPass === true
                            ? 'AI 建议通过'
                            : item.aiPass === false
                              ? 'AI 建议不通过'
                              : 'AI 未判断'
                        }}
                      </span>
                      <span class="text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                        {{ item.reason }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 最终决定：默认跟随 AI，博主可以手动切换 -->
                <div class="ai-review-decision shrink-0">
                  <span class="ai-review-decision-label">最终决定</span>
                  <div class="ai-review-segmented" role="group" aria-label="是否通过这条评论">
                    <button
                      type="button"
                      class="ai-decision-btn is-pass"
                      :class="{ 'is-active': item.pass }"
                      :aria-pressed="item.pass"
                      @click="item.pass = true"
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      class="ai-decision-btn is-reject"
                      :class="{ 'is-active': !item.pass }"
                      :aria-pressed="!item.pass"
                      @click="item.pass = false"
                    >
                      不通过
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- 底部 -->
          <footer
            class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/30"
          >
            <p class="text-[12px] text-slate-500 dark:text-slate-400">
              <template v-if="loading">正在等待 AI 判断…</template>
              <template v-else-if="error">这次没有结果，可以重试</template>
              <template v-else>
                建议通过
                <span class="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  {{ suggestedPassCount }}
                </span>
                条 · 你选择了
                <span class="font-medium tabular-nums text-sky-600 dark:text-sky-400">
                  {{ passCount }}
                </span>
                / {{ localItems.length }} 条
              </template>
            </p>

            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="ai-review-cancel"
                :disabled="loading || submitting"
                @click="close"
              >
                取消
              </button>
              <button
                type="button"
                class="ai-review-confirm"
                :disabled="loading || submitting || Boolean(error) || passCount === 0"
                @click="confirm"
              >
                <el-icon v-if="submitting" :size="13" class="animate-spin">
                  <Loading />
                </el-icon>
                {{ submitting ? '通过中…' : `通过所选 ${passCount} 条` }}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Close,
  Loading,
  MagicStick,
  RefreshRight,
  WarningFilled,
} from '@element-plus/icons-vue'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import type { AiReviewItem } from './types'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    items: AiReviewItem[]
    loading?: boolean
    submitting?: boolean
    error?: string
  }>(),
  {
    loading: false,
    submitting: false,
    error: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [ids: string[]]
  retry: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const localItems = ref<AiReviewItem[]>([])

// 复制一份 AI 结果，手动调整只影响弹窗内的最终决定，不改父级数据
watch(
  () => props.items,
  (items) => {
    localItems.value = items.map((item) => ({ ...item }))
  },
  { deep: true, immediate: true },
)

const passItems = computed(() => localItems.value.filter((item) => item.pass))
const passCount = computed(() => passItems.value.length)
const suggestedPassCount = computed(
  () => localItems.value.filter((item) => item.aiPass === true).length,
)

function close() {
  if (props.loading || props.submitting) return
  emit('update:modelValue', false)
}

function onMaskClick() {
  close()
}

function confirm() {
  if (props.loading || props.submitting || props.error || !passItems.value.length) return
  emit(
    'confirm',
    passItems.value.map((item) => item.comment.id),
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.modelValue) return
  event.preventDefault()
  close()
}

// 打开时锁滚动、把焦点移进弹窗；关闭时恢复
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
  document.body.style.overflow = previousOverflow
})
</script>

<style scoped>
.ai-review-mask {
  position: absolute;
  inset: 0;
}

.ai-review-card {
  font-family: inherit;
}

.ai-review-icon {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #818cf8, #2563eb);
  color: #fff;
  box-shadow: 0 10px 24px -14px rgba(37, 99, 235, 0.9);
}

.ai-review-close {
  display: grid;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  color: #94a3b8;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.ai-review-close:hover:not(:disabled) {
  background: #f1f5f9;
  color: #475569;
}

.ai-review-close:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

:global(html.dark) .ai-review-close:hover:not(:disabled) {
  background: #1e293b;
  color: #cbd5e1;
}

/* ---------- 加载 ---------- */
.ai-review-loading-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%);
}

:global(html.dark) .ai-review-loading-tip {
  border-color: rgba(99, 102, 241, 0.28);
  background: linear-gradient(135deg, rgba(49, 46, 129, 0.28) 0%, rgba(8, 47, 73, 0.26) 100%);
}

.ai-review-spinner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
  border: 2px solid rgba(99, 102, 241, 0.22);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: ai-review-spin 0.8s linear infinite;
}

@keyframes ai-review-spin {
  to {
    transform: rotate(360deg);
  }
}

.ai-review-skeleton {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

:global(html.dark) .ai-review-skeleton {
  border-color: #1e293b;
  background: #0f172a;
}

.ai-review-skeleton-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #edf1f6;
  animation: ai-review-pulse 1.5s ease-in-out infinite;
}

.ai-review-skeleton-line {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: #edf1f6;
  animation: ai-review-pulse 1.5s ease-in-out infinite;
}

:global(html.dark) .ai-review-skeleton-avatar,
:global(html.dark) .ai-review-skeleton-line {
  background: rgba(148, 163, 184, 0.18);
}

@keyframes ai-review-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

/* ---------- 错误 ---------- */
.ai-review-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px 40px;
  text-align: center;
}

.ai-review-error-icon {
  display: grid;
  height: 48px;
  width: 48px;
  place-items: center;
  border-radius: 14px;
  background: #fffbeb;
  color: #f59e0b;
}

:global(html.dark) .ai-review-error-icon {
  background: rgba(120, 53, 15, 0.3);
  color: #fbbf24;
}

.ai-review-retry {
  display: inline-flex;
  align-items: center;
  margin-top: 16px;
  padding: 7px 16px;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12.5px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.ai-review-retry:hover {
  border-color: #a5b4fc;
  background: #e0e7ff;
}

:global(html.dark) .ai-review-retry {
  border-color: rgba(129, 140, 248, 0.3);
  background: rgba(49, 46, 129, 0.3);
  color: #a5b4fc;
}

/* ---------- 结果条目 ---------- */
.ai-review-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-left-width: 3px;
  border-radius: 12px;
  background: #fff;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.ai-review-item.is-pass {
  border-left-color: #34d399;
}

.ai-review-item.is-reject {
  border-left-color: #fca5a5;
  background: #fffafa;
}

:global(html.dark) .ai-review-item {
  border-color: #1e293b;
  background: #0f172a;
}

:global(html.dark) .ai-review-item.is-reject {
  background: rgba(127, 29, 29, 0.08);
}

@media (min-width: 720px) {
  .ai-review-item {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.ai-review-content {
  max-height: 112px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
  scrollbar-width: thin;
}

:global(html.dark) .ai-review-content {
  color: #cbd5e1;
}

.ai-review-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 10px;
  line-height: 17px;
}

.ai-review-badge.is-owner {
  background: #eef4fb;
  color: #3f74ad;
}

.ai-review-badge.is-reply {
  background: #f1f5f9;
  color: #64748b;
}

:global(html.dark) .ai-review-badge.is-owner {
  background: rgba(95, 166, 221, 0.16);
  color: #bfdbfe;
}

:global(html.dark) .ai-review-badge.is-reply {
  background: #1e293b;
  color: #94a3b8;
}

.ai-review-verdict {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 18px;
}

.ai-review-verdict.is-pass {
  background: #ecfdf5;
  color: #059669;
}

.ai-review-verdict.is-reject {
  background: #fff1f2;
  color: #e11d48;
}

.ai-review-verdict.is-unknown {
  background: #f8fafc;
  color: #64748b;
}

:global(html.dark) .ai-review-verdict.is-pass {
  background: rgba(6, 78, 59, 0.36);
  color: #6ee7b7;
}

:global(html.dark) .ai-review-verdict.is-reject {
  background: rgba(136, 19, 55, 0.3);
  color: #fda4af;
}

:global(html.dark) .ai-review-verdict.is-unknown {
  background: #1e293b;
  color: #94a3b8;
}

/* ---------- 最终决定 ---------- */
.ai-review-decision {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 720px) {
  .ai-review-decision {
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    padding-top: 2px;
  }
}

.ai-review-decision-label {
  color: #94a3b8;
  font-size: 10.5px;
}

:global(html.dark) .ai-review-decision-label {
  color: #64748b;
}

.ai-review-segmented {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 9px;
  background: #f1f5f9;
}

:global(html.dark) .ai-review-segmented {
  background: #1e293b;
}

.ai-decision-btn {
  padding: 4px 12px;
  border-radius: 7px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.ai-decision-btn.is-pass.is-active {
  background: #fff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.ai-decision-btn.is-reject.is-active {
  background: #fff;
  color: #e11d48;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

:global(html.dark) .ai-decision-btn.is-pass.is-active {
  background: #334155;
  color: #6ee7b7;
}

:global(html.dark) .ai-decision-btn.is-reject.is-active {
  background: #334155;
  color: #fda4af;
}

/* ---------- 底部按钮 ---------- */
.ai-review-cancel,
.ai-review-confirm {
  display: inline-flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 9px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.ai-review-cancel {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}

.ai-review-cancel:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.ai-review-confirm {
  border: 1px solid #34d399;
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 6px 14px -10px rgba(5, 150, 105, 0.8);
}

.ai-review-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.ai-review-cancel:disabled,
.ai-review-confirm:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

:global(html.dark) .ai-review-cancel {
  border-color: #334155;
  background: #1e293b;
  color: #cbd5e1;
}

:global(html.dark) .ai-review-cancel:hover:not(:disabled) {
  border-color: #475569;
  background: #334155;
  color: #f1f5f9;
}

/* ---------- 过渡 ---------- */
.ai-review-enter-active,
.ai-review-leave-active {
  transition: opacity 0.2s ease;
}

.ai-review-enter-from,
.ai-review-leave-to {
  opacity: 0;
}

.ai-review-enter-active .ai-review-card {
  animation: ai-review-pop 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.ai-review-leave-active .ai-review-card {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.ai-review-leave-to .ai-review-card {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

@keyframes ai-review-pop {
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
  .ai-review-spinner {
    animation: none;
  }

  .ai-review-skeleton-avatar,
  .ai-review-skeleton-line {
    animation: none;
  }

  .ai-review-enter-active .ai-review-card,
  .ai-review-leave-active .ai-review-card {
    animation: none;
    transition: none;
  }
}
</style>
