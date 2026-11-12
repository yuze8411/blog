<template>
  <AdminDialog
    v-model="visible"
    :title="isEdit ? '编辑游记照片' : '上传游记照片'"
    :description="
      isEdit ? '修改后会立即同步到前台游记页。' : '上传成功后，照片会出现在前台游记页。'
    "
    :loading="submitting"
    :confirm-disabled="!canSave"
    confirm-text="保存"
    @confirm="handleConfirm"
  >
    <template #icon>
      <el-icon :size="16"><Picture /></el-icon>
    </template>

    <div class="space-y-4">
      <AdminFormField label="照片" required :error="imageError">
        <AdminImageUpload
          v-model="imageUrl"
          v-model:uploading="uploading"
          folder="travel"
          @click="touched = true"
        />
      </AdminFormField>

      <AdminFormField label="照片介绍" required :error="introError" hint="最多 300 个字">
        <textarea
          v-model="intro"
          maxlength="300"
          rows="3"
          placeholder="写一句这张照片的故事，比如：清晨的嵩山，云雾还没散开…"
          @blur="touched = true"
        ></textarea>
      </AdminFormField>

      <AdminFormField label="标签" :error="tagsError" hint="多个标签用逗号分隔，最多 8 个">
        <input v-model="tagsText" placeholder="例如：山野，日落" @blur="touched = true" />

        <span v-if="tags.length" class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="tag in tags" :key="tag" class="travel-form-tag">#{{ tag }}</span>
        </span>
      </AdminFormField>

      <AdminFormField
        label="拍摄日期"
        required
        :error="dateError"
        hint="前台按这个日期从新到旧排序"
      >
        <input v-model="imgTime" type="date" />
      </AdminFormField>
    </div>
  </AdminDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import type { AdminTravelRow, TravelPayload } from '@/api/adminTravel'
import AdminDialog from '@/components/common/admin/AdminDialog.vue'
import AdminFormField from '@/components/common/admin/AdminFormField.vue'
import AdminImageUpload from '@/components/common/admin/AdminImageUpload.vue'

const props = withDefaults(
  defineProps<{
    /** 传入表示编辑，不传表示新增 */
    photo?: AdminTravelRow | null
    submitting?: boolean
  }>(),
  {
    photo: null,
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [payload: TravelPayload]
}>()

const visible = defineModel<boolean>({ default: false })

const imageUrl = ref('')
const uploading = ref(false)
const intro = ref('')
const tagsText = ref('')
const imgTime = ref('')
const touched = ref(false)

const isEdit = computed(() => Boolean(props.photo))

/** 标签输入用中英文逗号都能分隔，去重后去掉空项 */
const tags = computed(() => {
  const values = tagsText.value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
  return [...new Set(values)]
})

watch(visible, (open) => {
  if (!open) return

  imageUrl.value = props.photo?.img_url ?? ''
  intro.value = props.photo?.img_introduction ?? ''
  tagsText.value = (props.photo?.img_tags ?? []).join('，')
  imgTime.value = props.photo?.img_time?.slice(0, 10) || today()
  uploading.value = false
  touched.value = false
})

const imageError = computed(() => {
  if (uploading.value) return ''
  if (!imageUrl.value) return touched.value ? '请先上传一张照片' : ''
  return ''
})

const introError = computed(() => {
  const value = intro.value.trim()
  if (!value) return touched.value ? '照片介绍不能为空' : ''
  if (value.length > 300) return '照片介绍最多 300 个字'
  return ''
})

const tagsError = computed(() => {
  if (tags.value.length > 8) return '最多添加 8 个标签'
  const tooLong = tags.value.find((tag) => tag.length > 12)
  if (tooLong) return `标签「${tooLong}」太长了，最多 12 个字`
  return ''
})

const dateError = computed(() => {
  if (!imgTime.value) return '请选择拍摄日期'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(imgTime.value)) return '日期格式不正确'
  return ''
})

const canSave = computed(
  () =>
    Boolean(imageUrl.value) &&
    Boolean(intro.value.trim()) &&
    !uploading.value &&
    !introError.value &&
    !tagsError.value &&
    !dateError.value,
)

/** 本地日期，避免用 toISOString 在早上 8 点前差一天 */
function today() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function handleConfirm() {
  if (!canSave.value) {
    touched.value = true
    return
  }

  emit('submit', {
    img_url: imageUrl.value,
    img_introduction: intro.value.trim(),
    img_tags: tags.value,
    img_time: imgTime.value,
  })
}
</script>

<style scoped>
.travel-form-tag {
  border-radius: 999px;
  background: #f0f9ff;
  padding: 1px 8px;
  color: #0369a1;
  font-size: 11px;
  line-height: 20px;
}

:global(html.dark) .travel-form-tag {
  background: rgba(2, 132, 199, 0.16);
  color: #7dd3fc;
}
</style>
