<template>
  <div
    class="flex w-full min-h-0 flex-1 flex-col rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900"
  >
    <!-- 工具栏 -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-1">
      <div class="flex min-w-0 items-center gap-2.5">
        <h3 class="text-[17px] font-semibold text-slate-600 dark:text-slate-300">分类列表</h3>
        <span class="text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
          共 {{ categories?.length ?? 0 }} 个
        </span>
      </div>

      <AdminAddButton text="新增分类" @addHandler="openCreate" />
    </div>

    <CategoryManageTable
      :categories="categories"
      :keyword="keyword"
      class="min-h-0 flex-1"
      @edit="openEdit"
      @delete="requestDelete"
    />

    <!-- 新增 / 编辑共用同一个弹窗 -->
    <CategoryManageForm
      v-model="formVisible"
      :category="editing"
      :next-sort-order="nextSortOrder"
      :submitting="saving"
      @submit="save"
    />

    <!-- 删除确认：分类下还有文章时数据库会拒绝，错误会提示到页面 -->
    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      title="删除这个分类？"
      message="删除后无法恢复；如果分类下还有文章，需要先把文章移到其它分类。"
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
  adminCategoryErrorMessage,
  createCategory,
  deleteCategory,
  updateCategory,
  type AdminCategoryRow,
  type CategoryPayload,
} from '@/api/adminCategories'
import AdminAddButton from '@/components/common/admin/AdminAddButton.vue'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import CategoryManageForm from './CategoryManageForm.vue'
import CategoryManageTable from './CategoryManageTable.vue'

const props = defineProps<{
  categories?: AdminCategoryRow[] | null
  keyword?: string
}>()

const emit = defineEmits<{
  refresh: []
}>()

const adminAlert = useAdminAlert()

const formVisible = ref(false)
const saving = ref(false)
const editing = ref<AdminCategoryRow | null>(null)

const deleteVisible = ref(false)
const deleting = ref(false)
const deletingRow = ref<AdminCategoryRow | null>(null)

/** 新增分类时默认排到最后 */
const nextSortOrder = computed(() => {
  const max = Math.max(0, ...(props.categories ?? []).map((item) => item.sort_order))
  return max + 1
})

function openCreate() {
  editing.value = null
  formVisible.value = true
}

function openEdit(row: AdminCategoryRow) {
  editing.value = row
  formVisible.value = true
}

async function save(payload: CategoryPayload) {
  if (saving.value) return
  saving.value = true

  try {
    if (editing.value) {
      await updateCategory(editing.value.id, payload)
      adminAlert.success('分类已更新')
    } else {
      await createCategory(payload)
      adminAlert.success('分类已添加')
    }

    formVisible.value = false
    emit('refresh')
  } catch (error) {
    console.error('[categoryManage] 保存分类失败', error)
    adminAlert.error(adminCategoryErrorMessage(error))
  } finally {
    saving.value = false
  }
}

function requestDelete(row: AdminCategoryRow) {
  // 视图里的文章数是「已发布且展示」的，先挡掉确定删不掉的情况
  if (row.post_count > 0) {
    adminAlert.warning(`「${row.name}」下还有 ${row.post_count} 篇文章，先把文章移到其它分类再删除`)
    return
  }

  deletingRow.value = row
  deleteVisible.value = true
}

async function confirmDelete() {
  const row = deletingRow.value
  if (!row || deleting.value) return

  deleting.value = true
  try {
    await deleteCategory(row.id)
    deleteVisible.value = false
    deletingRow.value = null
    adminAlert.success('分类已删除')
    emit('refresh')
  } catch (error) {
    console.error('[categoryManage] 删除分类失败', error)
    adminAlert.error(adminCategoryErrorMessage(error))
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped></style>
