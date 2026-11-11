<template>
  <div class="w-full">
    <!-- 真正的文件输入框藏起来，点下面的按钮触发 -->
    <input
      ref="fileInputRef"
      class="hidden"
      type="file"
      accept="image/*"
      @change="handleFileChange"
    />

    <!-- 已有封面 / 本地预览 -->
    <div v-if="displayUrl" class="cover-preview">
      <img :src="displayUrl" alt="文章封面预览" />
      <span class="cover-status" :class="pendingFile ? 'is-pending' : 'is-saved'">
        {{ pendingFile ? '待上传' : '已保存' }}
      </span>
    </div>

    <!-- 还没有封面 -->
    <button v-else type="button" class="cover-empty" @click="openPicker">
      <span class="cover-empty-icon">
        <el-icon :size="18"><Plus /></el-icon>
      </span>
      <span class="text-[12px] font-medium text-slate-500 dark:text-slate-300">选择封面图片</span>
      <span class="text-[10.5px] text-slate-400 dark:text-slate-500">
        jpg / png / webp · 5MB 以内
      </span>
    </button>

    <!-- 选好图片但还没上传 -->
    <div v-if="pendingFile" class="mt-2 space-y-2">
      <p class="truncate text-[10.5px] text-slate-400 dark:text-slate-500">
        {{ pendingFile.name }}
      </p>
      <div class="cover-actions flex gap-2">
        <el-button size="small" type="primary" :loading="uploading" @click="uploadCover">
          <el-icon v-if="!uploading" class="mr-1"><UploadFilled /></el-icon>上传封面
        </el-button>
        <el-button size="small" :disabled="uploading" @click="cancelPending">取消</el-button>
      </div>
    </div>

    <!-- 已有封面时的操作 -->
    <div v-else-if="cover" class="mt-2 flex items-center justify-between gap-2">
      <span class="text-[10.5px] text-slate-400 dark:text-slate-500">建议比例 16:9</span>
      <div class="cover-actions flex gap-1">
        <el-button size="small" text @click="openPicker">更换</el-button>
        <el-button size="small" text type="danger" @click="clearCover">移除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { supabase } from '@/api/supabase'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'

const adminAlert = useAdminAlert()

/** 封面图片地址，和 posts.cover_url 双向绑定 */
const cover = defineModel<string>({ default: '' })

const BUCKET = 'blog-image'
const MAX_SIZE = 5 * 1024 * 1024

// 上传状态交给父级，正在传图时禁用发布/存草稿，避免文章保存了、封面还没写完
const uploading = defineModel<boolean>('uploading', { default: false })

const fileInputRef = ref<HTMLInputElement>()
const pendingFile = ref<File | null>(null)
const localPreview = ref('')

// 有本地预览就优先显示本地图，上传成功后自动换成线上地址
const displayUrl = computed(() => localPreview.value || cover.value)

function openPicker() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
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
  pendingFile.value = file
  localPreview.value = URL.createObjectURL(file)
}

async function uploadCover() {
  if (!pendingFile.value || uploading.value) return

  const file = pendingFile.value
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

    cover.value = data.publicUrl
    cancelPending() // 线上地址已经拿到，撤掉本地预览
    adminAlert.success('封面上传成功')
  } catch (error) {
    console.error('[articleEditor] 封面上传失败', error)
    adminAlert.error(
      error instanceof Error ? error.message : '封面上传失败，请检查 blog-image 存储桶配置',
    )
  } finally {
    uploading.value = false
  }
}

/** 存储路径按日期分文件夹，文件名用随机串避免重名 */
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
  return `covers/${date}/${crypto.randomUUID()}.${ext}`
}

function clearCover() {
  if (uploading.value) return
  cancelPending()
  cover.value = ''
}

function cancelPending() {
  pendingFile.value = null
  revokeLocalPreview()
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function revokeLocalPreview() {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = ''
}

onBeforeUnmount(revokeLocalPreview)

// 父页面保存成功后会清空封面，这时本地选好但没上传的图也要一起撤掉
watch(cover, (value) => {
  if (!value && pendingFile.value) cancelPending()
})
</script>

<style scoped>
/* 相邻按钮默认会多出 12px 左边距，这里统一交给 flex 的 gap 控制 */
.cover-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.cover-preview {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f1f5f9;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-status {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  backdrop-filter: blur(6px);
}

.cover-status.is-pending {
  background: rgba(251, 191, 36, 0.9);
  color: #78350f;
}

.cover-status.is-saved {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
}

.cover-empty {
  display: flex;
  width: 100%;
  aspect-ratio: 16 / 9;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.cover-empty:hover {
  border-color: #7dd3fc;
  background: #f0f9ff;
}

.cover-empty-icon {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #e0f2fe;
  color: #0284c7;
}

:global(html.dark .cover-preview) {
  border-color: #334155;
  background: #0b1220;
}

:global(html.dark .cover-empty) {
  border-color: #475569;
  background: #0b1220;
}

:global(html.dark .cover-empty:hover) {
  border-color: #0369a1;
  background: #0f1c30;
}

:global(html.dark .cover-empty-icon) {
  background: rgba(2, 132, 199, 0.18);
  color: #7dd3fc;
}
</style>
