<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.4)] transition-colors dark:border-slate-800 dark:bg-slate-900"
  >
    <!-- 面板头 -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white px-5 py-3.5 dark:border-slate-800 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900"
    >
      <div class="flex items-center gap-2.5">
        <span class="ai-avatar">
          <el-icon :size="15"><MagicStick /></el-icon>
        </span>
        <div class="leading-tight">
          <h2 class="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">
            AI 写作助手
          </h2>
          <p class="mt-0.5 text-[10.5px] text-slate-400 dark:text-slate-500">修改 · 重写正文</p>
        </div>
      </div>
      <span class="model-tag">
        <span class="model-dot" />
        {{ modelName }}
      </span>
    </header>

    <!-- 聊天消息区 -->
    <el-scrollbar ref="scrollRef" class="min-h-0 flex-1 bg-slate-50/30 dark:bg-slate-950/20">
      <div class="flex min-h-full flex-col gap-4 p-4">
        <!-- 还没聊过天：给几个快捷示例 -->
        <div
          v-if="!messages.length && !busy"
          class="flex flex-1 flex-col items-center justify-center px-3 py-8 text-center"
        >
          <span class="ai-avatar ai-avatar-lg">
            <el-icon :size="24"><MagicStick /></el-icon>
          </span>
          <p class="mt-3 text-[13px] font-medium text-slate-600 dark:text-slate-200">
            让 AI 帮你改文章
          </p>
          <p class="mt-1 text-[11px] leading-5 text-slate-400 dark:text-slate-500">
            「修改」保留原文结构，只是按你的要求调整；<br />
            「重写」会按新思路重写全文。
          </p>
          <div class="mt-4 flex w-full flex-col gap-2">
            <button
              v-for="item in suggestions"
              :key="item"
              type="button"
              class="suggestion-btn"
              @click="input = item"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <!-- 历史消息 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex gap-2"
          :class="message.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <span v-if="message.role === 'assistant'" class="ai-avatar shrink-0">
            <el-icon :size="13"><MagicStick /></el-icon>
          </span>
          <span v-else class="user-avatar shrink-0">我</span>

          <div class="min-w-0 max-w-[86%]">
            <div
              class="mb-1 flex items-center gap-1.5"
              :class="message.role === 'user' ? 'justify-end' : ''"
            >
              <span
                v-if="message.mode"
                class="mode-tag"
                :class="message.mode === 'rewrite' ? 'is-rewrite' : 'is-modify'"
              >
                {{ message.mode === 'rewrite' ? '重写' : '修改' }}
              </span>
              <span class="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                {{ message.time }}
              </span>
            </div>
            <div
              class="bubble"
              :class="message.role === 'user' ? 'bubble-user' : 'bubble-ai'"
            >
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- 正在生成：显示气泡 + 停止按钮 -->
        <div v-if="busy" class="flex gap-2">
          <span class="ai-avatar shrink-0">
            <el-icon :size="13"><MagicStick /></el-icon>
          </span>
          <div class="min-w-0 max-w-[86%]">
            <div class="mb-1 flex items-center gap-1.5">
              <span class="mode-tag" :class="mode === 'rewrite' ? 'is-rewrite' : 'is-modify'">
                {{ mode === 'rewrite' ? '重写' : '修改' }}
              </span>
            </div>
            <div class="bubble bubble-ai flex items-center gap-2">
              <span class="typing-dots"><i></i><i></i><i></i></span>
              <span class="text-[12px]">
                {{ mode === 'rewrite' ? '正在重写全文…' : '正在修改文章…' }}
              </span>
              <button type="button" class="stop-btn" @click="emit('stop')">停止</button>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <!-- 输入区 -->
    <footer
      class="shrink-0 border-t border-slate-100 bg-gradient-to-t from-slate-50/80 to-white p-3 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900"
    >
      <el-input
        v-model="input"
        class="ai-chat-input"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        resize="none"
        :disabled="busy"
        placeholder="描述想怎么改，比如：把第二段写得更口语化"
        @keydown.enter.exact.prevent="send('modify')"
      />
      <div class="mt-2 flex items-center justify-between gap-2">
        <span class="text-[10px] text-slate-400 dark:text-slate-500">
          Enter 发送修改 · Shift + Enter 换行
        </span>
        <div class="chat-actions flex shrink-0 gap-2">
          <el-button
            size="small"
            type="primary"
            :disabled="!input.trim() || busy"
            @click="send('modify')"
          >
            <el-icon class="mr-1"><EditPen /></el-icon>修改
          </el-button>
          <el-button
            size="small"
            type="warning"
            plain
            :disabled="!input.trim() || busy"
            @click="send('rewrite')"
          >
            <el-icon class="mr-1"><RefreshLeft /></el-icon>重写
          </el-button>
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { EditPen, MagicStick, RefreshLeft } from '@element-plus/icons-vue'
import type { AiChatMessage } from './types'

const props = defineProps<{
  messages: AiChatMessage[]
  busy: boolean
  mode: 'modify' | 'rewrite' | null
}>()

const emit = defineEmits<{
  send: [payload: { mode: 'modify' | 'rewrite'; text: string }]
  stop: []
}>()

// 界面上展示的模型名；实际模型在 .env 的 DEEPSEEK_MODEL 里配置
const modelName = 'DeepSeek Flash'
const input = ref('')
const scrollRef = ref<{ setScrollTop: (offset: number) => void }>()

const suggestions = [
  '把开头写得更吸引人一些',
  '把全文语气改得更口语化',
  '给每个小节补充一个例子',
]

function send(mode: 'modify' | 'rewrite') {
  const text = input.value.trim()
  if (!text || props.busy) return
  emit('send', { mode, text })
  input.value = ''
  scrollToBottom()
}

// 新消息 / 开始生成时滚到底部
watch(
  () => [props.messages.length, props.busy],
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

function scrollToBottom() {
  nextTick(() => scrollRef.value?.setScrollTop(999999))
}
</script>

<style scoped>
/* 头像 */
.ai-avatar {
  display: inline-flex;
  height: 28px;
  width: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #818cf8, #2563eb);
  color: #fff;
  box-shadow: 0 6px 14px -8px rgba(37, 99, 235, 0.8);
}

.ai-avatar-lg {
  height: 52px;
  width: 52px;
  border-radius: 16px;
  box-shadow:
    0 14px 34px -16px rgba(79, 70, 229, 0.85),
    0 0 0 6px rgba(99, 102, 241, 0.08);
}

.user-avatar {
  display: inline-flex;
  height: 26px;
  width: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}

:global(html.dark .user-avatar) {
  background: #334155;
  color: #cbd5e1;
}

.model-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 3px 9px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.model-dot {
  height: 5px;
  width: 5px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.16);
}

:global(html.dark .model-tag) {
  background: rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
}

/* 修改 / 重写的彩色小标签 */
.mode-tag {
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 500;
}

.mode-tag.is-modify {
  background: #f0f9ff;
  color: #0284c7;
}

.mode-tag.is-rewrite {
  background: #fffbeb;
  color: #d97706;
}

:global(html.dark .mode-tag.is-modify) {
  background: rgba(2, 132, 199, 0.18);
  color: #7dd3fc;
}

:global(html.dark .mode-tag.is-rewrite) {
  background: rgba(217, 119, 6, 0.18);
  color: #fcd34d;
}

/* 气泡 */
.bubble {
  border-radius: 13px;
  padding: 9px 12px;
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-user {
  border-top-right-radius: 3px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #fff;
  box-shadow: 0 8px 18px -14px rgba(37, 99, 235, 0.9);
}

.bubble-ai {
  border: 1px solid #e2e8f0;
  border-top-left-radius: 3px;
  background: #fff;
  color: #475569;
  box-shadow: 0 2px 6px -4px rgba(15, 23, 42, 0.18);
}

:global(html.dark .bubble-ai) {
  border-color: #334155;
  background: #1e293b;
  color: #cbd5e1;
}

/* 快捷示例 */
.suggestion-btn {
  width: 100%;
  border: 1px dashed #cbd5e1;
  border-radius: 9px;
  padding: 7px 10px;
  background: transparent;
  color: #64748b;
  font-size: 11.5px;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.suggestion-btn:hover {
  border-color: #7dd3fc;
  background: #f0f9ff;
  color: #0284c7;
}

:global(html.dark .suggestion-btn) {
  border-color: #334155;
  color: #94a3b8;
}

:global(html.dark .suggestion-btn:hover) {
  border-color: #0369a1;
  background: rgba(2, 132, 199, 0.12);
  color: #7dd3fc;
}

/* 输入中动画 */
.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.typing-dots i {
  height: 4px;
  width: 4px;
  border-radius: 999px;
  background: #818cf8;
  animation: typing-bounce 1s ease-in-out infinite;
}

.typing-dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

.stop-btn {
  margin-left: auto;
  border: none;
  border-radius: 5px;
  padding: 2px 7px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 10.5px;
  transition: background-color 0.2s ease;
}

.stop-btn:hover {
  background: #fecaca;
}

:global(html.dark .stop-btn) {
  background: rgba(220, 38, 38, 0.18);
  color: #fca5a5;
}

/* 相邻按钮的默认左边距会和 flex gap 叠加，导致两个按钮不在同一视觉间距上 */
.chat-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

/* 输入框在暗色下的底色 */
.ai-chat-input {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-text-color-regular: #475569;
  --el-text-color-placeholder: #94a3b8;
}

:global(html.dark .ai-chat-input) {
  --el-input-bg-color: #0b1220;
  --el-input-border-color: #334155;
  --el-text-color-regular: #cbd5e1;
  --el-text-color-placeholder: #64748b;
}
</style>
