<template>
  <el-drawer
    v-model="visible"
    class="admin-essay-draft-drawer"
    body-class="admin-essay-draft-body"
    size="380px"
    :with-header="false"
  >
    <div class="flex h-full flex-col">
      <header
        class="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-4 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60"
          >
            <el-icon :size="16"><Files /></el-icon>
          </span>
          <div>
            <h3 class="text-[15px] font-semibold text-slate-700 dark:text-slate-100">随笔草稿箱</h3>
            <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">
              共 {{ drafts.length }} 篇未发布草稿
            </p>
          </div>
        </div>
        <el-button text circle aria-label="关闭草稿箱" @click="visible = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </header>

      <div class="shrink-0 px-5 py-3">
        <el-button class="w-full" :loading="loading" @click="emit('refresh')">
          <el-icon class="mr-1"><Refresh /></el-icon>刷新列表
        </el-button>
      </div>

      <el-scrollbar class="min-h-0 flex-1">
        <div v-if="drafts.length" class="space-y-2 px-5 pb-5">
          <button
            v-for="item in drafts"
            :key="item.id"
            type="button"
            class="essay-draft-item group"
            @click="emit('load', item.id)"
          >
            <span class="min-w-0 flex-1">
              <span
                class="block truncate text-[13px] font-medium text-slate-600 dark:text-slate-200"
              >
                {{ item.title || '未命名随笔' }}
              </span>
              <span
                class="mt-1 block line-clamp-2 text-[11px] leading-5 text-slate-400 dark:text-slate-500"
              >
                {{ essayExcerpt(item.content, 70) }}
              </span>
              <span class="mt-2 block text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                最后修改：{{ formatTime(item.updated_at) }}
              </span>
            </span>
            <span class="essay-draft-arrow">
              <el-icon :size="14"><ArrowRight /></el-icon>
            </span>
          </button>
        </div>

        <el-empty
          v-else
          :description="loading ? '正在加载草稿…' : '草稿箱还是空的'"
          :image-size="88"
        />
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ArrowRight, Close, Files, Refresh } from '@element-plus/icons-vue'
import type { AdminEssayDraft } from '@/api/adminEssays'
import { essayExcerpt } from '@/utils/essay'

defineProps<{
  drafts: AdminEssayDraft[]
  loading: boolean
}>()

const emit = defineEmits<{
  load: [id: string]
  refresh: []
}>()

const visible = defineModel<boolean>({ default: false })

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
</script>

<style scoped>
.essay-draft-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  padding: 11px 12px;
  background: #fff;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.essay-draft-item:hover {
  border-color: #7dd3fc;
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -16px rgba(2, 132, 199, 0.8);
}

.essay-draft-arrow {
  display: inline-flex;
  flex-shrink: 0;
  color: #cbd5e1;
  opacity: 0;
  transform: translateX(-3px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.essay-draft-item:hover .essay-draft-arrow {
  color: #0284c7;
  opacity: 1;
  transform: translateX(0);
}

:global(html.dark .essay-draft-item) {
  border-color: #334155;
  background: #111c2e;
}

:global(html.dark .essay-draft-item:hover) {
  border-color: #0369a1;
  background: #13233c;
}

:global(html.dark .essay-draft-arrow) {
  color: #475569;
}

:global(html.dark .essay-draft-item:hover .essay-draft-arrow) {
  color: #7dd3fc;
}

:global(.admin-essay-draft-body) {
  padding: 0;
}

:global(html.dark .admin-essay-draft-drawer) {
  background-color: #0f172a;
  color: #cbd5e1;
}

@media (max-width: 479px) {
  :global(.admin-essay-draft-drawer) {
    width: 100% !important;
  }
}
</style>
