<template>
  <div
    class="flex min-h-0 w-full flex-1 flex-col rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900"
  >
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">随笔列表</h3>
        <span v-if="list?.total" class="essay-selection-pill">
          共 <span class="tabular-nums">{{ list.total }}</span> 篇
        </span>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <button type="button" class="essay-draft-entry" @click="openDrafts">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.4a.75.75 0 0 0-.22-.53l-4.65-4.65A.75.75 0 0 0 11.6 2H4.5Zm7.1 4.3V3.4l4.3 4.3h-3.8a.5.5 0 0 1-.5-.5Z"
            />
          </svg>
          草稿箱
        </button>
        <AdminAddButton text="写随笔" @addHandler="addEssay" />
      </div>
    </div>

    <EssayManageTable
      :rows="rows"
      :list="list"
      :current-page="currentPage"
      :keyword="keyword"
      :status="status"
      :busy-id="togglingId"
      class="min-h-0 flex-1"
      @page-jump="emit('pageJump', $event)"
      @edit="editEssay"
      @toggle="requestToggle"
      @remove="requestRemove"
    />

    <EssayDraftDrawer
      v-model="draftVisible"
      :drafts="drafts"
      :loading="draftLoading"
      @load="loadDraft"
      @refresh="fetchDrafts"
    />

    <AdminConfirm
      v-model="removeVisible"
      type="danger"
      :title="removeTitle"
      message="删除后无法恢复，这篇随笔下的点赞和评论也会一起清掉。"
      confirm-text="删除"
      loading-text="删除中…"
      :loading="removing"
      :mask-closable="!removing"
      @confirm="confirmRemove"
    />

    <AdminConfirm
      v-model="hideVisible"
      type="warning"
      title="隐藏这篇随笔？"
      :message="hideMessage"
      confirm-text="隐藏"
      cancel-text="再想想"
      loading-text="隐藏中…"
      :loading="hideLoading"
      :mask-closable="!hideLoading"
      @confirm="confirmHide"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminEssayErrorMessage,
  deleteEssays,
  fetchEssayDrafts,
  setEssayVisible,
  type AdminEssayDraft,
  type AdminEssayRow,
  type AdminEssayStatusFilter,
} from '@/api/adminEssays'
import AdminAddButton from '@/components/common/admin/AdminAddButton.vue'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import EssayDraftDrawer from '@/components/business/admin/essayEdit/EssayDraftDrawer.vue'
import EssayManageTable from './EssayManageTable.vue'

defineProps<{
  rows?: AdminEssayRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  status?: AdminEssayStatusFilter
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const router = useRouter()
const adminAlert = useAdminAlert()

const togglingId = ref<string | null>(null)

function addEssay() {
  void router.push('/admin/essayedit')
}

function editEssay(row: AdminEssayRow) {
  void router.push({ path: '/admin/essayedit', query: { id: row.id } })
}

function shortTitle(title: string) {
  return title.length > 16 ? `${title.slice(0, 16)}…` : title
}

// ---------------- 草稿箱 ----------------
const draftVisible = ref(false)
const draftLoading = ref(false)
const drafts = ref<AdminEssayDraft[]>([])

function openDrafts() {
  draftVisible.value = true
  void fetchDrafts()
}

async function fetchDrafts() {
  draftLoading.value = true
  try {
    drafts.value = await fetchEssayDrafts()
  } catch (error) {
    console.error('[essayManage] 加载草稿箱失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    draftLoading.value = false
  }
}

function loadDraft(id: string) {
  draftVisible.value = false
  void router.push({ path: '/admin/essayedit', query: { id } })
}

// ---------------- 显示 / 隐藏 ----------------
const hideVisible = ref(false)
const hideLoading = ref(false)
const hideRow = ref<AdminEssayRow | null>(null)

const hideMessage = computed(() => {
  const row = hideRow.value
  if (!row) return ''
  return `隐藏后「${shortTitle(row.title)}」不会出现在随笔页，随时可以重新显示。`
})

function requestToggle(row: AdminEssayRow) {
  if (togglingId.value) return
  if (!row.is_visible) {
    void setVisible(row, true)
    return
  }
  hideRow.value = row
  hideVisible.value = true
}

async function confirmHide() {
  const row = hideRow.value
  if (!row || hideLoading.value) return

  hideLoading.value = true
  const success = await setVisible(row, false)
  hideLoading.value = false

  if (success) {
    hideVisible.value = false
    hideRow.value = null
  }
}

async function setVisible(row: AdminEssayRow, visible: boolean) {
  if (togglingId.value) return false

  togglingId.value = row.id
  try {
    await setEssayVisible(row.id, visible)
    adminAlert.success(visible ? '随笔已重新显示' : '随笔已隐藏')
    emit('refresh')
    return true
  } catch (error) {
    console.error('[essayManage] 修改展示状态失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
    return false
  } finally {
    togglingId.value = null
  }
}

// ---------------- 删除 ----------------
const removeVisible = ref(false)
const removing = ref(false)
const removeRow = ref<AdminEssayRow | null>(null)

const removeTitle = computed(() => {
  const row = removeRow.value
  return row ? `删除随笔「${shortTitle(row.title)}」？` : '删除这篇随笔？'
})

function requestRemove(row: AdminEssayRow) {
  if (removing.value || togglingId.value) return
  removeRow.value = row
  removeVisible.value = true
}

async function confirmRemove() {
  const row = removeRow.value
  if (!row || removing.value) return

  removing.value = true
  try {
    await deleteEssays([row.id])
    removeVisible.value = false
    removeRow.value = null
    adminAlert.success('随笔已删除')
    emit('refresh')
  } catch (error) {
    console.error('[essayManage] 删除随笔失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.essay-selection-pill {
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

.essay-draft-entry {
  display: inline-flex;
  height: 34px;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 12px;
  background: #fff;
  color: #64748b;
  font-size: 12px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.essay-draft-entry svg {
  height: 14px;
  width: 14px;
}

.essay-draft-entry:hover {
  border-color: #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
}

:global(html.dark) .essay-selection-pill {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

:global(html.dark) .essay-draft-entry {
  border-color: #334155;
  background: #0b1220;
  color: #94a3b8;
}

:global(html.dark) .essay-draft-entry:hover {
  border-color: #0369a1;
  background: #0c4a6e;
  color: #7dd3fc;
}
</style>
