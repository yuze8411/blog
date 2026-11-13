<template>
  <div
    class="flex min-h-0 w-full flex-1 flex-col rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900"
  >
    <!-- 工具栏 -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">时光轴文章</h3>
        <span v-if="list?.total" class="admin-selection-pill">
          共 <span class="tabular-nums">{{ list.total }}</span> 篇
        </span>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <AdminAddButton text="添加文章" @addHandler="pickerVisible = true" />
      </div>
    </div>

    <MilestoneManageTable
      :rows="rows"
      :list="list"
      :current-page="currentPage"
      :keyword="keyword"
      :status="status"
      :busy-id="togglingId"
      class="min-h-0 flex-1"
      @page-jump="emit('pageJump', $event)"
      @toggle="toggleVisible"
      @remove="requestRemove"
    />

    <!-- 右侧文章挑选抽屉 -->
    <MilestonePickerDrawer v-model="pickerVisible" @added="emit('refresh')" />

    <!-- 移除确认 -->
    <AdminConfirm
      v-model="removeVisible"
      type="danger"
      :title="removeTitle"
      message="只会从时光轴移除，不会删除原文章。之后想重新放回来，再从「添加文章」里选择即可。"
      confirm-text="移除"
      loading-text="移除中…"
      :loading="removing"
      :mask-closable="!removing"
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  adminMilestoneErrorMessage,
  deleteMilestones,
  setMilestoneVisible,
  type AdminMilestoneRow,
  type AdminMilestoneStatusFilter,
} from '@/api/adminMilestones'
import AdminAddButton from '@/components/common/admin/AdminAddButton.vue'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import MilestoneManageTable from './MilestoneManageTable.vue'
import MilestonePickerDrawer from './MilestonePickerDrawer.vue'

defineProps<{
  rows?: AdminMilestoneRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  status?: AdminMilestoneStatusFilter
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const adminAlert = useAdminAlert()

const pickerVisible = ref(false)

/** 展示 / 隐藏操作同一时间只处理一条 */
const togglingId = ref<string | null>(null)

function shortTitle(title: string) {
  return title.length > 16 ? `${title.slice(0, 16)}…` : title
}

async function toggleVisible(row: AdminMilestoneRow) {
  if (togglingId.value) return

  const nextVisible = !row.is_visible
  togglingId.value = row.id

  try {
    await setMilestoneVisible(row.id, nextVisible)
    adminAlert.success(nextVisible ? '已放回时光轴展示' : '已从时光轴隐藏')
    emit('refresh')
  } catch (error) {
    console.error('[milestoneManage] 修改展示状态失败', error)
    adminAlert.error(adminMilestoneErrorMessage(error))
  } finally {
    togglingId.value = null
  }
}

// ---------------- 移除 ----------------

const removeVisible = ref(false)
const removing = ref(false)
const removeRow = ref<AdminMilestoneRow | null>(null)

const removeTitle = computed(() => {
  const row = removeRow.value
  return row ? `把「${shortTitle(row.title)}」移出时光轴？` : '把这篇文章移出时光轴？'
})

function requestRemove(row: AdminMilestoneRow) {
  if (removing.value || togglingId.value) return
  removeRow.value = row
  removeVisible.value = true
}

async function confirmRemove() {
  const row = removeRow.value
  if (!row || removing.value) return

  removing.value = true
  try {
    await deleteMilestones([row.id])
    removeVisible.value = false
    removeRow.value = null
    adminAlert.success('已从时光轴移除')
    emit('refresh')
  } catch (error) {
    console.error('[milestoneManage] 移除时光轴文章失败', error)
    adminAlert.error(adminMilestoneErrorMessage(error))
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.admin-selection-pill {
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

:global(html.dark) .admin-selection-pill {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}
</style>
