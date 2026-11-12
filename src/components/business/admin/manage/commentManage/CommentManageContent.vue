<template>
  <div class="w-full rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900">
    <!-- 工具栏：标题 + 当前勾选数量 + 批量操作 -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">评论列表</h3>
        <Transition name="comment-selection">
          <span v-if="selectedRows.length" class="comment-selection-pill">
            已选 <span class="tabular-nums">{{ selectedRows.length }}</span> 条
          </span>
        </Transition>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <!-- AI 先给建议，再人工微调，最后批量通过 -->
        <button
          type="button"
          class="comment-tool-button is-ai"
          :disabled="actionLoading"
          title="让 AI 审核勾选的待审核评论"
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

        <!-- 手动批量通过：可以恢复之前被隐藏的评论，不需要二次确认 -->
        <button
          type="button"
          class="comment-tool-button is-approve"
          :disabled="actionLoading"
          title="直接通过勾选的评论"
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

        <!-- 批量不通过：会隐藏评论，需要确认 -->
        <button
          type="button"
          class="comment-tool-button is-reject"
          :disabled="actionLoading"
          title="隐藏勾选的评论"
          @click="requestRejectSelected"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
          不通过所选
        </button>

        <AdminDeleteButton text="删除所选评论" @delHandler="requestDeleteSelected" />
      </div>
    </div>

    <CommentManageContentTable
      :commentList="commentList"
      :searchquery="searchquery"
      @pageJump="pageJump"
      @approve="approveRow"
      @reject="requestReject"
      @delete="requestDelete"
      @selection-change="handleSelectionChange"
    />

    <!-- AI 审核弹窗：AI 建议 + 手动调整 + 一次性通过 -->
    <CommentManageAiReview
      v-model="aiVisible"
      :items="aiItems"
      :loading="aiLoading"
      :submitting="aiSubmitting"
      :error="aiError"
      @confirm="confirmAiReview"
      @retry="retryAiReview"
    />

    <!-- 不通过 / 隐藏确认：单条和批量共用 -->
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

    <!-- 删除确认：删一级评论时数据库会级联删掉回复 -->
    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      :title="deleteTitle"
      :message="deleteMessage"
      confirm-text="删除"
      loading-text="删除中…"
      :loading="deleteLoading"
      :mask-closable="!deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  adminCommentErrorMessage,
  approveComments,
  deleteComments,
  hideComments,
  type AdminCommentListResult,
  type AdminCommentRow,
} from '@/api/adminComments'
import { reviewComments } from '@/api/commentReview'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import AdminDeleteButton from '@/components/common/admin/AdminDeleteButton.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import CommentManageAiReview from './CommentManageAiReview.vue'
import CommentManageContentTable from './CommentManageContentTable.vue'
import type { AiReviewItem, CommentSearchState } from './types'

const props = defineProps<{
  commentList?: AdminCommentListResult | null
  searchquery?: CommentSearchState
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const adminAlert = useAdminAlert()

/** 表格当前勾选的行，批量操作都以它为准 */
const selectedRows = ref<AdminCommentRow[]>([])

/** 手动批量通过进行中，避免重复点击 */
const actionLoading = ref(false)

/** 一条 AI 请求最多审核 20 条，和服务端保持一致 */
const AI_BATCH_LIMIT = 20

function handleSelectionChange(rows: AdminCommentRow[]) {
  selectedRows.value = rows
}

function pageJump(page: number) {
  emit('pageJump', page)
}

function author(row: AdminCommentRow) {
  return row.nickname || '匿名访客'
}

function shortAuthor(row: AdminCommentRow) {
  const name = author(row)
  return name.length > 10 ? `${name.slice(0, 10)}…` : name
}

// ---------------- 手动通过 ----------------

/** 行内「通过」：单条直接执行 */
function approveRow(row: AdminCommentRow) {
  if (row.status === 'approved' || actionLoading.value) return
  void approveRows([row])
}

/** 顶部「通过所选」：已经通过的跳过，其余直接恢复 / 通过 */
function approveSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要通过的评论')
    return
  }

  const targets = selectedRows.value.filter((row) => row.status !== 'approved')
  if (!targets.length) {
    adminAlert.info('选中的评论都已经通过了')
    return
  }

  void approveRows(targets)
}

async function approveRows(rows: AdminCommentRow[]) {
  actionLoading.value = true
  try {
    const result = await approveComments(rows)
    const rootTip = result.rootApproved ? `，并顺带通过了 ${result.rootApproved} 条主评论` : ''
    adminAlert.success(`已通过 ${result.approved} 条评论${rootTip}`)
    emit('refresh')
  } catch (error) {
    console.error('[commentManage] 通过评论失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    actionLoading.value = false
  }
}

// ---------------- 不通过 / 隐藏 ----------------

const rejectVisible = ref(false)
const rejectLoading = ref(false)
const rejectRows = ref<AdminCommentRow[]>([])

/** 选中的都是已通过评论时，这次操作实际是「隐藏」而不是「不通过」 */
const hidingOnly = computed(
  () => rejectRows.value.length > 0 && rejectRows.value.every((row) => row.status === 'approved'),
)

const rejectTitle = computed(() => {
  const rows = rejectRows.value
  if (rows.length === 1) {
    const row = rows[0]
    if (!row) return '不通过这条评论？'
    return row.status === 'approved' ? '隐藏这条评论？' : `不通过「${shortAuthor(row)}」的评论？`
  }
  return hidingOnly.value
    ? `隐藏选中的 ${rows.length} 条评论？`
    : `不通过选中的 ${rows.length} 条评论？`
})

const rejectConfirmText = computed(() => (hidingOnly.value ? '隐藏' : '不通过'))

const rejectMessage = computed(() => {
  const rows = rejectRows.value
  if (rows.length === 1) {
    const row = rows[0]
    if (!row) return ''
    if (!row.root_id) {
      return '隐藏后这条评论和它下面的回复都不会在前台展示，之后随时可以通过恢复。'
    }
    return '隐藏后这条回复不会在前台展示，之后随时可以通过恢复。'
  }
  return '选中一级评论会连同它下面的回复一起隐藏，之后随时可以通过恢复。'
})

function requestReject(row: AdminCommentRow) {
  if (row.status === 'hidden' || row.status === 'spam' || actionLoading.value) return
  rejectRows.value = [row]
  rejectVisible.value = true
}

function requestRejectSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要隐藏的评论')
    return
  }

  const targets = selectedRows.value.filter(
    (row) => row.status !== 'hidden' && row.status !== 'spam',
  )
  if (!targets.length) {
    adminAlert.info('选中的评论都已经是不通过状态了')
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
    const result = await hideComments(rows)
    const childTip = result.childHidden ? `，并连带隐藏了 ${result.childHidden} 条回复` : ''
    rejectVisible.value = false
    rejectRows.value = []
    adminAlert.success(
      `已${wasHidingOnly ? '隐藏' : '将'} ${result.hidden} 条评论${wasHidingOnly ? '' : '设为不通过'}${childTip}`,
    )
    emit('refresh')
  } catch (error) {
    console.error('[commentManage] 隐藏评论失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    rejectLoading.value = false
  }
}

// ---------------- 删除 ----------------

const deleteVisible = ref(false)
const deleteLoading = ref(false)
const deleteRows = ref<AdminCommentRow[]>([])

const deleteTitle = computed(() => {
  const rows = deleteRows.value
  if (rows.length === 1) {
    const row = rows[0]
    return row ? `删除「${shortAuthor(row)}」的这条评论？` : '删除这条评论？'
  }
  return `删除选中的 ${rows.length} 条评论？`
})

const deleteMessage = computed(() =>
  deleteRows.value.some((row) => !row.root_id)
    ? '删除一级评论会连同它下面的回复一起删除，且无法恢复。'
    : '删除后无法恢复，请谨慎操作。',
)

function requestDelete(row: AdminCommentRow) {
  if (actionLoading.value) return
  deleteRows.value = [row]
  deleteVisible.value = true
}

function requestDeleteSelected() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要删除的评论')
    return
  }
  deleteRows.value = [...selectedRows.value]
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!deleteRows.value.length || deleteLoading.value) return

  const rows = deleteRows.value
  const ids = rows.map((row) => row.id)
  deleteLoading.value = true

  try {
    await deleteComments(ids)
    deleteVisible.value = false
    deleteRows.value = []
    adminAlert.success(ids.length === 1 ? '评论已删除' : `已删除 ${ids.length} 条评论`)
    emit('refresh')
  } catch (error) {
    console.error('[commentManage] 删除评论失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    deleteLoading.value = false
  }
}

// ---------------- AI 审核 ----------------

const aiVisible = ref(false)
const aiLoading = ref(false)
const aiSubmitting = ref(false)
const aiError = ref('')
const aiItems = ref<AiReviewItem[]>([])
/** 本次送去 AI 的评论，重试时复用同一批，不用重新勾选 */
const aiTargets = ref<AdminCommentRow[]>([])

function openAiReview() {
  if (actionLoading.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要审核的评论')
    return
  }

  const targets = selectedRows.value.filter((row) => row.status === 'pending')
  if (!targets.length) {
    adminAlert.info('选中的评论里没有待审核的，只有待审核评论需要 AI 判断')
    return
  }
  if (targets.length > AI_BATCH_LIMIT) {
    adminAlert.warning(`一次最多让 AI 审核 ${AI_BATCH_LIMIT} 条评论，请分两批勾选`)
    return
  }

  void runAiReview(targets)
}

async function runAiReview(targets: AdminCommentRow[]) {
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
        postTitle: row.post_title,
        replyTo: row.reply_to_nickname ?? undefined,
      })),
    )

    const resultMap = new Map(results.map((result) => [result.id, result]))
    aiItems.value = targets.map((comment) => {
      const result = resultMap.get(comment.id)
      return {
        comment,
        // AI 没给出判断时默认不通过，避免误放行
        pass: result?.pass ?? false,
        reason: result?.reason ?? 'AI 没有给出明确判断，请手动确认',
        aiPass: result?.pass,
      }
    })
  } catch (error) {
    console.error('[commentManage] AI 审核失败', error)
    aiError.value = aiErrorMessage(error)
  } finally {
    aiLoading.value = false
  }
}

function retryAiReview() {
  if (aiLoading.value || aiSubmitting.value) return
  void runAiReview(aiTargets.value)
}

async function confirmAiReview(ids: string[]) {
  if (aiSubmitting.value || !ids.length) return

  const idSet = new Set(ids)
  const byId = new Map(aiItems.value.map((item) => [item.comment.id, item.comment]))
  const rows: AdminCommentRow[] = []
  let skippedReplies = 0

  for (const item of aiItems.value) {
    if (!idSet.has(item.comment.id)) continue

    // 回复所属的主评论也在这次结果里，但博主把它设成了不通过：
    // 不能只放行回复，否则前台会出现没有主评论的孤儿回复。
    const rootId = item.comment.root_id
    if (rootId && byId.has(rootId) && !idSet.has(rootId)) {
      skippedReplies += 1
      continue
    }

    rows.push(item.comment)
  }

  if (!rows.length) {
    adminAlert.warning('选中的回复所属主评论没有通过，请先通过主评论')
    return
  }

  aiSubmitting.value = true
  try {
    const result = await approveComments(rows)
    const rootTip = result.rootApproved ? `，并顺带通过了 ${result.rootApproved} 条主评论` : ''
    const skipTip = skippedReplies ? `，跳过 ${skippedReplies} 条主评论未通过的回复` : ''
    aiVisible.value = false
    adminAlert.success(`已通过 ${result.approved} 条评论${rootTip}${skipTip}`)
    emit('refresh')
  } catch (error) {
    console.error('[commentManage] AI 审核批量通过失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    aiSubmitting.value = false
  }
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
/* ==================== 顶部工具按钮 ==================== */
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

/* AI：低饱和的紫蓝，和文章的蓝色主题区分开，又不抢眼 */
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

/* 通过：和状态列的绿色一致，用很浅的底 */
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

/* 不通过：柔和的琥珀色，提示这是拦截操作 */
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

/* ==================== 已选数量的小胶囊 ==================== */
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

.comment-selection-enter-active,
.comment-selection-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.comment-selection-enter-from,
.comment-selection-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ==================== 黑夜模式 ==================== */
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

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .comment-tool-button,
  .comment-selection-enter-active,
  .comment-selection-leave-active {
    transition: none;
  }
}
</style>
