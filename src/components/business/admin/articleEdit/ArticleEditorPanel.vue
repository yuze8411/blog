<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.4)] transition-all duration-300 focus-within:border-sky-300/80 focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.07)] dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-sky-800"
  >
    <!-- 面板头 -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-500 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60"
        >
          <el-icon :size="15"><EditPen /></el-icon>
        </span>
        <div class="leading-tight">
          <h2 class="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">编辑区</h2>
          <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">Markdown</p>
        </div>
      </div>
      <span
        class="rounded-full bg-slate-100/80 px-2.5 py-1 text-[10.5px] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        {{ count }} 字
      </span>
    </header>

    <!-- Markdown 工具栏：按钮做小一点，不抢编辑器的地方 -->
    <div class="md-toolbar">
      <template v-for="(group, groupIndex) in toolbarGroups" :key="groupIndex">
        <span v-if="groupIndex > 0" class="md-toolbar-divider" />
        <el-tooltip
          v-for="item in group"
          :key="item.key"
          :content="item.title"
          placement="top"
          :show-after="320"
        >
          <button
            type="button"
            class="md-tool-btn"
            :class="item.className"
            @mousedown.prevent="item.run"
          >
            <el-icon v-if="item.icon" :size="13"><component :is="item.icon" /></el-icon>
            <template v-else>{{ item.label }}</template>
          </button>
        </el-tooltip>
      </template>
    </div>

    <!-- Markdown 输入框：占满剩余高度，自己内部滚动 -->
    <el-input
      ref="inputRef"
      v-model="content"
      class="admin-md-editor min-h-0 flex-1"
      type="textarea"
      resize="none"
      spellcheck="false"
      placeholder="用 Markdown 写点什么吧…"
    />

    <footer
      class="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-2.5 text-[10.5px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500"
    >
      <span class="inline-flex items-center gap-1.5">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        内容会自动同步到预览
      </span>
      <span class="tabular-nums">{{ lineCount }} 行</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { EditPen, Grid, Link, Picture } from '@element-plus/icons-vue'

// 文章正文，由父页面双向绑定
const content = defineModel<string>({ default: '' })

// 字数不统计空白字符，看起来更接近「写了多少内容」
const count = computed(() => content.value.replace(/\s/g, '').length)
const lineCount = computed(() => content.value.split('\n').length)

// el-input 把内部 textarea 暴露在 textarea 字段上，插入语法时要靠它拿光标位置
const inputRef = ref<{ textarea?: HTMLTextAreaElement } | null>(null)

interface ToolbarItem {
  key: string
  title: string
  label?: string
  icon?: Component
  className?: string
  run: () => void
}

// 工具栏分组：标题 | 行内样式 | 块级样式 | 插入类
const toolbarGroups: ToolbarItem[][] = [
  [
    { key: 'h1', label: 'H1', title: '一级标题', run: () => toggleHeading(1) },
    { key: 'h2', label: 'H2', title: '二级标题', run: () => toggleHeading(2) },
    { key: 'h3', label: 'H3', title: '三级标题', run: () => toggleHeading(3) },
  ],
  [
    {
      key: 'bold',
      label: 'B',
      title: '加粗',
      className: 'is-bold',
      run: () => wrapSelection('**', '**', '加粗文字'),
    },
    {
      key: 'italic',
      label: 'I',
      title: '斜体',
      className: 'is-italic',
      run: () => wrapSelection('*', '*', '斜体文字'),
    },
    {
      key: 'strike',
      label: 'S',
      title: '删除线',
      className: 'is-strike',
      run: () => wrapSelection('~~', '~~', '删除文字'),
    },
    {
      key: 'code',
      label: '</>',
      title: '行内代码',
      className: 'is-code',
      run: () => wrapSelection('`', '`', '代码'),
    },
  ],
  [
    { key: 'quote', label: '“”', title: '引用', run: () => toggleLinePrefix('> ') },
    { key: 'ul', label: '•', title: '无序列表', run: () => toggleLinePrefix('- ') },
    { key: 'ol', label: '1.', title: '有序列表', run: () => toggleLinePrefix('1. ') },
    { key: 'code-block', label: '{ }', title: '代码块', run: insertCodeBlock },
  ],
  [
    { key: 'link', icon: Link, title: '插入链接', run: insertLink },
    { key: 'image', icon: Picture, title: '插入图片', run: insertImage },
    { key: 'table', icon: Grid, title: '插入表格', run: insertTable },
    { key: 'divider', label: '—', title: '分割线', run: insertDivider },
  ],
]

function getTextarea() {
  return inputRef.value?.textarea ?? null
}

/** 改完内容后把光标放回指定位置，不然会跳到末尾 */
function replaceRange(
  start: number,
  end: number,
  insert: string,
  selectStart: number,
  selectEnd = selectStart,
) {
  content.value = content.value.slice(0, start) + insert + content.value.slice(end)
  void nextTick(() => {
    const textarea = getTextarea()
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(selectStart, selectEnd)
  })
}

/** 给选中文字套上前后缀；没选中就插入占位文字并选中它 */
function wrapSelection(before: string, after: string, placeholder: string) {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.slice(start, end) || placeholder
  const insert = `${before}${selected}${after}`

  replaceRange(start, end, insert, start + before.length, start + before.length + selected.length)
}

/** 对光标所在行（或选中的多行）逐行做转换 */
function transformLines(transform: (line: string) => string) {
  const textarea = getTextarea()
  if (!textarea) return

  const value = content.value
  const blockStart = value.lastIndexOf('\n', textarea.selectionStart - 1) + 1
  let blockEnd = value.indexOf('\n', textarea.selectionEnd)
  if (blockEnd === -1) blockEnd = value.length

  const block = value.slice(blockStart, blockEnd)
  const nextBlock = block.split('\n').map(transform).join('\n')

  replaceRange(blockStart, blockEnd, nextBlock, blockStart + nextBlock.length)
}

/** 标题按钮：已经是这个级别就取消，否则替换掉原来的 # 前缀 */
function toggleHeading(level: number) {
  const prefix = `${'#'.repeat(level)} `
  transformLines((line) => {
    const cleaned = line.replace(/^#{1,6}\s+/, '')
    return line.startsWith(prefix) ? cleaned : prefix + cleaned
  })
}

/** 引用 / 列表按钮：有前缀就去掉，没有就加上 */
function toggleLinePrefix(prefix: string) {
  transformLines((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line))
}

function insertLink() {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.slice(start, end) || '链接文字'
  const insert = `[${selected}](https://)`
  // 插入后直接选中 https:// 这一段，方便马上输入地址
  const urlStart = start + selected.length + 3

  replaceRange(start, end, insert, urlStart, urlStart + 8)
}

function insertImage() {
  const textarea = getTextarea()
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.slice(start, end) || '图片描述'
  const insert = `![${selected}](https://)`
  const urlStart = start + selected.length + 4

  replaceRange(start, end, insert, urlStart, urlStart + 8)
}

function insertCodeBlock() {
  const textarea = getTextarea()
  if (!textarea) return

  const value = content.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end) || '代码'
  const needsBreak = start > 0 && value[start - 1] !== '\n'
  const leading = needsBreak ? '\n' : ''
  const snippet = `${leading}\`\`\`\n${selected}\n\`\`\`\n`
  // 选中代码部分，用户可以直接替换成真正的代码
  const bodyStart = start + leading.length + 4

  replaceRange(start, end, snippet, bodyStart, bodyStart + selected.length)
}

function insertTable() {
  const textarea = getTextarea()
  if (!textarea) return

  const value = content.value
  const start = textarea.selectionStart
  const needsBreak = start > 0 && value[start - 1] !== '\n'
  const snippet = `${needsBreak ? '\n' : ''}| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n`

  replaceRange(start, textarea.selectionEnd, snippet, start + snippet.length)
}

function insertDivider() {
  const textarea = getTextarea()
  if (!textarea) return

  const value = content.value
  const start = textarea.selectionStart
  const needsBreak = start > 0 && value[start - 1] !== '\n'
  const snippet = `${needsBreak ? '\n' : ''}---\n`

  replaceRange(start, textarea.selectionEnd, snippet, start + snippet.length)
}
</script>

<style scoped>
/* 让 el-input 的 textarea 撑满整个面板 */
.admin-md-editor :deep(.el-textarea) {
  height: 100%;
}

.admin-md-editor :deep(.el-textarea__inner) {
  height: 100% !important;
  padding: 16px 18px;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  color: #334155;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.85;
  letter-spacing: 0.01em;
  resize: none;
}

.admin-md-editor :deep(.el-textarea__inner:focus),
.admin-md-editor :deep(.el-textarea__inner:hover) {
  box-shadow: none;
}

.admin-md-editor :deep(.el-textarea__inner::placeholder) {
  color: #94a3b8;
}

:global(html.dark .admin-md-editor .el-textarea__inner) {
  color: #cbd5e1;
  caret-color: #38bdf8;
}

:global(html.dark .admin-md-editor .el-textarea__inner::placeholder) {
  color: #64748b;
}

/* ---------------- 工具栏 ---------------- */
.md-toolbar {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  border-bottom: 1px solid #f1f5f9;
  padding: 5px 10px;
  background: #fcfdff;
}

.md-toolbar-divider {
  height: 14px;
  width: 1px;
  margin: 0 4px;
  background: #e2e8f0;
}

.md-tool-btn {
  display: inline-flex;
  height: 26px;
  min-width: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 6px;
  color: #64748b;
  font-size: 11px;
  line-height: 1;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.md-tool-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.md-tool-btn:active {
  background: #e2e8f0;
}

.md-tool-btn.is-bold {
  font-weight: 700;
}

.md-tool-btn.is-italic {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
}

.md-tool-btn.is-strike {
  text-decoration: line-through;
}

.md-tool-btn.is-code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

:global(html.dark .md-toolbar) {
  border-color: #1e293b;
  background: #0b1220;
}

:global(html.dark .md-toolbar-divider) {
  background: #334155;
}

:global(html.dark .md-tool-btn) {
  color: #94a3b8;
}

:global(html.dark .md-tool-btn:hover) {
  background: #1e293b;
  color: #e2e8f0;
}

:global(html.dark .md-tool-btn:active) {
  background: #334155;
}
</style>
