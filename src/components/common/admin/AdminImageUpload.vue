<!--
  后台通用图片上传：选图后直接传到 Supabase Storage 的 blog-image 桶，
  上传成功把公开地址写回 v-model，失败则保留原图不变。

  用法：
  <AdminImageUpload v-model="form.img_url" v-model:uploading="uploading" folder="travel" />
-->
<template>
  <div class="w-full">
    <input ref="fileInputRef" class="hidden" type="file" accept="image/*" @change="handleChange" />

    <!-- 已有图片 / 本地预览 -->
    <div v-if="displayUrl" class="admin-upload-preview">
      <img :src="displayUrl" alt="图片预览" />

      <span class="admin-upload-state" :class="uploading ? 'is-uploading' : 'is-saved'">
        {{ uploading ? '上传中…' : '已上传' }}
      </span>

      <div v-if="!uploading" class="admin-upload-actions">
        <button type="button" @click="openPicker">更换</button>
        <button type="button" class="is-danger" @click="clear">移除</button>
      </div>

      <div v-if="uploading" class="admin-upload-mask" aria-hidden="true">
        <span class="admin-upload-spinner"></span>
      </div>
    </div>

    <!-- 还没有图片 -->
    <button v-else type="button" class="admin-upload-empty" @click="openPicker">
      <span class="admin-upload-empty-icon">
        <el-icon :size="18"><Plus /></el-icon>
      </span>
      <span class="text-[12px] font-medium text-slate-500 dark:text-slate-300">选择图片</span>
      <span class="text-[10.5px] text-slate-400 dark:text-slate-500">
        jpg / png / webp · 5MB 以内
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { supabase } from '@/api/supabase'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'

const props = withDefaults(
  defineProps<{
    /** Storage 里的文件夹，区分不同业务的图片 */
    folder?: string
  }>(),
  { folder: 'travel' },
)

const adminAlert = useAdminAlert()

/** 图片公开地址 */
const imageUrl = defineModel<string>({ default: '' })
/** 上传状态交给父级，用来禁用保存按钮 */
const uploading = defineModel<boolean>('uploading', { default: false })

const BUCKET = 'blog-image'
const MAX_SIZE = 5 * 1024 * 1024

const fileInputRef = ref<HTMLInputElement>()
const localPreview = ref('')

// 本地预览优先，上传成功后换成线上地址
const displayUrl = computed(() => localPreview.value || imageUrl.value)

function openPicker() {
  if (uploading.value) return
  fileInputRef.value?.click()
}

async function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许下次重新选同一个文件
  if (!file) return

  if (!file.type.startsWith('image/')) {
    adminAlert.warning('请选择图片文件')
    return
  }
  if (file.size > MAX_SIZE) {
    adminAlert.warning('图片不能超过 5MB')
    return
  }

  revokeLocalPreview()
  localPreview.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const path = buildStoragePath(file)
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    if (!data.publicUrl) throw new Error('没有拿到图片的公开地址')

    imageUrl.value = data.publicUrl
    revokeLocalPreview()
    adminAlert.success('图片上传成功')
  } catch (error) {
    console.error('[adminImageUpload] 图片上传失败', error)
    revokeLocalPreview()
    adminAlert.error(
      error instanceof Error ? error.message : '图片上传失败，请检查 blog-image 存储桶配置',
    )
  } finally {
    uploading.value = false
  }
}

/** 路径按文件夹 + 日期归档，文件名用随机串避免重名 */
function buildStoragePath(file: File) {
  const extFromType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
  }
  const ext =
    extFromType[file.type] ||
    file.name
      .split('.')
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, '') ||
    'jpg'

  const date = new Date().toISOString().slice(0, 10)
  return `${props.folder}/${date}/${crypto.randomUUID()}.${ext}`
}

function clear() {
  if (uploading.value) return
  revokeLocalPreview()
  imageUrl.value = ''
}

function revokeLocalPreview() {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = ''
}

onBeforeUnmount(revokeLocalPreview)
</script>

<style scoped>
.admin-upload-preview {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 168px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f1f5f9;
}

.admin-upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-upload-state {
  position: absolute;
  top: 8px;
  left: 8px;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  backdrop-filter: blur(6px);
}

.admin-upload-state.is-saved {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
}

.admin-upload-state.is-uploading {
  background: rgba(251, 191, 36, 0.92);
  color: #78350f;
}

.admin-upload-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
}

.admin-upload-actions button {
  border-radius: 8px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #475569;
  font-size: 11px;
  box-shadow: 0 4px 12px -6px rgba(15, 23, 42, 0.5);
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.admin-upload-actions button:hover {
  background: #fff;
  color: #0284c7;
}

.admin-upload-actions button.is-danger:hover {
  color: #be123c;
}

.admin-upload-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(1px);
}

.admin-upload-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 999px;
  animation: admin-upload-spin 0.7s linear infinite;
}

@keyframes admin-upload-spin {
  to {
    transform: rotate(360deg);
  }
}

.admin-upload-empty {
  display: flex;
  width: 100%;
  height: 168px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.admin-upload-empty:hover {
  border-color: #7dd3fc;
  background: #f0f9ff;
}

.admin-upload-empty-icon {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #e0f2fe;
  color: #0284c7;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark .admin-upload-preview) {
  border-color: #334155;
  background: #0b1220;
}

:global(html.dark .admin-upload-actions button) {
  background: rgba(15, 23, 42, 0.9);
  color: #cbd5e1;
}

:global(html.dark .admin-upload-actions button:hover) {
  background: #1e293b;
  color: #7dd3fc;
}

:global(html.dark .admin-upload-actions button.is-danger:hover) {
  color: #fda4af;
}

:global(html.dark .admin-upload-empty) {
  border-color: #475569;
  background: #0b1220;
}

:global(html.dark .admin-upload-empty:hover) {
  border-color: #0369a1;
  background: #0f1c30;
}

:global(html.dark .admin-upload-empty-icon) {
  background: rgba(2, 132, 199, 0.18);
  color: #7dd3fc;
}

@media (prefers-reduced-motion: reduce) {
  .admin-upload-spinner {
    animation: none;
  }
}
</style>
