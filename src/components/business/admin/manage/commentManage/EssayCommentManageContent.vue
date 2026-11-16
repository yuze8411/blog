<template>
  <div class="w-full rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900">
    <div class="flex flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">随笔评论列表</h3>
        <Transition name="essay-comment-selection">
          <span v-if="selectedRows.length" class="comment-selection-pill">
            已选 <span class="tabular-nums">{{ selectedRows.length }}</span> 条
          </span>
        </Transition>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          class="comment-tool-button is-ai"
          :disabled="actionLoading"
          title="让 AI 审核勾选的待审核随笔评论"
          @click="openAiReview"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M10 1.5c.35 0 .65.23.75.57l.62 2.07a4.7 4.7 0 0 0 3.14 3.14l2.07.62a.78.78 0 0 1 0 1.5l-2.07.62a4.7 4.7 0 0 0-3.14 3.14l-.62 2.07a.78.78 0 0 1-1.5 0l-.62-2.07a4.7 4.7 0 0 0-3.14-3.14l-2.07-.62a.78.78 0 0 1 0-1.5l2.07-.62a4.7 4.7 0 0 0 3.14-3.14l.62-2.07A.78.78 0 0 1 10 1.5Z"
            />
            <path
              d="M15.6 13.2c.18 0 .33.11.38.28l.26.87c.15.5.54.89 1.04 1.04l.87.26a.4.4 0 0 1 0 .77l-.87.26c-.5.15-.89.54-1.04 1.04l-.26.87a.4.4 0 0 1-.77 0l-.26-.87a1.78 1.78 0 0 0-1.04-1.04l-.87-.26a.4.4 0 0 1 0-.77l.87-.26c.5-.15.89-.54 1.04-1.04l.26-.87a.4.4 0 0 1 .39-.28Z"
            />
          </svg>
          AI 审核所选
        </button>

        <button
          type="button"
          class="comment-tool-button is-approve"
          :disabled="actionLoading"
          title="直接通过勾选的随笔评论"
          @click="approveSelected"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            />
          </svg>
          通过所选
        </button>

        <button
          type="button"
          class="comment-tool-button is-reject"
          :disabled="actionLoading"
          title="隐藏勾选的随笔评论"
          @click="requestRejectSelected"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
          不通过所选
        </button>

        <AdminDeleteButton text="删除所选" @delHandler="requestDeleteSelected" />
      </div>
    </div>

    <EssayCommentManageTable
      :rows="commentList?.list"
      :list="commentList"
      :current-page="searchquery?.page ?? 1"
      :keyword="searchquery?.keyword"
      :status="searchquery?.status"
      @page-jump="emit('pageJump', $event)"
      @approve="approveRow"
      @reject="requestReject"
      @delete="requestDelete"
      @selection-change="handleSelectionChange"
    />

    <AdminAiReview
      v-model="aiVisible"
      :items="aiDialogItems"
      noun="随笔评论"
      title="AI 随笔评论审核"
      :loading="aiLoading"
      :submitting="aiSubmitting"
      :error="aiError"
      @confirm="confirmAiReview"
      @retry="retryAiReview"
    />

    <AdminConfirm
      v-model="rejectVisible"
      type="warning"
      :title="rejectTitle"
      :message="rejectMessage"
      :confirm-text="rejectConfirmText"
      cancel-text="再想想"
      loading-text="处理中…"
      :loading="rejectLoading"
      :mask-closable="!rejectLoading"
      @confirm="confirmReject"
    />

    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      :title="deleteTitle"
      message="删除后无法恢复，请谨慎操作。"
      confirm-text="删除"
      loading-text="删除中…"
      :loading="deleteLoading"
      :mask-closable="!deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  adminEssayCommentErrorMessage,
  approveEssayComments,
  deleteEssayComments,
  hideEssayComments,
  type AdminEssayCommentListResult,
  type AdminEssayCommentRow,
} from '@/api/adminEssayComments'
import { reviewComments } from '@/api/commentReview'
import AdminAiReview from '@/components/common/admin/AdminAiReview.vue'
import type {
  AdminAiReviewDecision,
  AdminAiReviewItem,
} from '@/components/common/admin/aiReviewTypes'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import AdminDeleteButton from '@/components/common/admin/AdminDeleteButton.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import EssayCommentManageTable from './EssayCommentManageTable.vue'
import type { EssayAiReviewItem, EssayCommentSearchState } from './types'

const props = defineProps<{
  commentList?: AdminEssayCommentListResult | null
  searchquery?: EssayCommentSearchState
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const adminAlert = useAdminAlert()
const selectedRows = ref<AdminEssayCommentRow[]>([])
const actionLoading = ref(false)
const AI_BATCH_LIMIT = 20

watch(
  () => props.commentList?.list,
  () => {
    selectedRows.value = []
  },
)

function handleSelectionChange(rows: AdminEssayCommentRow[]) {
  selectedRows.value = rows
}

function shortAuthor(row: AdminEssayCommentRow) {
  const name = row.nickname || '匿名访客'
  return name.length > 10 ? `${name.slice(0, 10)}…` : name
}

// ---------------- 通过 ----------------
function approveRow(row: AdminEssayCommentRow) {
  if (row.status === 'approved' || actionLoading.value) return
  void approveRows([row.id])
}

function approveSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要通过的随笔评论')
    return
  }

  const ids = selectedRows.value.filter((row) => row.status !== 'approved').map((row) => row.id)

  if (!ids.length) {
    adminAlert.info('选中的随笔评论都已经通过了')
    return
  }

  void approveRows(ids)
}

async function approveRows(ids: string[]) {
  actionLoading.value = true
  try {
    const approved = await approveEssayComments(ids)
    adminAlert.success(`已通过 ${approved} 条随笔评论`)
    emit('refresh')
  } catch (error) {
    console.error('[essayCommentManage] 通过随笔评论失败', error)
    adminAlert.error(adminEssayCommentErrorMessage(error))
  } finally {
    actionLoading.value = false
  }
}

// ---------------- 不通过 / 隐藏 ----------------
const rejectVisible = ref(false)
const rejectLoading = ref(false)
const rejectRows = ref<AdminEssayCommentRow[]>([])

const hidingOnly = computed(
  () => rejectRows.value.length > 0 && rejectRows.value.every((row) => row.status === 'approved'),
)

const rejectTitle = computed(() => {
  const rows = rejectRows.value
  if (rows.length === 1) {
    const row = rows[0]
    if (!row) return '不通过这条随笔评论？'
    return row.status === 'approved'
      ? '隐藏这条随笔评论？'
      : `不通过「${shortAuthor(row)}」的随笔评论？`
  }
  return hidingOnly.value
    ? `隐藏选中的 ${rows.length} 条随笔评论？`
    : `不通过选中的 ${rows.length} 条随笔评论？`
})

const rejectConfirmText = computed(() => (hidingOnly.value ? '隐藏' : '不通过'))

const rejectMessage = computed(() =>
  hidingOnly.value
    ? '隐藏后这些评论不会出现在随笔页，之后随时可以通过恢复。'
    : '不通过后评论不会出现在随笔页，之后随时可以通过。',
)

function requestReject(row: AdminEssayCommentRow) {
  if (row.status === 'hidden' || row.status === 'spam' || actionLoading.value) return
  rejectRows.value = [row]
  rejectVisible.value = true
}

function requestRejectSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要隐藏的随笔评论')
    return
  }

  const targets = selectedRows.value.filter(
    (row) => row.status !== 'hidden' && row.status !== 'spam',
  )
  if (!targets.length) {
    adminAlert.info('选中的随笔评论都已经是不通过状态了')
    return
  }

  rejectRows.value = targets
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectRows.value.length || rejectLoading.value || actionLoading.value) return

  const rows = rejectRows.value
  const wasHidingOnly = hidingOnly.value
  rejectLoading.value = true

  try {
    const hidden = await hideEssayComments(rows.map((row) => row.id))
    rejectVisible.value = false
    rejectRows.value = []
    adminAlert.success(
      `已${wasHidingOnly ? '隐藏' : '将'} ${hidden} 条随笔评论${wasHidingOnly ? '' : '设为不通过'}`,
    )
    emit('refresh')
  } catch (error) {
    console.error('[essayCommentManage] 隐藏随笔评论失败', error)
    adminAlert.error(adminEssayCommentErrorMessage(error))
  } finally {
    rejectLoading.value = false
  }
}

// ---------------- 删除 ----------------
const deleteVisible = ref(false)
const deleteLoading = ref(false)
const deleteRows = ref<AdminEssayCommentRow[]>([])

const deleteTitle = computed(() => {
  const rows = deleteRows.value
  if (rows.length === 1) {
    const row = rows[0]
    return row ? `删除「${shortAuthor(row)}」的这条随笔评论？` : '删除这条随笔评论？'
  }
  return `删除选中的 ${rows.length} 条随笔评论？`
})

function requestDelete(row: AdminEssayCommentRow) {
  if (actionLoading.value) return
  deleteRows.value = [row]
  deleteVisible.value = true
}

function requestDeleteSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要删除的随笔评论')
    return
  }
  deleteRows.value = [...selectedRows.value]
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!deleteRows.value.length || deleteLoading.value) return

  const rows = deleteRows.value
  deleteLoading.value = true

  try {
    await deleteEssayComments(rows.map((row) => row.id))
    deleteVisible.value = false
    deleteRows.value = []
    adminAlert.success(rows.length === 1 ? '随笔评论已删除' : `已删除 ${rows.length} 条随笔评论`)
    emit('refresh')
  } catch (error) {
    console.error('[essayCommentManage] 删除随笔评论失败', error)
    adminAlert.error(adminEssayCommentErrorMessage(error))
  } finally {
    deleteLoading.value = false
  }
}

// ---------------- AI 审核 ----------------
const aiVisible = ref(false)
const aiLoading = ref(false)
const aiSubmitting = ref(false)
const aiError = ref('')
const aiItems = ref<EssayAiReviewItem[]>([])
const aiTargets = ref<AdminEssayCommentRow[]>([])

const aiDialogItems = computed<AdminAiReviewItem[]>(() =>
  aiItems.value.map((item) => ({
    id: item.comment.id,
    nickname: item.comment.nickname,
    avatarUrl: item.comment.avatar_url,
    content: item.comment.content,
    badges: item.comment.is_owner ? ['博主'] : [],
    meta: item.comment.essay_title,
    aiPass: item.aiPass,
    reason: item.reason,
    pass: item.pass,
  })),
)

function openAiReview() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要审核的随笔评论')
    return
  }

  const targets = selectedRows.value.filter((row) => row.status === 'pending')
  if (!targets.length) {
    adminAlert.info('选中的随笔评论里没有待审核的')
    return
  }
  if (targets.length > AI_BATCH_LIMIT) {
    adminAlert.warning(`一次最多让 AI 审核 ${AI_BATCH_LIMIT} 条，请分两批勾选`)
    return
  }

  void runAiReview(targets)
}

async function runAiReview(targets: AdminEssayCommentRow[]) {
  aiTargets.value = targets
  aiItems.value = targets.map((comment) => ({
    comment,
    pass: false,
    reason: '等待 AI 判断…',
  }))
  aiVisible.value = true
  aiLoading.value = true
  aiError.value = ''

  try {
    const results = await reviewComments(
      targets.map((row) => ({
        id: row.id,
        nickname: row.nickname,
        content: row.content,
        postTitle: row.essay_title,
      })),
    )

    const resultMap = new Map(results.map((result) => [result.id, result]))
    aiItems.value = targets.map((comment) => {
      const result = resultMap.get(comment.id)
      return {
        comment,
        pass: result?.pass ?? false,
        reason: result?.reason ?? 'AI 没有给出明确判断，请手动确认',
        aiPass: result?.pass,
      }
    })
  } catch (error) {
    console.error('[essayCommentManage] AI 审核失败', error)
    aiError.value = aiErrorMessage(error)
  } finally {
    aiLoading.value = false
  }
}

function retryAiReview() {
  if (aiLoading.value || aiSubmitting.value) return
  void runAiReview(aiTargets.value)
}

async function confirmAiReview(decision: AdminAiReviewDecision) {
  if (aiSubmitting.value) return

  const passIdSet = new Set(decision.passIds)
  const rejectIdSet = new Set(decision.rejectIds)
  const passRows: AdminEssayCommentRow[] = []
  const rejectRows: AdminEssayCommentRow[] = []

  for (const item of aiItems.value) {
    if (rejectIdSet.has(item.comment.id)) rejectRows.push(item.comment)
    else if (passIdSet.has(item.comment.id)) passRows.push(item.comment)
  }

  if (!passRows.length && !rejectRows.length) {
    adminAlert.warning('没有可以应用的审核结果')
    return
  }

  aiSubmitting.value = true
  const errors: unknown[] = []
  let approved = 0
  let hidden = 0

  if (passRows.length) {
    try {
      approved = await approveEssayComments(passRows.map((row) => row.id))
    } catch (error) {
      console.error('[essayCommentManage] AI 批量通过失败', error)
      errors.push(error)
    }
  }

  if (rejectRows.length) {
    try {
      hidden = await hideEssayComments(rejectRows.map((row) => row.id))
    } catch (error) {
      console.error('[essayCommentManage] AI 批量不通过失败', error)
      errors.push(error)
    }
  }

  aiSubmitting.value = false
  aiVisible.value = false
  emit('refresh')

  const parts: string[] = []
  if (approved) parts.push(`通过 ${approved} 条`)
  if (hidden) parts.push(`不通过 ${hidden} 条`)

  if (errors.length) {
    const doneTip = parts.length ? `已完成：${parts.join('，')}。` : ''
    adminAlert.error(`${doneTip}${adminEssayCommentErrorMessage(errors[0])}`)
    return
  }

  adminAlert.success(`AI 审核已应用：${parts.join('，')}`)
}

function aiErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (/failed to fetch|network|timeout/i.test(error.message)) {
      return '连接 AI 服务失败，请检查网络后重试'
    }
    return error.message
  }
  return 'AI 审核没有完成，请稍后重试'
}
</script>

<style scoped>
.comment-tool-button {
  display: inline-flex;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease;
}

.comment-tool-button svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.comment-tool-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.comment-tool-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.comment-tool-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.comment-tool-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #bae6fd;
}

.comment-tool-button.is-ai {
  border-color: #ddd6fe;
  background-image: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
  color: #6366f1;
  box-shadow: 0 4px 12px -9px rgba(99, 102, 241, 0.5);
}

.comment-tool-button.is-ai:hover:not(:disabled) {
  border-color: #c7d2fe;
  color: #4f46e5;
  box-shadow: 0 10px 20px -12px rgba(99, 102, 241, 0.55);
}

.comment-tool-button.is-approve {
  border-color: #bbf7d0;
  background-image: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  color: #059669;
  box-shadow: 0 4px 12px -9px rgba(16, 185, 129, 0.4);
}

.comment-tool-button.is-approve:hover:not(:disabled) {
  border-color: #86efac;
  color: #047857;
  box-shadow: 0 10px 20px -12px rgba(16, 185, 129, 0.45);
}

.comment-tool-button.is-reject {
  border-color: #fde68a;
  background-image: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
  color: #b45309;
  box-shadow: 0 4px 12px -9px rgba(217, 119, 6, 0.4);
}

.comment-tool-button.is-reject:hover:not(:disabled) {
  border-color: #fcd34d;
  color: #92400e;
  box-shadow: 0 10px 20px -12px rgba(217, 119, 6, 0.45);
}

.comment-selection-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid #e0f2fe;
  border-radius: 999px;
  padding: 1px 8px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
}

.essay-comment-selection-enter-active,
.essay-comment-selection-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.essay-comment-selection-enter-from,
.essay-comment-selection-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

:global(html.dark) .comment-tool-button.is-ai {
  border-color: rgba(129, 140, 248, 0.28);
  background-image: linear-gradient(
    135deg,
    rgba(67, 56, 202, 0.16) 0%,
    rgba(49, 46, 129, 0.12) 100%
  );
  color: #a5b4fc;
}

:global(html.dark) .comment-tool-button.is-ai:hover:not(:disabled) {
  border-color: rgba(129, 140, 248, 0.44);
  color: #c7d2fe;
}

:global(html.dark) .comment-tool-button.is-approve {
  border-color: rgba(16, 185, 129, 0.28);
  background-image: linear-gradient(135deg, rgba(6, 78, 59, 0.24) 0%, rgba(6, 95, 70, 0.14) 100%);
  color: #6ee7b7;
}

:global(html.dark) .comment-tool-button.is-approve:hover:not(:disabled) {
  border-color: rgba(16, 185, 129, 0.45);
  color: #a7f3d0;
}

:global(html.dark) .comment-tool-button.is-reject {
  border-color: rgba(245, 158, 11, 0.28);
  background-image: linear-gradient(
    135deg,
    rgba(120, 53, 15, 0.22) 0%,
    rgba(113, 63, 18, 0.14) 100%
  );
  color: #fcd34d;
}

:global(html.dark) .comment-tool-button.is-reject:hover:not(:disabled) {
  border-color: rgba(245, 158, 11, 0.45);
  color: #fde68a;
}

:global(html.dark) .comment-tool-button:focus-visible {
  box-shadow:
    0 0 0 2px #0f172a,
    0 0 0 4px #334155;
}

:global(html.dark) .comment-selection-pill {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

@media (prefers-reduced-motion: reduce) {
  .comment-tool-button,
  .essay-comment-selection-enter-active,
  .essay-comment-selection-leave-active {
    transition: none;
  }
}
</style>
