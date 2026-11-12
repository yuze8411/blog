<template>
  <div class="mt-1 flex h-[calc(100%-39px)] w-full flex-col pb-3">
    <div
      v-if="isTable"
      class="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800"
    >
      <el-table
        ref="tableRef"
        :data="commentList?.list ?? []"
        row-key="id"
        height="100%"
        class="admin-comment-table"
        @selection-change="onSelectionChange"
      >
        <!-- 勾选列：批量通过 / AI 审核 / 删除都靠它 -->
        <el-table-column type="selection" width="48" />

        <!-- 评论者 -->
        <el-table-column label="评论者" width="156" align="left">
          <template #default="{ row }">
            <div class="flex items-center gap-2.5">
              <CommentAvatar :name="row.nickname" :src="row.avatar_url || undefined" :size="36" />
              <div class="min-w-0">
                <p
                  class="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200"
                  :title="row.nickname"
                >
                  {{ row.nickname }}
                </p>
                <div class="mt-1 flex items-center gap-1">
                  <span v-if="row.is_owner" class="admin-owner-badge">博主</span>
                  <span class="text-[10.5px] text-slate-400 dark:text-slate-500">
                    {{ row.root_id ? '回复' : '评论' }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 评论内容：最多展示三行，悬停可看全文 -->
        <el-table-column label="评论内容" min-width="360" align="left">
          <template #default="{ row }">
            <div class="min-w-0">
              <p
                v-if="row.reply_to_nickname"
                class="mb-1 text-[11px] text-slate-400 dark:text-slate-500"
              >
                回复
                <span class="text-sky-600 dark:text-sky-400">@{{ row.reply_to_nickname }}</span>
              </p>
              <p class="admin-comment-text" :title="row.content">{{ row.content }}</p>
              <a
                v-if="row.website_url"
                :href="row.website_url"
                target="_blank"
                rel="noopener noreferrer"
                class="admin-comment-link"
                :title="row.website_url"
              >
                {{ row.website_url }}
              </a>
            </div>
          </template>
        </el-table-column>

        <!-- 所属文章：点标题去前台详情页 -->
        <el-table-column label="所属文章" width="176" align="left">
          <template #default="{ row }">
            <a
              v-if="row.post_slug"
              :href="postHref(row)"
              target="_blank"
              rel="noopener noreferrer"
              class="admin-post-link"
              :title="row.post_title"
            >
              {{ row.post_title }}
            </a>
            <span
              v-else
              class="block truncate text-[12px] text-slate-400 dark:text-slate-500"
              :title="row.post_title"
            >
              {{ row.post_title }}
            </span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="96" align="left">
          <template #default="{ row }">
            <el-tag size="small" effect="light" round :type="statusMeta(row.status).type">
              {{ statusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 评论时间 -->
        <el-table-column label="时间" width="142" align="left">
          <template #default="{ row }">
            <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
              {{ formatDate(row.created_at) }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作 -->
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
      </el-table>
    </div>

    <AdminBlank v-if="!isTable" :title="title" class="min-h-0 flex-1" />

    <ArticleManageContentPage
      v-if="isTable"
      :articleList="commentList"
      :current-page="searchquery?.page ?? 1"
      unit="条"
      class="mt-3 shrink-0"
      @pageJump="pageJump"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { AdminCommentRow, AdminCommentStatus } from '@/api/adminComments'
import AdminBlank from '@/components/common/admin/AdminBlank.vue'
import ArticleManageContentPage from '@/components/business/admin/manage/articleManage/ArticleManageContentPage.vue'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import { formatDate } from '@/utils/date'
import type { CommentSearchState } from './types'

interface CommentListData {
  list?: AdminCommentRow[]
  total?: number
  pageSize?: number
}

const props = defineProps<{
  commentList?: CommentListData | null
  searchquery?: CommentSearchState
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  approve: [row: AdminCommentRow]
  reject: [row: AdminCommentRow]
  delete: [row: AdminCommentRow]
  selectionChange: [rows: AdminCommentRow[]]
}>()

const tableRef = ref()

function pageJump(page: number) {
  emit('pageJump', page)
}

function onSelectionChange(rows: AdminCommentRow[]) {
  emit('selectionChange', rows)
}

// 换页或换筛选条件后，表格回到顶部并清空勾选，避免操作到上一页的评论
watch(
  () => props.commentList?.list,
  async () => {
    await nextTick()
    tableRef.value?.setScrollTop(0)
    tableRef.value?.clearSelection()
  },
)

const isTable = computed(() => {
  if (!props.commentList) return true
  return (props.commentList.list?.length ?? 0) > 0
})

type TagType = 'success' | 'warning' | 'info' | 'danger'

function statusMeta(status: AdminCommentStatus): { label: string; type: TagType } {
  if (status === 'approved') return { label: '已通过', type: 'success' }
  if (status === 'hidden') return { label: '未通过', type: 'info' }
  if (status === 'spam') return { label: '垃圾', type: 'danger' }
  return { label: '待审核', type: 'warning' }
}

function postHref(row: AdminCommentRow) {
  return `/detail?slug=${encodeURIComponent(row.post_slug ?? '')}`
}

const STATUS_PHRASE: Record<string, string> = {
  pending: '待审核的评论',
  approved: '已通过的评论',
  rejected: '未通过的评论',
  all: '',
}

const title = computed(() => {
  const query = props.searchquery
  if (!query) return '还没有任何评论'

  const keyword = query.keyword.trim()
  const keywordPhrase = keyword
    ? `「${keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword}」`
    : ''
  const statusPhrase = STATUS_PHRASE[query.status] ?? ''
  const timePhrase =
    query.year === null
      ? ''
      : query.month === null
        ? `${query.year} 年`
        : `${query.year} 年 ${query.month} 月`

  if (keywordPhrase) {
    if (statusPhrase && timePhrase)
      return `没有找到 ${timePhrase}包含 ${keywordPhrase} 的${statusPhrase}`
    if (statusPhrase) return `没有找到包含 ${keywordPhrase} 的${statusPhrase}`
    if (timePhrase) return `没有找到 ${timePhrase}包含 ${keywordPhrase} 的评论`
    return `没有找到包含 ${keywordPhrase} 的评论`
  }

  if (statusPhrase && timePhrase) return `${timePhrase}没有${statusPhrase}`
  if (statusPhrase) return `暂无${statusPhrase}`
  if (timePhrase) return `${timePhrase}还没有评论`
  return '还没有任何评论'
})
</script>

<style scoped>
/* ==================== el-table 基础配色 ==================== */
.admin-comment-table {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #94a3b8;
  --el-table-text-color: #475569;
  --el-table-row-hover-bg-color: #f0f9ff;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  font-size: 13px;
}

.admin-comment-table :deep(.el-table__header th.el-table__cell) {
  font-size: 12px;
  font-weight: 500;
}

.admin-comment-table :deep(.el-table__cell) {
  padding: 10px 0;
  vertical-align: middle;
}

.admin-comment-table :deep(.el-table .cell) {
  padding: 0 14px;
  line-height: 1.5;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row > td.el-table__cell) {
  transition: background-color 0.2s ease;
}

.admin-comment-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 行进入时轻轻上浮淡入 */
.admin-comment-table :deep(.el-table__body tr.el-table__row) {
  animation: admin-comment-row-in 0.32s ease both;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row:nth-child(2)) {
  animation-delay: 0.03s;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row:nth-child(3)) {
  animation-delay: 0.06s;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row:nth-child(4)) {
  animation-delay: 0.09s;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row:nth-child(5)) {
  animation-delay: 0.12s;
}

.admin-comment-table :deep(.el-table__body tr.el-table__row:nth-child(n + 6)) {
  animation-delay: 0.15s;
}

@keyframes admin-comment-row-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 评论内容 / 文章链接 ==================== */
.admin-comment-text {
  display: -webkit-box;
  overflow: hidden;
  color: #475569;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.admin-comment-link {
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

.admin-comment-link:hover {
  color: #0284c7;
}

.admin-post-link {
  display: block;
  overflow: hidden;
  color: #475569;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.admin-post-link:hover {
  color: #0284c7;
}

.admin-owner-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 5px;
  background: #eef4fb;
  color: #3f74ad;
  font-size: 9.5px;
  line-height: 16px;
}

/* ==================== 行内操作按钮 ==================== */
.admin-comment-table :deep(.el-button.is-link.admin-row-action) {
  --el-button-text-color: #64748b;
  --el-button-hover-link-text-color: #64748b;
  height: auto;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action > span) {
  gap: 4px;
  line-height: 1;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action + .admin-row-action) {
  margin-left: 0;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: #f8fafc;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action:focus-visible) {
  outline: 2px solid #bae6fd;
  outline-offset: 1px;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action--approve:hover) {
  color: #059669;
  background-color: #ecfdf5;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action--reject:hover) {
  color: #b45309;
  background-color: #fffbeb;
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(225, 29, 72, 0.72);
}

.admin-comment-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #be123c;
  background-color: #fff1f2;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-comment-table {
  --el-table-border-color: #1e293b;
  --el-table-header-bg-color: #1e293b;
  --el-table-header-text-color: #64748b;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(2, 132, 199, 0.1);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

:global(html.dark) .admin-comment-table :deep(.el-tag--success) {
  --el-tag-bg-color: rgba(16, 185, 129, 0.16);
  --el-tag-border-color: rgba(16, 185, 129, 0.32);
  --el-tag-text-color: #6ee7b7;
}

:global(html.dark) .admin-comment-table :deep(.el-tag--warning) {
  --el-tag-bg-color: rgba(217, 119, 6, 0.18);
  --el-tag-border-color: rgba(245, 158, 11, 0.32);
  --el-tag-text-color: #fcd34d;
}

:global(html.dark) .admin-comment-table :deep(.el-tag--danger) {
  --el-tag-bg-color: rgba(244, 63, 94, 0.16);
  --el-tag-border-color: rgba(244, 63, 94, 0.32);
  --el-tag-text-color: #fda4af;
}

:global(html.dark) .admin-comment-table :deep(.el-tag--info) {
  --el-tag-bg-color: #1e293b;
  --el-tag-border-color: #334155;
  --el-tag-text-color: #94a3b8;
}

:global(html.dark) .admin-comment-text {
  color: #cbd5e1;
}

:global(html.dark) .admin-comment-link {
  color: #64748b;
}

:global(html.dark) .admin-comment-link:hover {
  color: #7dd3fc;
}

:global(html.dark) .admin-post-link {
  color: #cbd5e1;
}

:global(html.dark) .admin-post-link:hover {
  color: #7dd3fc;
}

:global(html.dark) .admin-owner-badge {
  background: rgba(95, 166, 221, 0.16);
  color: #bfdbfe;
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action) {
  --el-button-text-color: #94a3b8;
  --el-button-hover-link-text-color: #94a3b8;
  color: #94a3b8;
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: rgba(148, 163, 184, 0.08);
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action--approve:hover) {
  color: #6ee7b7;
  background-color: rgba(16, 185, 129, 0.12);
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action--reject:hover) {
  color: #fcd34d;
  background-color: rgba(217, 119, 6, 0.14);
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(251, 113, 133, 0.78);
}

:global(html.dark) .admin-comment-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #fda4af;
  background-color: rgba(244, 63, 94, 0.12);
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-comment-table :deep(.el-table__body tr.el-table__row) {
    animation: none;
  }
}
</style>
