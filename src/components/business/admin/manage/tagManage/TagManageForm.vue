<template>
  <AdminDialog
    v-model="visible"
    :title="isEdit ? '重命名标签' : '新增标签'"
    :description="
      isEdit
        ? '改名后所有关联文章会同步显示新名字，不会影响文章内容。'
        : '新标签会出现在文章编辑页的标签选择里。'
    "
    :loading="submitting"
    :confirm-disabled="!canSave"
    confirm-text="保存"
    @confirm="handleConfirm"
  >
    <AdminFormField
      label="标签名称"
      required
      :error="nameError"
      hint="最多 30 个字，不能和已有标签重名"
    >
      <input
        v-model="name"
        maxlength="30"
        placeholder="例如：Vue"
        @blur="touched = true"
        @keyup.enter="handleConfirm"
      />
    </AdminFormField>
  </AdminDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AdminTagRow } from '@/api/adminTags'
import AdminDialog from '@/components/common/admin/AdminDialog.vue'
import AdminFormField from '@/components/common/admin/AdminFormField.vue'

const props = withDefaults(
  defineProps<{
    /** 传入表示重命名，不传表示新增 */
    tag?: AdminTagRow | null
    submitting?: boolean
  }>(),
  {
    tag: null,
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [name: string]
}>()

const visible = defineModel<boolean>({ default: false })

const name = ref('')
const touched = ref(false)

const isEdit = computed(() => Boolean(props.tag))

watch(visible, (open) => {
  if (!open) return

  name.value = props.tag?.name ?? ''
  touched.value = false
})

const nameError = computed(() => {
  const value = name.value.trim()
  if (!value) return touched.value ? '标签名称不能为空' : ''
  if (value.length > 30) return '标签名称最多 30 个字'
  return ''
})

const canSave = computed(() => Boolean(name.value.trim()) && !nameError.value)

function handleConfirm() {
  if (!canSave.value) {
    touched.value = true
    return
  }

  emit('submit', name.value.trim())
}
</script>

<style scoped></style>
