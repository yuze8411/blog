<template>
  <article class="comment-thread">
    <div class="flex gap-3">
      <CommentAvatar :name="comment.uname" :src="comment.avatar" :size="40" />

      <div class="min-w-0 flex-1">
        <!-- 一级评论头部 -->
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            v-if="comment.ulink"
            :href="comment.ulink"
            target="_blank"
            rel="noopener noreferrer"
            class="comment-name transition-colors hover:text-[#3f74ad] dark:hover:text-[#8ecbff]"
          >
            {{ comment.uname }}
          </a>
          <span v-else class="comment-name">{{ comment.uname }}</span>

          <span v-if="comment.isAuthor" class="comment-badge">博主</span>
          <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ comment.time }}</span>
        </div>

        <p
          class="mt-1 whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-600 dark:text-gray-300"
        >
          {{ comment.content }}
        </p>

        <div class="mt-1.5 flex items-center gap-3">
          <button type="button" class="comment-action" @click="openReply(comment.uname)">
            回复
          </button>
          <span v-if="comment.replies.length" class="text-[12px] text-gray-400 dark:text-gray-500">
            {{ comment.replies.length }} 条回复
          </span>
        </div>

        <!-- 二级评论：每次最多展示 10 条 -->
        <div v-if="comment.replies.length" class="reply-panel mt-3 space-y-3">
          <CommentReply
            v-for="reply of pagedReplies"
            :key="reply.id"
            :reply="reply"
            @reply="openReply"
          />

          <div v-if="replyPageCount > 1" class="reply-pager">
            <button
              type="button"
              class="reply-pager-btn"
              :disabled="replyPage === 1"
              @click="replyPage -= 1"
            >
              上一页
            </button>
            <span class="tabular-nums">{{ replyPage }} / {{ replyPageCount }}</span>
            <button
              type="button"
              class="reply-pager-btn"
              :disabled="replyPage === replyPageCount"
              @click="replyPage += 1"
            >
              下一页
            </button>
          </div>
        </div>

        <!-- 回复框：无论回复一级还是二级，最终都写进同一个 replies 数组 -->
        <form v-if="replyOpen" class="reply-box mt-3" @submit.prevent="submitReply">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="reply-target">回复 <b>@{{ replyTarget }}</b></span>

            <input
              v-if="!profile.uname"
              v-model.trim="replyName"
              type="text"
              maxlength="20"
              placeholder="你的昵称"
              class="reply-name-input"
            />
            <span v-else class="reply-as">
              以 <b>{{ profile.uname }}</b> 的身份回复
            </span>
          </div>

          <textarea
            ref="replyTextarea"
            v-model="replyContent"
            rows="3"
            maxlength="500"
            aria-label="回复内容"
            placeholder="说点什么……"
            class="reply-textarea"
          ></textarea>

          <div class="mt-2 flex items-center justify-between gap-2">
            <span class="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
              {{ replyContent.length }} / 500
            </span>
            <div class="flex items-center gap-2">
              <button type="button" class="reply-btn reply-btn-ghost" @click="closeReply">
                取消
              </button>
              <button type="submit" class="reply-btn" :disabled="!canSubmit">回复</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { CommentItemProps, CommentReplyPayload } from '@/types'
import CommentAvatar from './CommentAvatar.vue'
import CommentReply from './CommentReply.vue'

const props = defineProps<CommentItemProps>()

const emit = defineEmits<{
  submitReply: [payload: CommentReplyPayload]
}>()

// 二级评论分页：和一级评论一样，每页最多 10 条
const REPLY_PAGE_SIZE = 10
const replyPage = ref(1)

const replyPageCount = computed(() =>
  Math.max(1, Math.ceil(props.comment.replies.length / REPLY_PAGE_SIZE)),
)

const pagedReplies = computed(() => {
  const start = (replyPage.value - 1) * REPLY_PAGE_SIZE
  return props.comment.replies.slice(start, start + REPLY_PAGE_SIZE)
})

// 新增回复后自动翻到最后一页，保证刚发出的回复能立刻看到
watch(
  () => props.comment.replies.length,
  (length, oldLength) => {
    if (length > oldLength) replyPage.value = Math.ceil(length / REPLY_PAGE_SIZE)
  },
)

const replyOpen = ref(false)
const replyTarget = ref('')
const replyContent = ref('')
const replyName = ref('')
const replyTextarea = ref<HTMLTextAreaElement | null>(null)

const canSubmit = computed(
  () => replyContent.value.trim().length > 0 && Boolean(props.profile.uname || replyName.value.trim()),
)

function openReply(name: string) {
  replyTarget.value = name
  replyOpen.value = true
  nextTick(() => replyTextarea.value?.focus())
}

function closeReply() {
  replyOpen.value = false
  replyContent.value = ''
}

function submitReply() {
  const content = replyContent.value.trim()
  if (!content) return

  const uname = props.profile.uname || replyName.value.trim()
  if (!uname) return

  emit('submitReply', {
    parentId: props.comment.id,
    uname,
    uemail: props.profile.uemail,
    ulink: props.profile.ulink,
    content,
    replyTo: replyTarget.value || undefined,
  })

  replyContent.value = ''
  replyOpen.value = false
}
</script>

<style scoped>
.comment-name {
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  color: #334155;
}

.dark .comment-name {
  color: #e2e8f0;
}

.comment-badge {
  padding: 0 7px;
  border-radius: 999px;
  background: #eef4fb;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  line-height: 18px;
}

.dark .comment-badge {
  background: rgba(95, 166, 221, 0.14);
  color: #bfdbfe;
}

.comment-action {
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.comment-action:hover {
  color: #3f74ad;
}

.dark .comment-action {
  color: #64748b;
}

.dark .comment-action:hover {
  color: #8ecbff;
}

.reply-panel {
  padding: 12px 14px;
  border-left: 2px solid #d8e7f5;
  border-radius: 0 12px 12px 0;
  background: #f8fafc;
}

.dark .reply-panel {
  border-left-color: #334155;
  background: rgba(148, 163, 184, 0.05);
}

.reply-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  color: #94a3b8;
}

.reply-pager-btn {
  padding: 2px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  color: #64748b;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.reply-pager-btn:hover:not(:disabled) {
  border-color: #5fa6dd;
  background: #f1f5f9;
  color: #3f74ad;
}

.reply-pager-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.dark .reply-pager {
  color: #64748b;
}

.dark .reply-pager-btn {
  border-color: #334155;
  color: #94a3b8;
}

.dark .reply-pager-btn:hover:not(:disabled) {
  border-color: #8ecbff;
  background: #1e293b;
  color: #8ecbff;
}

.reply-box {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.dark .reply-box {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.4);
}

.reply-target,
.reply-as {
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  color: #64748b;
}

.dark .reply-target,
.dark .reply-as {
  color: #94a3b8;
}

.reply-target b,
.reply-as b {
  font-weight: normal;
  color: #3f74ad;
}

.dark .reply-target b,
.dark .reply-as b {
  color: #9ecfff;
}

.reply-name-input {
  width: 140px;
  padding: 3px 9px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  outline: none;
  background: #fff;
  color: #334155;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.reply-name-input:focus {
  border-color: #5fa6dd;
  box-shadow: 0 0 0 3px rgba(95, 166, 221, 0.12);
}

.dark .reply-name-input {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.45);
  color: #e2e8f0;
}

.reply-textarea {
  display: block;
  width: 100%;
  min-height: 78px;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  outline: none;
  resize: none;
  background: #fff;
  color: #334155;
  font-family: 'huoxie', sans-serif;
  font-size: 14px;
  line-height: 1.7;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.reply-textarea::placeholder {
  color: #9ca3af;
}

.reply-textarea:focus {
  border-color: #5fa6dd;
  box-shadow: 0 0 0 3px rgba(95, 166, 221, 0.12);
}

.dark .reply-textarea {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.45);
  color: #e2e8f0;
}

.dark .reply-textarea::placeholder {
  color: #64748b;
}

.dark .reply-textarea:focus {
  border-color: #8ecbff;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 3px rgba(95, 166, 221, 0.14);
}

.reply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3f74ad, #6c7fc4);
  color: #fff;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  letter-spacing: 0.06em;
  box-shadow: 0 4px 10px -8px rgba(63, 116, 173, 0.7);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.reply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -8px rgba(63, 116, 173, 0.8);
}

.reply-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.reply-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

.reply-btn-ghost {
  border: 1px solid #dbe7f4;
  background: transparent;
  color: #64748b;
  box-shadow: none;
}

.reply-btn-ghost:hover:not(:disabled) {
  border-color: #5fa6dd;
  color: #3f74ad;
}

.dark .reply-btn-ghost {
  border-color: #334155;
  background: transparent;
  color: #94a3b8;
}

.dark .reply-btn-ghost:hover:not(:disabled) {
  border-color: #8ecbff;
  color: #8ecbff;
}
</style>
