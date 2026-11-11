<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.4)] transition-colors dark:border-slate-800 dark:bg-slate-900"
  >
    <!-- 面板头：AI 写作时右侧会显示「修改中 / 重写中」 -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
        >
          <el-icon :size="15"><View /></el-icon>
        </span>
        <div class="leading-tight">
          <h2 class="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">预览区</h2>
          <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">最终阅读效果</p>
        </div>
      </div>

      <span v-if="streaming" class="ai-stream-badge" :class="isRewrite ? 'is-rewrite' : 'is-modify'">
        <span class="ai-stream-dot" />
        {{ isRewrite ? 'AI 重写中' : 'AI 修改中' }}
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-100/70 px-2.5 py-1 text-[10.5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        实时预览
      </span>
    </header>

    <el-scrollbar class="min-h-0 flex-1 bg-slate-50/30 dark:bg-slate-950/20">
      <div class="mx-auto w-full max-w-3xl px-6 py-6 sm:px-8">
        <h1 v-if="title.trim()" class="preview-title">{{ title }}</h1>

        <div v-if="content.trim()" class="preview-prose" v-html="html"></div>

        <el-empty
          v-else
          description="还没有内容，先在左侧编辑区写点什么吧"
          :image-size="84"
        />
      </div>
    </el-scrollbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { View } from '@element-plus/icons-vue'
import { md, renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  content: string
  title: string
  /** AI 是否正在往编辑区流式写入 */
  streaming?: boolean
  /** 当前是「修改」还是「重写」，用来区分提示色 */
  mode?: 'modify' | 'rewrite' | null
}>()

const isRewrite = computed(() => props.mode === 'rewrite')

const html = ref('')
let renderToken = 0
let timer: number | undefined

/**
 * 内容一变就先同步渲染（打字 / 流式输出时立刻能看到），
 * 再防抖 350ms 用 Shiki 重新渲染一次带高亮的版本。
 */
watch(
  () => props.content,
  (value) => {
    html.value = md.render(value || '')

    window.clearTimeout(timer)
    const token = ++renderToken
    timer = window.setTimeout(async () => {
      try {
        const rendered = await renderMarkdown(value || '')
        // 期间内容又变了就丢弃这次结果，避免旧内容覆盖新内容
        if (token === renderToken) html.value = rendered
      } catch {
        // 渲染失败就继续用同步渲染的结果
      }
    }, 350)
  },
  { immediate: true },
)

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<style scoped>
/* AI 流式输出提示 */
.ai-stream-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 500;
}

.ai-stream-badge.is-modify {
  background: #f0f9ff;
  color: #0284c7;
}

.ai-stream-badge.is-rewrite {
  background: #fffbeb;
  color: #d97706;
}

.ai-stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  animation: ai-pulse 1s ease-in-out infinite;
}

:global(html.dark .ai-stream-badge.is-modify) {
  background: rgba(2, 132, 199, 0.16);
  color: #7dd3fc;
}

:global(html.dark .ai-stream-badge.is-rewrite) {
  background: rgba(217, 119, 6, 0.16);
  color: #fcd34d;
}

@keyframes ai-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* 文章标题 */
.preview-title {
  position: relative;
  margin: 0 0 22px;
  padding-bottom: 14px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.35;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.preview-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 46px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
}

:global(html.dark .preview-title) {
  color: #f1f5f9;
}

/* Markdown 正文样式（只作用于预览区） */
.preview-prose {
  color: #334155;
  font-size: 14.5px;
  line-height: 1.95;
  word-break: break-word;
}

.preview-prose :deep(h1),
.preview-prose :deep(h2),
.preview-prose :deep(h3),
.preview-prose :deep(h4) {
  margin: 1.4em 0 0.6em;
  font-weight: 650;
  line-height: 1.4;
  color: #0f172a;
}

.preview-prose :deep(h1) {
  font-size: 1.6em;
}

.preview-prose :deep(h2) {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e2e8f0;
  font-size: 1.35em;
}

.preview-prose :deep(h3) {
  font-size: 1.15em;
}

.preview-prose :deep(p) {
  margin: 0.9em 0;
}

.preview-prose :deep(a) {
  color: #0284c7;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.preview-prose :deep(ul),
.preview-prose :deep(ol) {
  margin: 0.9em 0;
  padding-left: 1.5em;
}

.preview-prose :deep(ul) {
  list-style: disc;
}

.preview-prose :deep(ol) {
  list-style: decimal;
}

.preview-prose :deep(li) {
  margin: 0.3em 0;
}

.preview-prose :deep(blockquote) {
  margin: 1em 0;
  padding: 0.6em 1em;
  border-left: 3px solid #7dd3fc;
  border-radius: 0 8px 8px 0;
  background: #f0f9ff;
  color: #475569;
}

.preview-prose :deep(blockquote p) {
  margin: 0;
}

.preview-prose :deep(code) {
  padding: 2px 5px;
  border-radius: 5px;
  background: #f1f5f9;
  color: #be123c;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.preview-prose :deep(pre) {
  margin: 1em 0;
  padding: 14px 16px;
  overflow-x: auto;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12.5px;
  line-height: 1.7;
}

.preview-prose :deep(pre code) {
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.preview-prose :deep(img) {
  max-width: 100%;
  border-radius: 10px;
}

.preview-prose :deep(table) {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-prose :deep(th),
.preview-prose :deep(td) {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.preview-prose :deep(th) {
  background: #f8fafc;
  font-weight: 600;
}

.preview-prose :deep(hr) {
  margin: 1.6em 0;
  border: none;
  border-top: 1px solid #e2e8f0;
}

/* 暗色模式：v-html 渲染出来的节点没有组件作用域，整条选择器都放进 :global */
:global(html.dark .preview-prose) {
  color: #cbd5e1;
}

:global(html.dark .preview-prose h1),
:global(html.dark .preview-prose h2),
:global(html.dark .preview-prose h3),
:global(html.dark .preview-prose h4) {
  color: #f1f5f9;
}

:global(html.dark .preview-prose h2) {
  border-bottom-color: #334155;
}

:global(html.dark .preview-prose a) {
  color: #7dd3fc;
}

:global(html.dark .preview-prose blockquote) {
  background: rgba(2, 132, 199, 0.1);
  color: #cbd5e1;
}

:global(html.dark .preview-prose code) {
  background: #1e293b;
  color: #fda4af;
}

:global(html.dark .preview-prose pre) {
  background: #020617;
}

:global(html.dark .preview-prose pre code) {
  background: transparent;
  color: inherit;
}

:global(html.dark .preview-prose th),
:global(html.dark .preview-prose td) {
  border-color: #334155;
}

:global(html.dark .preview-prose th) {
  background: #1e293b;
}

:global(html.dark .preview-prose hr) {
  border-top-color: #334155;
}
</style>
