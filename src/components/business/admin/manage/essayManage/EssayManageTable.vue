<template>
  <AdminTableShell
    :data="rows"
    :list="list"
    :current-page="currentPage"
    unit="篇"
    :empty-title="emptyTitle"
    class="min-h-0 flex-1"
    @page-jump="emit('pageJump', $event)"
  >
    <el-table-column label="随笔" min-width="420" align="left">
      <template #default="{ row }">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p
              class="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200"
              :title="row.title"
            >
              {{ row.title }}
            </p>
            <span v-if="!row.is_visible" class="essay-hidden-warning">前台隐藏</span>
          </div>
          <p class="essay-manage-excerpt" :title="essayExcerpt(row.content, 130)">
            {{ essayExcerpt(row.content, 130) }}
          </p>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="互动" width="130" align="left">
      <template #default="{ row }">
        <div class="flex items-center gap-1.5">
          <span class="essay-count-chip is-like" title="点赞数">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M9.65 17.15a.9.9 0 0 0 .7 0c.26-.1 6.4-3.68 6.4-8.4A4.35 4.35 0 0 0 12.4 4.4c-.98 0-1.9.37-2.4 1.02-.5-.65-1.42-1.02-2.4-1.02A4.35 4.35 0 0 0 3.25 8.75c0 4.72 6.14 8.3 6.4 8.4Z"
              />
            </svg>
            {{ row.like_count }}
          </span>
          <span class="essay-count-chip" title="评论数">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M3.5 3.75A1.75 1.75 0 0 1 5.25 2h9.5A1.75 1.75 0 0 1 16.5 3.75v7.5A1.75 1.75 0 0 1 14.75 13H9.06l-3.2 2.77A.75.75 0 0 1 4.67 15.2V13h-.92A1.75 1.75 0 0 1 2 11.25v-7.5A1.75 1.75 0 0 1 3.5 3.75Z"
              />
            </svg>
            {{ row.comment_count }}
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="状态" width="100" align="left">
      <template #default="{ row }">
        <el-tag size="small" effect="light" round :type="row.is_visible ? 'success' : 'info'">
          {{ row.is_visible ? '显示中' : '隐藏中' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="发布时间" width="135" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.published_at ? formatDate(row.published_at, false) : '—' }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="210" align="right" header-align="right">
      <template #default="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <el-button
            link
            size="small"
            class="admin-row-action admin-row-action--edit"
            :disabled="Boolean(busyId)"
            @click="emit('edit', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="m13.6 2.7 3.7 3.7-9.1 9.1-4.2 1.1a.75.75 0 0 1-.92-.92l1.1-4.2 9.42-9.42ZM12.4 5l2.6 2.6"
              />
            </svg>
            编辑
          </el-button>

          <el-button
            link
            size="small"
            class="admin-row-action"
            :class="row.is_visible ? 'admin-row-action--reject' : 'admin-row-action--approve'"
            :disabled="Boolean(busyId)"
            @click="emit('toggle', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                v-if="row.is_visible"
                d="M2.3 2.3a.9.9 0 0 1 1.3 0l14.1 14.1a.9.9 0 0 1-1.3 1.3l-2.3-2.3a9.2 9.2 0 0 1-4.1.9 9.1 9.1 0 0 1-8.2-5.4 1.4 1.4 0 0 1 0-1.2 9.5 9.5 0 0 1 2.6-3.3L2.3 3.6a.9.9 0 0 1 0-1.3Zm4.1 5.4a9.4 9.4 0 0 0-2.2 2.6 7.3 7.3 0 0 0 6.3 3.6c1 0 1.9-.2 2.8-.6l-1.6-1.6a3.7 3.7 0 0 1-4.9-4.9L6.4 7.7Z"
              />
              <path
                v-else
                d="M10 3.5c-3.6 0-6.7 2.2-8.2 5.4a1.4 1.4 0 0 0 0 1.2A9.1 9.1 0 0 0 10 15.5c3.6 0 6.7-2.2 8.2-5.4a1.4 1.4 0 0 0 0-1.2A9.1 9.1 0 0 0 10 3.5Zm0 10.2a3.7 3.7 0 1 1 0-7.4 3.7 3.7 0 0 1 0 7.4Z"
              />
            </svg>
            {{ row.is_visible ? '隐藏' : '显示' }}
          </el-button>

          <el-button
            link
            size="small"
            class="admin-row-action admin-row-action--danger"
            :disabled="Boolean(busyId)"
            @click="emit('remove', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482 41.03 41.03 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
              />
            </svg>
            删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </AdminTableShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminEssayRow, AdminEssayStatusFilter } from '@/api/adminEssays'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'
import { formatDate } from '@/utils/date'
import { essayExcerpt } from '@/utils/essay'

const props = defineProps<{
  rows?: AdminEssayRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  status?: AdminEssayStatusFilter
  busyId?: string | null
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  edit: [row: AdminEssayRow]
  toggle: [row: AdminEssayRow]
  remove: [row: AdminEssayRow]
}>()

const STATUS_PHRASE: Record<AdminEssayStatusFilter, string> = {
  visible: '显示中的随笔',
  hidden: '隐藏中的随笔',
  all: '随笔',
}

const emptyTitle = computed(() => {
  const keyword = props.keyword?.trim()
  const short = keyword && keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword
  const phrase = STATUS_PHRASE[props.status ?? 'visible'] ?? '随笔'

  if (short) return `没有找到包含「${short}」的${phrase}`
  if (props.status === 'hidden') return '还没有隐藏中的随笔'
  if (props.status === 'visible') return '还没有显示中的随笔'
  return '还没有发布随笔'
})
</script>

<style scoped>
.essay-manage-excerpt {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.essay-hidden-warning {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 6px;
  background: #fffbeb;
  color: #b45309;
  font-size: 9.5px;
  line-height: 17px;
}

.essay-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 999px;
  padding: 0 7px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  line-height: 19px;
}

.essay-count-chip svg {
  height: 10px;
  width: 10px;
}

.essay-count-chip.is-like {
  background: #fff5f7;
  color: #b56a7a;
}

:global(html.dark) .essay-manage-excerpt {
  color: #64748b;
}

:global(html.dark) .essay-hidden-warning {
  background: rgba(120, 53, 15, 0.28);
  color: #fcd34d;
}

:global(html.dark) .essay-count-chip {
  background: #1e293b;
  color: #64748b;
}

:global(html.dark) .essay-count-chip.is-like {
  background: rgba(150, 60, 80, 0.18);
  color: #f3a9b8;
}
</style>
