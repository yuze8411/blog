<template>
  <aside
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.4)] transition-colors dark:border-slate-800 dark:bg-slate-900"
  >
    <!-- 操作区标题 -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
    >
      <div>
        <h2 class="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">操作区</h2>
        <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">文章信息与发布操作</p>
      </div>
      <span
        class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700"
      >
        <el-icon :size="15"><Setting /></el-icon>
      </span>
    </header>

    <!-- 表单区：字段照着 sql.text 里的 posts 表来 -->
    <el-scrollbar class="min-h-0 flex-1">
      <div class="admin-article-form p-4">
        <div class="mb-3 flex items-center gap-2">
          <span class="text-[10.5px] font-medium tracking-[0.12em] text-slate-400 dark:text-slate-500">
            文章信息
          </span>
          <span
            class="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"
          />
        </div>
        <el-form label-position="top" @submit.prevent>
          <el-form-item label="标题" required>
            <el-input v-model="title" maxlength="80" show-word-limit placeholder="给文章起个标题" />
          </el-form-item>

          <el-form-item label="分类" required>
            <el-select v-model="category" class="w-full" placeholder="选择文章分类">
              <el-option
                v-for="item in categories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="标签">
            <div class="w-full">
              <el-select
                v-model="selectedTags"
                class="w-full"
                multiple
                filterable
                allow-create
                default-first-option
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                placeholder="选择已有标签，或直接输入新标签"
              >
                <el-option
                  v-for="item in tags"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
              <p class="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                输入新名字后按回车即可创建，保存文章时会一起写入
              </p>
            </div>
          </el-form-item>

          <el-form-item label="摘要">
            <div class="w-full">
              <el-input
                v-model="excerpt"
                type="textarea"
                :rows="3"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder="手动输入，或点下面的按钮让 AI 生成"
              />
              <div class="mt-1.5 flex items-center justify-between gap-2">
                <span class="text-[10px] text-slate-400 dark:text-slate-500">
                  留空则自动截取正文
                </span>
                <el-button
                  link
                  size="small"
                  class="admin-ai-text-btn"
                  :loading="generatingExcerpt"
                  :disabled="saving || publishing"
                  @click="emit('generateExcerpt')"
                >
                  <el-icon v-if="!generatingExcerpt" class="mr-1"><MagicStick /></el-icon>
                  {{ generatingExcerpt ? '生成中…' : 'AI 生成摘要' }}
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="封面">
            <ArticleCoverUpload v-model="cover" v-model:uploading="coverUploading" />
          </el-form-item>

          <el-form-item label="Slug">
            <el-input v-model="slug" placeholder="留空自动生成，例如 my-first-post" />
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>

    <!-- 底部固定操作按钮 -->
    <div
      class="admin-actions shrink-0 space-y-2.5 border-t border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <el-button
        class="admin-publish-btn w-full"
        size="large"
        :loading="publishing"
        :disabled="saving || coverUploading"
        @click="emit('publish')"
      >
        <el-icon class="mr-1.5"><Promotion /></el-icon>发布文章
      </el-button>

      <el-button
        class="admin-draft-btn w-full"
        size="large"
        :loading="saving"
        :disabled="publishing || coverUploading"
        @click="emit('draft')"
      >
        <el-icon class="mr-1.5"><DocumentAdd /></el-icon>存入草稿箱
      </el-button>

      <div class="grid grid-cols-2 gap-2">
        <el-button class="admin-grid-btn" @click="emit('openDrafts')">
          <el-icon class="mr-1"><Files /></el-icon>草稿箱
        </el-button>
        <el-button class="admin-grid-btn" @click="emit('back')">
          <el-icon class="mr-1"><Back /></el-icon>返回管理
        </el-button>
      </div>

      <div class="pt-1">
        <!-- 手动写作 / AI 写作切换 -->
        <el-button
          class="admin-ai-btn w-full"
          :class="{ 'is-on': aiMode }"
          size="large"
          @click="emit('toggleAi')"
        >
          <el-icon class="mr-1.5"><MagicStick /></el-icon>
          {{ aiMode ? '返回手动写作' : 'AI 写作' }}
        </el-button>
        <p class="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
          {{ aiMode ? 'AI 会直接改写预览区里的正文' : '让 AI 帮你修改或重写正文' }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Back,
  DocumentAdd,
  Files,
  MagicStick,
  Promotion,
  Setting,
} from '@element-plus/icons-vue'
import ArticleCoverUpload from './ArticleCoverUpload.vue'
import type { CategoryOption, TagOption } from './types'

defineProps<{
  categories: CategoryOption[]
  tags: TagOption[]
  aiMode: boolean
  /** 正在存草稿 */
  saving: boolean
  /** 正在发布 */
  publishing: boolean
  /** 正在用 AI 生成摘要 */
  generatingExcerpt: boolean
}>()

const emit = defineEmits<{
  publish: []
  draft: []
  openDrafts: []
  back: []
  toggleAi: []
  generateExcerpt: []
}>()

// 这些字段由父页面直接双向绑定，省去一堆手动同步
const title = defineModel<string>('title', { default: '' })
const slug = defineModel<string>('slug', { default: '' })
const excerpt = defineModel<string>('excerpt', { default: '' })
const cover = defineModel<string>('cover', { default: '' })
// 封面是否正在上传，传给底部按钮用来禁用
const coverUploading = defineModel<boolean>('uploading', { default: false })
const category = defineModel<number | null>('category', { default: null })
// 用 chosen 这个名字，避免和上面「可选标签列表」的 tags prop 重名
// 已有标签是数字 id，手输的新标签是字符串，保存时再统一换成 id
const selectedTags = defineModel<Array<number | string>>('chosen', { default: () => [] })
</script>

<style scoped>
/* 让表单里的输入框在暗色下也顺眼 */
.admin-article-form {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #cbd5e1;
  --el-input-focus-border-color: #38bdf8;
  --el-text-color-regular: #475569;
  --el-text-color-placeholder: #94a3b8;
}

:global(html.dark .admin-article-form) {
  --el-input-bg-color: #0b1220;
  --el-input-border-color: #334155;
  --el-input-hover-border-color: #475569;
  --el-input-focus-border-color: #0ea5e9;
  --el-text-color-regular: #cbd5e1;
  --el-text-color-placeholder: #64748b;
}

/* Element Plus 默认给相邻按钮加 12px 左边距，在纵向和网格布局里会把按钮推歪 */
.admin-actions :deep(.el-button + .el-button),
.admin-article-form :deep(.el-button + .el-button) {
  margin-left: 0;
}

.admin-article-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.admin-article-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.admin-article-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

:global(html.dark .admin-article-form .el-form-item__label) {
  color: #94a3b8;
}

/* 下拉框是 teleport 到 body 的，单独给暗色样式 */
:global(html.dark .el-select__popper) {
  border-color: #334155;
  background: #0f172a;
}

:global(html.dark .el-select__popper .el-select-dropdown__item) {
  color: #cbd5e1;
}

:global(html.dark .el-select__popper .el-select-dropdown__item.is-hovering) {
  background: #1e293b;
}

:global(html.dark .el-select__popper .el-select-dropdown__item.is-selected) {
  color: #7dd3fc;
}

/* 底部按钮的通用暗色变量 */
.admin-actions {
  --el-button-bg-color: #ffffff;
  --el-button-border-color: #e2e8f0;
  --el-button-text-color: #475569;
  --el-button-hover-bg-color: #f8fafc;
  --el-button-hover-border-color: #cbd5e1;
  --el-button-hover-text-color: #0f172a;
}

:global(html.dark .admin-actions) {
  --el-button-bg-color: #0b1220;
  --el-button-border-color: #334155;
  --el-button-text-color: #cbd5e1;
  --el-button-hover-bg-color: #1e293b;
  --el-button-hover-border-color: #475569;
  --el-button-hover-text-color: #f1f5f9;
}

/* 发布 / 草稿按钮高度统一，视觉上更整齐 */
.admin-publish-btn,
.admin-draft-btn,
.admin-ai-btn {
  height: 42px;
  border-radius: 10px;
}

/* 草稿箱 / 返回管理做成同高的小按钮，视觉上更整齐 */
.admin-grid-btn {
  height: 34px;
  border-radius: 9px;
  font-size: 12px;
}

/* 发布按钮：蓝色渐变，主要操作一眼能看到 */
.admin-publish-btn {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
  --el-button-disabled-text-color: rgba(255, 255, 255, 0.75);
  border: none;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #fff;
  box-shadow: 0 10px 22px -14px rgba(37, 99, 235, 0.9);
}

.admin-draft-btn {
  font-weight: 500;
}

.admin-publish-btn:hover,
.admin-publish-btn:focus {
  --el-button-hover-text-color: #fff;
  background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
  color: #fff;
}

/* 摘要旁边的「AI 生成」文字按钮 */
.admin-ai-text-btn {
  --el-button-text-color: #4f46e5;
  --el-button-hover-link-text-color: #4338ca;
  flex-shrink: 0;
  height: 20px;
  padding: 0 4px;
  font-size: 11px;
}

:global(html.dark .admin-ai-text-btn) {
  --el-button-text-color: #a5b4fc;
  --el-button-hover-link-text-color: #c7d2fe;
}

/* AI 写作按钮：默认浅紫，激活后变实心渐变 */
.admin-ai-btn {
  --el-button-text-color: #4f46e5;
  --el-button-hover-text-color: #4338ca;
  --el-button-border-color: #c7d2fe;
  --el-button-hover-border-color: #a5b4fc;
  --el-button-bg-color: #eef2ff;
  --el-button-hover-bg-color: #e0e7ff;
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
}

.admin-ai-btn:hover,
.admin-ai-btn:focus {
  border-color: #a5b4fc;
  background: #e0e7ff;
  color: #4338ca;
}

.admin-ai-btn.is-on,
.admin-ai-btn.is-on:hover,
.admin-ai-btn.is-on:focus {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #6366f1, #2563eb);
  color: #fff;
  box-shadow: 0 10px 22px -14px rgba(79, 70, 229, 0.9);
}

:global(html.dark .admin-ai-btn) {
  --el-button-text-color: #a5b4fc;
  --el-button-hover-text-color: #c7d2fe;
  border-color: #4338ca;
  background: rgba(99, 102, 241, 0.14);
  color: #a5b4fc;
}

:global(html.dark .admin-ai-btn:hover) {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.24);
  color: #c7d2fe;
}

:global(html.dark .admin-ai-btn.is-on) {
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #6366f1, #2563eb);
  color: #fff;
}
</style>
