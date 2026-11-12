<template>
  <div
    class="flex w-full min-h-0 flex-1 flex-col rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900"
  >
    <!-- 工具栏 -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">标签列表</h3>
        <Transition name="tag-selection">
          <span v-if="selectedRows.length" class="admin-selection-pill">
            已选 <span class="tabular-nums">{{ selectedRows.length }}</span> 个
          </span>
        </Transition>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <AdminAddButton text="新增标签" @addHandler="openCreate" />
        <AdminDeleteButton text="删除所选标签" @delHandler="requestDeleteSelected" />
      </div>
    </div>

    <TagManageTable
      :tags="tags"
      :list="list"
      :current-page="currentPage"
      :keyword="keyword"
      class="min-h-0 flex-1"
      @page-jump="emit('pageJump', $event)"
      @rename="openRename"
      @delete="requestDelete"
      @selection-change="handleSelectionChange"
    />

    <!-- 新增 / 重命名共用同一个弹窗 -->
    <TagManageForm v-model="formVisible" :tag="editing" :submitting="saving" @submit="save" />

    <!-- 删除确认：只是解除文章关联，不会删文章 -->
    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      :title="deleteTitle"
      message="删除标签只会解除文章和标签的关联，文章本身不会被删除。"
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
  adminTagErrorMessage,
  createTag,
  deleteTags,
  renameTag,
  type AdminTagRow,
} from '@/api/adminTags'
import AdminAddButton from '@/components/common/admin/AdminAddButton.vue'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import AdminDeleteButton from '@/components/common/admin/AdminDeleteButton.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import TagManageForm from './TagManageForm.vue'
import TagManageTable from './TagManageTable.vue'

const props = defineProps<{
  tags?: AdminTagRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  refresh: []
}>()

const adminAlert = useAdminAlert()

const selectedRows = ref<AdminTagRow[]>([])

const formVisible = ref(false)
const saving = ref(false)
const editing = ref<AdminTagRow | null>(null)

const deleteVisible = ref(false)
const deleting = ref(false)
const deleteRows = ref<AdminTagRow[]>([])

const deleteTitle = computed(() => {
  const rows = deleteRows.value
  if (rows.length === 1) {
    const row = rows[0]
    return row ? `删除标签「${row.name}」？` : '删除这个标签？'
  }
  return `删除选中的 ${rows.length} 个标签？`
})

function handleSelectionChange(rows: AdminTagRow[]) {
  selectedRows.value = rows
}

function openCreate() {
  editing.value = null
  formVisible.value = true
}

function openRename(row: AdminTagRow) {
  editing.value = row
  formVisible.value = true
}

async function save(name: string) {
  if (saving.value) return
  saving.value = true

  try {
    if (editing.value) {
      await renameTag(editing.value.id, name)
      adminAlert.success('标签已重命名')
    } else {
      await createTag(name)
      adminAlert.success('标签已添加')
    }

    formVisible.value = false
    emit('refresh')
  } catch (error) {
    console.error('[tagManage] 保存标签失败', error)
    adminAlert.error(adminTagErrorMessage(error))
  } finally {
    saving.value = false
  }
}

function requestDelete(row: AdminTagRow) {
  if (deleting.value) return
  deleteRows.value = [row]
  deleteVisible.value = true
}

function requestDeleteSelected() {
  if (deleting.value) return

  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要删除的标签')
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
    await deleteTags(rows.map((row) => row.id))
    deleteVisible.value = false
    deleteRows.value = []
    adminAlert.success(rows.length === 1 ? '标签已删除' : `已删除 ${rows.length} 个标签`)
    emit('refresh')
  } catch (error) {
    console.error('[tagManage] 删除标签失败', error)
    adminAlert.error(adminTagErrorMessage(error))
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

.tag-selection-enter-active,
.tag-selection-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tag-selection-enter-from,
.tag-selection-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

:global(html.dark) .admin-selection-pill {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

@media (prefers-reduced-motion: reduce) {
  .tag-selection-enter-active,
  .tag-selection-leave-active {
    transition: none;
  }
}
</style>
