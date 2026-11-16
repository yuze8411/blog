<template>
  <aside
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.4)] transition-colors dark:border-slate-800 dark:bg-slate-900"
  >
    <header
      class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
    >
      <div>
        <h2 class="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">随笔设置</h2>
        <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">标题、展示状态与发布</p>
      </div>
      <span
        class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700"
      >
        <el-icon :size="15"><Setting /></el-icon>
      </span>
    </header>

    <el-scrollbar class="min-h-0 flex-1">
      <div class="essay-edit-form p-4">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="text-[10.5px] font-medium tracking-[0.12em] text-slate-400 dark:text-slate-500"
          >
            随笔信息
          </span>
          <span
            class="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"
          />
        </div>

        <el-form label-position="top" @submit.prevent>
          <el-form-item label="标题" required>
            <el-input
              v-model="title"
              maxlength="120"
              show-word-limit
              placeholder="给这篇随笔起个标题"
            />
          </el-form-item>

          <el-form-item label="前台展示">
            <div class="essay-visible-row">
              <div class="min-w-0">
                <p class="essay-visible-text">
                  {{ isPublished ? '发布后是否出现在随笔页' : '发布时会按这个设置展示' }}
                </p>
                <p class="essay-visible-hint">
                  {{ visible ? '当前设置：展示中' : '当前设置：隐藏中' }}
                </p>
              </div>
              <el-switch v-model="visible" />
            </div>
          </el-form-item>
        </el-form>

        <div class="essay-status-card">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[11px] text-slate-400 dark:text-slate-500">当前状态</span>
            <span class="essay-status-pill" :class="statusTone">{{ statusText }}</span>
          </div>
          <p class="mt-2 text-[10.5px] leading-5 text-slate-400 dark:text-slate-500">
            随笔只保存标题和 Markdown 正文，不需要封面、标签或分类。
          </p>
        </div>
      </div>
    </el-scrollbar>

    <div
      class="essay-edit-actions shrink-0 space-y-2.5 border-t border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <el-button
        class="essay-publish-btn w-full"
        size="large"
        :loading="publishing"
        :disabled="saving || aiBusy"
        @click="emit('publish')"
      >
        <el-icon class="mr-1.5"><Promotion /></el-icon>
        {{ isPublished ? '更新随笔' : '发布随笔' }}
      </el-button>

      <el-button
        class="essay-draft-btn w-full"
        size="large"
        :loading="saving"
        :disabled="publishing || aiBusy"
        @click="emit('draft')"
      >
        <el-icon class="mr-1.5"><DocumentAdd /></el-icon>存入草稿箱
      </el-button>

      <div class="grid grid-cols-2 gap-2">
        <el-button
          class="essay-grid-btn"
          :disabled="saving || publishing || aiBusy"
          @click="emit('openDrafts')"
        >
          <el-icon class="mr-1"><Files /></el-icon>草稿箱
        </el-button>
        <el-button
          class="essay-grid-btn"
          :disabled="saving || publishing || aiBusy"
          @click="emit('back')"
        >
          <el-icon class="mr-1"><Back /></el-icon>返回管理
        </el-button>
      </div>

      <div class="pt-1">
        <el-button
          class="essay-ai-btn w-full"
          :class="{ 'is-on': aiMode }"
          size="large"
          :disabled="saving || publishing || aiBusy"
          @click="emit('toggleAi')"
        >
          <el-icon class="mr-1.5"><MagicStick /></el-icon>
          {{ aiMode ? '返回手动写作' : 'AI 润色' }}
        </el-button>
        <p class="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
          {{ aiMode ? 'AI 只会基于当前正文润色' : '让 AI 优化结构、润色语言' }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Back, DocumentAdd, Files, MagicStick, Promotion, Setting } from '@element-plus/icons-vue'

const props = defineProps<{
  isPublished: boolean
  saving: boolean
  publishing: boolean
  aiMode: boolean
  aiBusy: boolean
}>()

const emit = defineEmits<{
  publish: []
  draft: []
  openDrafts: []
  back: []
  toggleAi: []
}>()

const title = defineModel<string>('title', { default: '' })
const visible = defineModel<boolean>('visible', { default: true })

const statusText = computed(() => {
  if (!props.isPublished) return '草稿'
  return visible.value ? '已发布 · 展示中' : '已发布 · 隐藏中'
})

const statusTone = computed(() => {
  if (!props.isPublished) return 'is-draft'
  return visible.value ? 'is-visible' : 'is-hidden'
})
</script>

<style scoped>
.essay-edit-form {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #cbd5e1;
  --el-input-focus-border-color: #38bdf8;
  --el-text-color-regular: #475569;
  --el-text-color-placeholder: #94a3b8;
}

:global(html.dark .essay-edit-form) {
  --el-input-bg-color: #0b1220;
  --el-input-border-color: #334155;
  --el-input-hover-border-color: #475569;
  --el-input-focus-border-color: #0ea5e9;
  --el-text-color-regular: #cbd5e1;
  --el-text-color-placeholder: #64748b;
}

.essay-edit-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.essay-edit-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.essay-edit-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

:global(html.dark .essay-edit-form .el-form-item__label) {
  color: #94a3b8;
}

.essay-visible-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #e8eff7;
  border-radius: 10px;
  padding: 9px 11px;
  background: #f9fcff;
}

.essay-visible-text {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.essay-visible-hint {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 10.5px;
}

:global(html.dark .essay-visible-row) {
  border-color: #26364d;
  background: rgba(17, 28, 44, 0.7);
}

:global(html.dark .essay-visible-text) {
  color: #94a3b8;
}

:global(html.dark .essay-visible-hint) {
  color: #64748b;
}

.essay-status-card {
  margin-top: 14px;
  border: 1px dashed #e2ebf4;
  border-radius: 11px;
  padding: 10px 11px;
  background: #fbfdff;
}

:global(html.dark .essay-status-card) {
  border-color: #26364d;
  background: rgba(17, 28, 44, 0.55);
}

.essay-status-pill {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 10.5px;
  line-height: 18px;
}

.essay-status-pill.is-draft {
  background: #f1f5f9;
  color: #64748b;
}

.essay-status-pill.is-visible {
  background: #ecfdf5;
  color: #047857;
}

.essay-status-pill.is-hidden {
  background: #fff7ed;
  color: #b45309;
}

:global(html.dark .essay-status-pill.is-draft) {
  background: #1e293b;
  color: #94a3b8;
}

:global(html.dark .essay-status-pill.is-visible) {
  background: rgba(16, 185, 129, 0.14);
  color: #6ee7b7;
}

:global(html.dark .essay-status-pill.is-hidden) {
  background: rgba(217, 119, 6, 0.16);
  color: #fcd34d;
}

.essay-edit-actions {
  --el-button-bg-color: #ffffff;
  --el-button-border-color: #e2e8f0;
  --el-button-text-color: #475569;
  --el-button-hover-bg-color: #f8fafc;
  --el-button-hover-border-color: #cbd5e1;
  --el-button-hover-text-color: #0f172a;
}

:global(html.dark .essay-edit-actions) {
  --el-button-bg-color: #0b1220;
  --el-button-border-color: #334155;
  --el-button-text-color: #cbd5e1;
  --el-button-hover-bg-color: #1e293b;
  --el-button-hover-border-color: #475569;
  --el-button-hover-text-color: #f1f5f9;
}

.essay-edit-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.essay-publish-btn,
.essay-draft-btn,
.essay-ai-btn {
  height: 42px;
  border-radius: 10px;
}

.essay-grid-btn {
  height: 34px;
  border-radius: 9px;
  font-size: 12px;
}

.essay-publish-btn {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
  --el-button-disabled-text-color: rgba(255, 255, 255, 0.75);
  border: none;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #fff;
  box-shadow: 0 10px 22px -14px rgba(37, 99, 235, 0.9);
}

.essay-publish-btn:hover,
.essay-publish-btn:focus {
  --el-button-hover-text-color: #fff;
  background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
  color: #fff;
}

.essay-draft-btn {
  font-weight: 500;
}

/* AI 润色按钮：默认淡紫，进入 AI 模式后变成实心渐变 */
.essay-ai-btn {
  --el-button-text-color: #4f46e5;
  --el-button-hover-text-color: #4338ca;
  --el-button-border-color: #c7d2fe;
  --el-button-hover-border-color: #a5b4fc;
  --el-button-bg-color: #eef2ff;
  --el-button-hover-bg-color: #e0e7ff;
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
}

.essay-ai-btn:hover,
.essay-ai-btn:focus {
  border-color: #a5b4fc;
  background: #e0e7ff;
  color: #4338ca;
}

.essay-ai-btn.is-on,
.essay-ai-btn.is-on:hover,
.essay-ai-btn.is-on:focus {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #6366f1, #2563eb);
  color: #fff;
  box-shadow: 0 10px 22px -14px rgba(79, 70, 229, 0.9);
}

:global(html.dark .essay-ai-btn) {
  --el-button-text-color: #a5b4fc;
  --el-button-hover-text-color: #c7d2fe;
  border-color: #4338ca;
  background: rgba(99, 102, 241, 0.14);
  color: #a5b4fc;
}

:global(html.dark .essay-ai-btn:hover) {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.24);
  color: #c7d2fe;
}

:global(html.dark .essay-ai-btn.is-on) {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #6366f1, #2563eb);
  color: #fff;
}
</style>
