<template>
  <AdminDialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    :description="
      isEdit ? '修改后前台的分类名和地址会同步更新。' : '新建的分类会立即出现在前台分类页。'
    "
    :loading="submitting"
    :confirm-disabled="!canSave"
    confirm-text="保存"
    @confirm="handleConfirm"
  >
    <div class="space-y-4">
      <AdminFormField label="分类名称" required :error="nameError" hint="最多 20 个字">
        <input v-model="name" maxlength="20" placeholder="例如：开发笔记" @blur="touched = true" />
      </AdminFormField>

      <AdminFormField
        label="Slug"
        required
        :error="slugError"
        hint="用于地址栏，只能包含小写字母、数字和连字符，例如 dev"
      >
        <input v-model="slug" maxlength="30" placeholder="dev" @blur="normalizeSlug" />
      </AdminFormField>

      <AdminFormField
        label="排序"
        required
        :error="sortError"
        hint="数字越小越靠前，不能和已有分类重复"
      >
        <input v-model="sortOrderText" inputmode="numeric" placeholder="1" />
      </AdminFormField>
    </div>
  </AdminDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AdminCategoryRow, CategoryPayload } from '@/api/adminCategories'
import AdminDialog from '@/components/common/admin/AdminDialog.vue'
import AdminFormField from '@/components/common/admin/AdminFormField.vue'

const props = withDefaults(
  defineProps<{
    /** 传入表示编辑，不传表示新增 */
    category?: AdminCategoryRow | null
    /** 新增时预填的排序值（当前最大排序 + 1） */
    nextSortOrder?: number
    submitting?: boolean
  }>(),
  {
    category: null,
    nextSortOrder: 1,
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [payload: CategoryPayload]
}>()

const visible = defineModel<boolean>({ default: false })

const name = ref('')
const slug = ref('')
const sortOrderText = ref('1')
/** 点过输入框后才开始显示「不能为空」这类提示 */
const touched = ref(false)

const isEdit = computed(() => Boolean(props.category))

// 每次打开弹窗都按当前行重置表单
watch(visible, (open) => {
  if (!open) return

  name.value = props.category?.name ?? ''
  slug.value = props.category?.slug ?? ''
  sortOrderText.value = String(props.category?.sort_order ?? props.nextSortOrder)
  touched.value = false
})

const nameError = computed(() => {
  const value = name.value.trim()
  if (!value) return touched.value ? '分类名称不能为空' : ''
  if (value.length > 20) return '分类名称最多 20 个字'
  return ''
})

const slugError = computed(() => {
  const value = slug.value.trim()
  if (!value) return touched.value ? 'slug 不能为空' : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return '只能使用小写字母、数字和连字符，例如 dev-notes'
  }
  return ''
})

const sortOrder = computed(() => Number(sortOrderText.value))
const sortError = computed(() => {
  if (!sortOrderText.value.trim()) return '排序值不能为空'
  if (!Number.isInteger(sortOrder.value) || sortOrder.value < 1 || sortOrder.value > 32767) {
    return '请填 1 - 32767 之间的整数'
  }
  return ''
})

const canSave = computed(
  () => Boolean(name.value.trim()) && !nameError.value && !slugError.value && !sortError.value,
)

/** 失焦时顺手把 slug 收干净，避免大小写和首尾空格导致保存失败 */
function normalizeSlug() {
  touched.value = true
  slug.value = slug.value.trim().toLowerCase()
}

function handleConfirm() {
  if (!canSave.value) {
    touched.value = true
    return
  }

  emit('submit', {
    name: name.value.trim(),
    slug: slug.value.trim(),
    sort_order: sortOrder.value,
  })
}
</script>

<style scoped></style>
