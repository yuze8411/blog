<template>
  <div
    class="flex w-full min-h-0 flex-1 flex-col rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900"
  >
    <!-- 工具栏 -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">游记列表</h3>
        <Transition name="travel-selection">
          <span v-if="selectedRows.length" class="admin-selection-pill">
            已选 <span class="tabular-nums">{{ selectedRows.length }}</span> 张
          </span>
        </Transition>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <AdminAddButton text="上传照片" @addHandler="openCreate" />
        <AdminDeleteButton text="删除所选照片" @delHandler="requestDeleteSelected" />
      </div>
    </div>

    <TravelManageTable
      :photos="photos"
      :list="list"
      :current-page="currentPage"
      :keyword="keyword"
      :year="year"
      :month="month"
      class="min-h-0 flex-1"
      @page-jump="emit('pageJump', $event)"
      @edit="openEdit"
      @delete="requestDelete"
      @selection-change="handleSelectionChange"
    />

    <!-- 新增 / 编辑共用同一个弹窗 -->
    <TravelManageForm v-model="formVisible" :photo="editing" :submitting="saving" @submit="save" />

    <!-- 删除确认 -->
    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      :title="deleteTitle"
      message="照片会从前台游记页移除。Storage 里的原图不会自动删除，需要时去存储桶手动清理。"
      confirm-text="删除"
      loading-text="删除中…"
      :loading="deleting"
      :mask-closable="!deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  adminTravelErrorMessage,
  createTravel,
  deleteTravel,
  updateTravel,
  type AdminTravelRow,
  type TravelPayload,
} from '@/api/adminTravel'
import AdminAddButton from '@/components/common/admin/AdminAddButton.vue'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import AdminDeleteButton from '@/components/common/admin/AdminDeleteButton.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import TravelManageForm from './TravelManageForm.vue'
import TravelManageTable from './TravelManageTable.vue'

defineProps<{
  photos?: AdminTravelRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  year?: number | null
  month?: number | null
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const adminAlert = useAdminAlert()

const selectedRows = ref<AdminTravelRow[]>([])

const formVisible = ref(false)
const saving = ref(false)
const editing = ref<AdminTravelRow | null>(null)

const deleteVisible = ref(false)
const deleting = ref(false)
const deleteRows = ref<AdminTravelRow[]>([])

const deleteTitle = computed(() => {
  const rows = deleteRows.value
  if (rows.length === 1) return '删除这张照片？'
  return `删除选中的 ${rows.length} 张照片？`
})

function handleSelectionChange(rows: AdminTravelRow[]) {
  selectedRows.value = rows
}

function openCreate() {
  editing.value = null
  formVisible.value = true
}

function openEdit(row: AdminTravelRow) {
  editing.value = row
  formVisible.value = true
}

async function save(payload: TravelPayload) {
  if (saving.value) return
  saving.value = true

  try {
    if (editing.value) {
      await updateTravel(editing.value.id, payload)
      adminAlert.success('照片信息已更新')
    } else {
      await createTravel(payload)
      adminAlert.success('照片已添加')
    }

    formVisible.value = false
    emit('refresh')
  } catch (error) {
    console.error('[travelManage] 保存照片失败', error)
    adminAlert.error(adminTravelErrorMessage(error))
  } finally {
    saving.value = false
  }
}

function requestDelete(row: AdminTravelRow) {
  if (deleting.value) return
  deleteRows.value = [row]
  deleteVisible.value = true
}

function requestDeleteSelected() {
  if (deleting.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要删除的照片')
    return
  }

  deleteRows.value = [...selectedRows.value]
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!deleteRows.value.length || deleting.value) return

  const rows = deleteRows.value
  deleting.value = true

  try {
    await deleteTravel(rows.map((row) => row.id))
    deleteVisible.value = false
    deleteRows.value = []
    adminAlert.success(rows.length === 1 ? '照片已删除' : `已删除 ${rows.length} 张照片`)
    emit('refresh')
  } catch (error) {
    console.error('[travelManage] 删除照片失败', error)
    adminAlert.error(adminTravelErrorMessage(error))
  } finally {
    deleting.value = false
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

.travel-selection-enter-active,
.travel-selection-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.travel-selection-enter-from,
.travel-selection-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

:global(html.dark) .admin-selection-pill {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

@media (prefers-reduced-motion: reduce) {
  .travel-selection-enter-active,
  .travel-selection-leave-active {
    transition: none;
  }
}
</style>
