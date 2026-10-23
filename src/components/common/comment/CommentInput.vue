<template>
  <form class="comment-card mt-3" @submit.prevent="handleSubmit">
    <!-- 标题 -->
    <div class="flex items-center gap-2">
      <p class="font-[huoxie] text-[17px] tracking-[1px] text-gray-800 dark:text-gray-100">
        发表评论
      </p>
      <span class="ml-auto hidden text-[12px] text-gray-400 dark:text-gray-500 sm:block">
        邮箱仅用于显示头像，不会公开
      </span>
    </div>

    <!-- 昵称 / 邮箱 / 链接 -->
    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label class="block" for="uname">
        <span class="comment-label">咕名<span class="comment-required">*</span></span>
        <input
          id="uname"
          v-model.trim="comment.uname"
          type="text"
          autocomplete="nickname"
          placeholder="你的昵称"
          class="comment-field"
        />
      </label>

      <label class="block" for="uemail">
        <span class="comment-label">邮箱<span class="comment-required">*</span></span>
        <input
          id="uemail"
          v-model.trim="comment.uemail"
          type="email"
          autocomplete="email"
          placeholder="你的邮箱"
          class="comment-field"
        />
      </label>

      <label class="block" for="ulink">
        <span class="comment-label">链接</span>
        <input
          id="ulink"
          v-model.trim="comment.ulink"
          type="url"
          autocomplete="url"
          placeholder="你的友链（选填）"
          class="comment-field"
        />
      </label>
    </div>

    <!-- 评论内容 -->
    <div class="mt-3">
      <textarea
        id="ucontent"
        v-model="comment.content"
        rows="5"
        aria-label="评论内容"
        placeholder="快点咕咕，不然让你变成黄焖咕咕、炸咕咕、地锅咕咕……"
        class="comment-field comment-textarea"
      ></textarea>
    </div>

    <!-- 底部：字数 + 提交 -->
    <div class="mt-3 flex items-center justify-between gap-3">
      <span class="text-[12px] tabular-nums text-gray-400 dark:text-gray-500">
        {{ comment.content.length }} 字
      </span>
      <button type="submit" class="comment-submit" :disabled="!comment.content.trim()">
        发表评论
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { CommentFormPayload } from '@/types'

const emit = defineEmits<{
  submit: [payload: CommentFormPayload]
}>()

const comment = reactive({
  uname: '',
  uemail: '',
  ulink: '',
  content: '',
})

function handleSubmit() {
  const content = comment.content.trim()
  if (!content) return
  emit('submit', { ...comment, content })
}

// 提交成功后由父组件调用，只清空内容，昵称/邮箱留着方便下次评论
function reset() {
  comment.content = ''
}

defineExpose({ reset })
</script>

<style scoped>
.comment-card {
  --cf-field-bg: #fff;
  --cf-field-border: #e2e8f0;
  --cf-field-hover: #cbdff2;
  --cf-field-focus: #5fa6dd;
  --cf-ring: rgba(95, 166, 221, 0.14);
  --cf-text: #334155;
  --cf-placeholder: #9ca3af;

  width: 100%;
  padding: 1rem 1.15rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fbff;
}

.dark .comment-card {
  --cf-field-bg: rgba(15, 23, 42, 0.45);
  --cf-field-border: #334155;
  --cf-field-hover: #3f5a7a;
  --cf-field-focus: #8ecbff;
  --cf-ring: rgba(95, 166, 221, 0.16);
  --cf-text: #e2e8f0;
  --cf-placeholder: #64748b;

  border-color: #334155;
  background: rgba(17, 24, 39, 0.55);
}

.comment-title-bar {
  width: 3px;
  height: 15px;
  border-radius: 999px;
  background: #3f74ad;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 5px;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: #64748b;
}

.dark .comment-label {
  color: #94a3b8;
}

.comment-required {
  color: #f87171;
}

.comment-field {
  display: block;
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--cf-field-border);
  border-radius: 9px;
  outline: none;
  background: var(--cf-field-bg);
  color: var(--cf-text);
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.comment-field::placeholder {
  color: var(--cf-placeholder);
}

.comment-field:hover {
  border-color: var(--cf-field-hover);
}

.comment-field:focus {
  border-color: var(--cf-field-focus);
  box-shadow: 0 0 0 3px var(--cf-ring);
}

.comment-textarea {
  min-height: 132px;
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 1.75;
  resize: none;
}

.comment-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3f74ad, #6c7fc4);
  color: #fff;
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  letter-spacing: 0.08em;
  box-shadow: 0 6px 14px -10px rgba(63, 116, 173, 0.7);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.comment-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -10px rgba(63, 116, 173, 0.8);
}

.comment-submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.comment-submit:focus-visible {
  outline: 2px solid #8ecbff;
  outline-offset: 2px;
}

.comment-submit:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}
</style>
