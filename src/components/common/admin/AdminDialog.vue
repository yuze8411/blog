<!--
  后台表单弹窗：分类、标签、游记的新增 / 编辑共用。

  用法：
  <AdminDialog v-model="visible" title="新增分类" :loading="saving" @confirm="save">
    <AdminFormField label="名称">...</AdminFormField>
  </AdminDialog>

  - 点取消 / 遮罩 / Esc 关闭；操作进行中（loading）时不会误关。
  - 点确认只抛 confirm 事件，请求成功后再由父级把 visible 设为 false。
-->
<template>
  <el-dialog
    v-model="visible"
    append-to-body
    align-center
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    :width="width"
    class="admin-dialog"
    modal-class="admin-dialog-overlay"
  >
    <template #header>
      <header class="admin-dialog-head">
        <div class="flex min-w-0 items-start gap-3">
          <span class="admin-dialog-icon">
            <slot name="icon">
              <el-icon :size="16"><EditPen /></el-icon>
            </slot>
          </span>

          <div class="min-w-0">
            <h2 class="text-[16px] font-semibold text-slate-800 dark:text-slate-100">
              {{ title }}
            </h2>
            <p
              v-if="description"
              class="mt-0.5 text-[12px] leading-5 text-slate-500 dark:text-slate-400"
            >
              {{ description }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="admin-dialog-close"
          aria-label="关闭弹窗"
          :disabled="loading"
          @click="close"
        >
          <el-icon :size="14"><Close /></el-icon>
        </button>
      </header>
    </template>

    <div class="admin-dialog-body">
      <slot />
    </div>

    <template #footer>
      <footer class="admin-dialog-footer">
        <button type="button" class="admin-dialog-cancel" :disabled="loading" @click="close">
          {{ cancelText }}
        </button>

        <button
          type="button"
          class="admin-dialog-confirm"
          :class="danger ? 'is-danger' : ''"
          :disabled="loading || confirmDisabled"
          @click="emit('confirm')"
        >
          <span v-if="loading" class="admin-dialog-spinner" aria-hidden="true"></span>
          {{ loading ? loadingText : confirmText }}
        </button>
      </footer>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Close, EditPen } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title: string
    /** 标题下方的一行说明，可不传 */
    description?: string
    confirmText?: string
    cancelText?: string
    loadingText?: string
    /** 请求进行中：禁用按钮和关闭操作 */
    loading?: boolean
    /** 其它校验没通过时禁用确认按钮 */
    confirmDisabled?: boolean
    /** 危险操作（例如删除）用玫红色确认按钮 */
    danger?: boolean
    /** 弹窗宽度，默认适配手机 */
    width?: string
  }>(),
  {
    description: '',
    confirmText: '保存',
    cancelText: '取消',
    loadingText: '保存中…',
    loading: false,
    confirmDisabled: false,
    danger: false,
    width: 'min(520px, calc(100vw - 32px))',
  },
)

const emit = defineEmits<{
  confirm: []
}>()

const visible = defineModel<boolean>({ default: false })

function close() {
  if (props.loading) return
  visible.value = false
}
</script>

<style scoped>
/* el-dialog 会被 teleport 到 body，暗色和细节样式要写成全局的 */
:global(.admin-dialog) {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 28px 70px -30px rgba(15, 23, 42, 0.4);
}

:global(.admin-dialog .el-dialog__header) {
  margin: 0;
  padding: 0;
}

:global(.admin-dialog .el-dialog__body) {
  padding: 0;
}

:global(.admin-dialog .el-dialog__footer) {
  padding: 0;
}

:global(.admin-dialog-head) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 20px;
  background: linear-gradient(90deg, #f8fbff 0%, #fff 70%);
}

:global(.admin-dialog-icon) {
  display: grid;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 10px;
  background: #eff6ff;
  color: #3b82f6;
  box-shadow: inset 0 0 0 1px #dbeafe;
}

:global(.admin-dialog-close) {
  display: grid;
  height: 28px;
  width: 28px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  color: #94a3b8;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

:global(.admin-dialog-close:hover:not(:disabled)) {
  background: #f1f5f9;
  color: #475569;
}

:global(.admin-dialog-close:disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}

:global(.admin-dialog-body) {
  max-height: min(62vh, 640px);
  overflow-y: auto;
  padding: 18px 20px 4px;
}

:global(.admin-dialog-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding: 14px 20px;
}

:global(.admin-dialog-cancel) {
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 16px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

:global(.admin-dialog-cancel:hover:not(:disabled)) {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

:global(.admin-dialog-confirm) {
  display: inline-flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  padding: 0 18px;
  background-image: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 6px 16px -9px rgba(37, 99, 235, 0.75);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

:global(.admin-dialog-confirm:hover:not(:disabled)) {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px -10px rgba(37, 99, 235, 0.8);
}

:global(.admin-dialog-confirm.is-danger) {
  background-image: linear-gradient(135deg, #fb7185 0%, #e11d48 100%);
  box-shadow: 0 6px 16px -9px rgba(225, 29, 72, 0.7);
}

:global(.admin-dialog-confirm:disabled),
:global(.admin-dialog-cancel:disabled) {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

:global(.admin-dialog-spinner) {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 999px;
  animation: admin-dialog-spin 0.7s linear infinite;
}

@keyframes admin-dialog-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark .admin-dialog) {
  border-color: #334155;
  background: #0f172a;
  box-shadow: 0 28px 70px -30px rgba(0, 0, 0, 0.9);
}

:global(html.dark .admin-dialog-head) {
  border-bottom-color: #1e293b;
  background: linear-gradient(90deg, rgba(30, 41, 59, 0.65) 0%, #0f172a 70%);
}

:global(html.dark .admin-dialog-icon) {
  background: rgba(2, 132, 199, 0.16);
  color: #7dd3fc;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.2);
}

:global(html.dark .admin-dialog-close) {
  color: #64748b;
}

:global(html.dark .admin-dialog-close:hover:not(:disabled)) {
  background: #1e293b;
  color: #cbd5e1;
}

:global(html.dark .admin-dialog-footer) {
  border-top-color: #1e293b;
}

:global(html.dark .admin-dialog-cancel) {
  border-color: #334155;
  background: #111c2e;
  color: #94a3b8;
}

:global(html.dark .admin-dialog-cancel:hover:not(:disabled)) {
  border-color: #475569;
  background: #1e293b;
  color: #cbd5e1;
}

/* 遮罩在深色下再压暗一点 */
:global(html.dark .admin-dialog-overlay) {
  background-color: rgba(2, 6, 23, 0.65);
}

@media (prefers-reduced-motion: reduce) {
  :global(.admin-dialog-confirm),
  :global(.admin-dialog-close) {
    transition: none;
  }

  :global(.admin-dialog-spinner) {
    animation: none;
  }
}
</style>
