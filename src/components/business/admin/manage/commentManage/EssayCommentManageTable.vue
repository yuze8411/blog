<template>
  <AdminTableShell
    :data="rows"
    :list="list"
    :current-page="currentPage"
    unit="条"
    :empty-title="emptyTitle"
    class="min-h-0 flex-1"
    @page-jump="emit('pageJump', $event)"
    @selection-change="emit('selectionChange', $event)"
  >
    <el-table-column type="selection" width="48" />

    <el-table-column label="评论者" width="150" align="left">
      <template #default="{ row }">
        <div class="flex items-center gap-2.5">
          <CommentAvatar :name="row.nickname" :src="row.avatar_url || undefined" :size="34" />
          <div class="min-w-0">
            <p
              class="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200"
              :title="row.nickname"
            >
              {{ row.nickname }}
            </p>
            <span v-if="row.is_owner" class="essay-comment-owner-badge">博主</span>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="评论内容" min-width="360" align="left">
      <template #default="{ row }">
        <div class="min-w-0">
          <p class="essay-comment-admin-text" :title="row.content">{{ row.content }}</p>
          <a
            v-if="row.website_url"
            :href="row.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="essay-comment-admin-link"
            :title="row.website_url"
          >
            {{ row.website_url }}
          </a>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="所属随笔" width="180" align="left">
      <template #default="{ row }">
        <span
          class="block truncate text-[12px] text-slate-500 dark:text-slate-400"
          :title="row.essay_title"
        >
          {{ row.essay_title }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="状态" width="96" align="left">
      <template #default="{ row }">
        <el-tag size="small" effect="light" round :type="statusMeta(row.status).type">
          {{ statusMeta(row.status).label }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="时间" width="142" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ formatDate(row.created_at) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="206" align="right" header-align="right">
      <template #default="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <el-button
            v-if="row.status !== 'approved'"
            link
            size="small"
            class="admin-row-action admin-row-action--approve"
            @click="emit('approve', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              />
            </svg>
            通过
          </el-button>

          <el-button
            v-if="row.status !== 'hidden' && row.status !== 'spam'"
            link
            size="small"
            class="admin-row-action admin-row-action--reject"
            @click="emit('reject', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
              />
            </svg>
            {{ row.status === 'approved' ? '隐藏' : '不通过' }}
          </el-button>

          <el-button
            link
            size="small"
            class="admin-row-action admin-row-action--danger"
            @click="emit('delete', row)"
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
import type {
  AdminEssayCommentRow,
  AdminEssayCommentStatus,
  AdminEssayCommentStatusFilter,
} from '@/api/adminEssayComments'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  rows?: AdminEssayCommentRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  status?: AdminEssayCommentStatusFilter
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  approve: [row: AdminEssayCommentRow]
  reject: [row: AdminEssayCommentRow]
  delete: [row: AdminEssayCommentRow]
  selectionChange: [rows: AdminEssayCommentRow[]]
}>()

type TagType = 'success' | 'warning' | 'info' | 'danger'

function statusMeta(status: AdminEssayCommentStatus): { label: string; type: TagType } {
  if (status === 'approved') return { label: '已通过', type: 'success' }
  if (status === 'hidden') return { label: '未通过', type: 'info' }
  if (status === 'spam') return { label: '垃圾', type: 'danger' }
  return { label: '待审核', type: 'warning' }
}

const STATUS_PHRASE: Record<string, string> = {
  pending: '待审核的随笔评论',
  approved: '已通过的随笔评论',
  rejected: '未通过的随笔评论',
  all: '',
}

const emptyTitle = computed(() => {
  const query = props.status ?? 'pending'
  const keyword = props.keyword?.trim()
  const keywordPhrase = keyword
    ? `「${keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword}」`
    : ''
  const statusPhrase = STATUS_PHRASE[query] ?? ''

  if (keywordPhrase) return `没有找到包含 ${keywordPhrase} 的${statusPhrase || '随笔评论'}`
  if (statusPhrase) return `暂无${statusPhrase}`
  return '还没有任何随笔评论'
})
</script>

<style scoped>
.essay-comment-owner-badge {
  display: inline-block;
  margin-top: 3px;
  border-radius: 999px;
  padding: 0 5px;
  background: #eef4fb;
  color: #3f74ad;
  font-size: 9.5px;
  line-height: 16px;
}

.essay-comment-admin-text {
  display: -webkit-box;
  overflow: hidden;
  color: #475569;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.essay-comment-admin-link {
  display: block;
  max-width: 320px;
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.essay-comment-admin-link:hover {
  color: #0284c7;
}

:global(html.dark) .essay-comment-owner-badge {
  background: rgba(95, 166, 221, 0.16);
  color: #bfdbfe;
}

:global(html.dark) .essay-comment-admin-text {
  color: #cbd5e1;
}

:global(html.dark) .essay-comment-admin-link {
  color: #64748b;
}

:global(html.dark) .essay-comment-admin-link:hover {
  color: #7dd3fc;
}
</style>
