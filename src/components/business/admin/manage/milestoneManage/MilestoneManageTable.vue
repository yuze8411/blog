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
    <!-- 文章 -->
    <el-table-column label="文章" min-width="430" align="left">
      <template #default="{ row }">
        <div class="flex items-center gap-3">
          <el-image
            :src="row.cover_url || undefined"
            :alt="row.title"
            fit="cover"
            lazy
            class="admin-milestone-thumb"
          >
            <template #error>
              <span class="admin-milestone-thumb-error">
                <IconFont name="tupian" class="text-[15px]" />
              </span>
            </template>
          </el-image>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p
                class="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200"
                :title="row.title"
              >
                {{ row.title }}
              </p>
              <span v-if="!row.is_published" class="milestone-post-warning">文章未发布</span>
              <span v-else-if="!row.post_is_visible" class="milestone-post-warning">
                文章已隐藏
              </span>
            </div>
            <p class="admin-milestone-excerpt" :title="row.excerpt || '暂无摘要'">
              {{ row.excerpt || '暂无摘要' }}
            </p>
          </div>
        </div>
      </template>
    </el-table-column>

    <!-- 发布时间：时光轴上的位置由这个时间自动决定 -->
    <el-table-column label="发布时间" width="140" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.published_at ? formatDate(row.published_at, false) : '未设置' }}
        </span>
      </template>
    </el-table-column>

    <!-- 展示状态 -->
    <el-table-column label="状态" width="100" align="left">
      <template #default="{ row }">
        <el-tag size="small" effect="light" round :type="row.is_visible ? 'success' : 'info'">
          {{ row.is_visible ? '展示中' : '隐藏中' }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- 操作 -->
    <el-table-column label="操作" width="168" align="right" header-align="right">
      <template #default="{ row }">
        <div class="flex items-center justify-end gap-0.5">
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
            {{ row.is_visible ? '隐藏' : '展示' }}
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
            移除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </AdminTableShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminMilestoneRow, AdminMilestoneStatusFilter } from '@/api/adminMilestones'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  rows?: AdminMilestoneRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  status?: AdminMilestoneStatusFilter
  /** 正在切换展示状态的行，操作期间禁用整列按钮 */
  busyId?: string | null
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  toggle: [row: AdminMilestoneRow]
  remove: [row: AdminMilestoneRow]
}>()

const STATUS_PHRASE: Record<AdminMilestoneStatusFilter, string> = {
  visible: '展示中的文章',
  hidden: '隐藏中的文章',
  all: '文章',
}

const emptyTitle = computed(() => {
  const keyword = props.keyword?.trim()
  const short = keyword && keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword
  const statusPhrase = STATUS_PHRASE[props.status ?? 'visible'] ?? '文章'

  if (short) return `没有找到包含「${short}」的${statusPhrase}`
  if (props.status === 'hidden') return '时光轴上还没有隐藏中的文章'
  if (props.status === 'visible') return '时光轴上还没有展示中的文章'
  return '时光轴上还没有文章'
})
</script>

<style scoped>
.admin-milestone-thumb {
  height: 48px;
  width: 68px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f5f9;
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.6);
}

.admin-milestone-thumb-error {
  display: grid;
  height: 100%;
  width: 100%;
  place-items: center;
  background: #f1f5f9;
  color: #cbd5e1;
}

.admin-milestone-excerpt {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.milestone-post-warning {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 6px;
  background: #fffbeb;
  color: #b45309;
  font-size: 9.5px;
  line-height: 17px;
}

:global(html.dark) .admin-milestone-thumb {
  background: #1e293b;
  box-shadow: inset 0 0 0 1px rgba(51, 65, 85, 0.8);
}

:global(html.dark) .admin-milestone-thumb-error {
  background: #1e293b;
  color: #475569;
}

:global(html.dark) .admin-milestone-excerpt {
  color: #64748b;
}

:global(html.dark) .milestone-post-warning {
  background: rgba(120, 53, 15, 0.28);
  color: #fcd34d;
}
</style>
