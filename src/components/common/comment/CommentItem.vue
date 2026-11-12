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
          <button
            type="button"
            class="comment-action"
            @click="openReply({ id: comment.id, name: comment.uname })"
          >
            回复
          </button>
          <span v-if="comment.replies.length" class="text-[12px] text-gray-400 dark:text-gray-500">
            {{ comment.replies.length }} 条回复
          </span>
        </div>

        <!-- 游客回复成功：回复进入待审核，给个明确提示 -->
        <p v-if="replyNotice" class="reply-notice" role="status">{{ replyNotice }}</p>

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
        <form v-if="replyOpen" class="reply-box mt-3" novalidate @submit.prevent="submitReply">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="reply-target"
              >回复 <b>@{{ replyTargetName }}</b></span
            >

            <!-- 博主 / 已经留过身份的游客：直接显示当前身份，不再重复输入 -->
            <span v-if="profile.uname" class="reply-as">
              <CommentAvatar
                :name="profile.uname"
                :src="profile.avatar"
                :size="20"
                class="reply-as-avatar"
              />
              以 <b>{{ profile.uname }}</b> 的身份{{ profile.isOwner ? '（博主）' : '' }}回复
            </span>
          </div>

          <!-- 第一次回复的游客需要留下昵称和邮箱；邮箱用来决定头像 -->
          <div v-if="!profile.uname" class="reply-identity mb-2">
            <input
              v-model.trim="replyName"
              type="text"
              autocomplete="nickname"
              maxlength="30"
              placeholder="你的昵称"
              class="reply-name-input"
              :class="{ 'is-invalid': nameTouched && !replyName }"
              @blur="nameTouched = true"
            />
            <input
              v-model.trim="replyEmail"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="邮箱（用于头像）"
              class="reply-name-input reply-email-input"
              :class="{ 'is-invalid': emailTouched && !emailCheck.ok }"
              @blur="emailTouched = true"
            />
          </div>

          <p v-if="!profile.uname && nameTouched && !replyName" class="reply-error">填一下昵称吧</p>
          <p v-else-if="!profile.uname && emailTouched && !emailCheck.ok" class="reply-error">
            {{ emailCheck.message }}
          </p>
          <p v-else-if="!profile.uname && emailCheck.qq" class="reply-hint">
            已识别 QQ {{ emailCheck.qq }}，会使用 QQ 头像
          </p>

          <textarea
            ref="replyTextarea"
            v-model="replyContent"
            rows="3"
            maxlength="500"
            :disabled="sending"
            aria-label="回复内容"
            placeholder="说点什么……"
            class="reply-textarea"
          ></textarea>

          <p v-if="replyError" class="reply-error reply-server-error" role="alert">
            {{ replyError }}
          </p>

          <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
                {{ replyContent.length }} / 500
              </span>
              <span v-if="!profile.isOwner" class="reply-review-hint">审核通过后展示</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="reply-btn reply-btn-ghost"
                :disabled="sending"
                @click="closeReply"
              >
                取消
              </button>
              <button type="submit" class="reply-btn" :disabled="!canSubmit">
                {{ sending ? '发送中…' : '回复' }}
              </button>
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
import { validateCommentEmail } from '@/utils/comment'
import CommentAvatar from './CommentAvatar.vue'
import CommentReply from './CommentReply.vue'

const props = defineProps<CommentItemProps>()

type ReplyDone = (ok: boolean, message?: string) => void

const emit = defineEmits<{
  submitReply: [payload: CommentReplyPayload, done: ReplyDone]
}>()

interface ReplyTarget {
  id: string
  name: string
}

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
const replyTargetId = ref('')
const replyTargetName = ref('')
const replyContent = ref('')
const replyName = ref('')
const replyEmail = ref('')
const replyTextarea = ref<HTMLTextAreaElement | null>(null)
const sending = ref(false)
const replyError = ref('')
const replyNotice = ref('')
const nameTouched = ref(false)
const emailTouched = ref(false)

const emailCheck = computed(() => validateCommentEmail(replyEmail.value))

const canSubmit = computed(() => {
  if (sending.value || !replyContent.value.trim()) return false
  if (props.profile.uname) return true
  return Boolean(replyName.value.trim()) && emailCheck.value.ok
})

function openReply(target: ReplyTarget) {
  replyTargetId.value = target.id
  replyTargetName.value = target.name
  replyError.value = ''
  replyNotice.value = ''
  nameTouched.value = false
  emailTouched.value = false
  replyOpen.value = true
  nextTick(() => replyTextarea.value?.focus())
}

function closeReply() {
  replyOpen.value = false
  replyContent.value = ''
  replyError.value = ''
  nameTouched.value = false
  emailTouched.value = false
}

function submitReply() {
  nameTouched.value = true
  emailTouched.value = true

  const content = replyContent.value.trim()
  if (!content) return

  // 已经留过身份（顶部发过评论 / 回复过）就直接沿用，否则必须有昵称和合法邮箱
  if (!props.profile.uname && !emailCheck.value.ok) return

  const uname = props.profile.uname || replyName.value.trim()
  if (!uname) return

  const uemail = props.profile.uname ? (props.profile.uemail ?? '') : replyEmail.value.trim()

  sending.value = true
  replyError.value = ''

  emit(
    'submitReply',
    {
      parentId: props.comment.id,
      uname,
      uemail,
      ulink: props.profile.ulink,
      content,
      replyTo: replyTargetName.value || undefined,
      replyToId: replyTargetId.value || props.comment.id,
    },
    (ok, message) => {
      sending.value = false
      if (!ok) {
        replyError.value = message || '回复失败了，稍后再试试'
        return
      }
      replyContent.value = ''
      replyOpen.value = false
      replyError.value = ''
      replyNotice.value = message ?? ''
    },
  )
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
  padding: 1px 7px;
  border-radius: 999px;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.comment-action:hover {
  background: #f1f7ff;
  color: #3f74ad;
}

.dark .comment-action {
  color: #64748b;
}

.dark .comment-action:hover {
  background: rgba(56, 189, 248, 0.08);
  color: #8ecbff;
}

.reply-panel {
  padding: 12px 14px;
  border: 1px solid #e8f0f9;
  border-left: 2px solid #cfe3f6;
  border-radius: 0 12px 12px 0;
  background: linear-gradient(180deg, #fbfdff 0%, #f7fafc 100%);
}

.dark .reply-panel {
  border-color: rgba(51, 65, 85, 0.65);
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
  box-shadow: 0 10px 24px -26px rgba(47, 74, 119, 0.55);
}

.dark .reply-box {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.4);
  box-shadow: 0 12px 26px -26px rgba(0, 0, 0, 0.8);
}

.reply-target,
.reply-as {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.reply-as-avatar {
  display: inline-flex;
}

.reply-identity {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.reply-name-input::placeholder {
  color: #9ca3af;
}

.reply-name-input:focus {
  border-color: #5fa6dd;
  box-shadow: 0 0 0 3px rgba(95, 166, 221, 0.12);
}

.reply-name-input.is-invalid {
  border-color: #fca5a5;
}

.reply-email-input {
  width: 170px;
}

.dark .reply-name-input {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.45);
  color: #e2e8f0;
}

.dark .reply-name-input::placeholder {
  color: #64748b;
}

.dark .reply-name-input:focus {
  border-color: #8ecbff;
  box-shadow: 0 0 0 3px rgba(95, 166, 221, 0.14);
}

.dark .reply-name-input.is-invalid {
  border-color: #f87171;
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

.reply-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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

.reply-error,
.reply-hint {
  display: block;
  margin-top: 5px;
  font-family: 'huoxie', sans-serif;
  font-size: 11.5px;
  line-height: 1.5;
}

.reply-error {
  color: #dc2626;
}

.reply-hint {
  color: #0f766e;
}

.reply-server-error {
  margin-top: 8px;
  padding: 6px 9px 6px 11px;
  border-left: 3px solid rgba(220, 38, 38, 0.4);
  border-radius: 7px;
  background: rgba(254, 226, 226, 0.7);
}

.dark .reply-error {
  color: #fca5a5;
}

.dark .reply-hint {
  color: #5eead4;
}

.dark .reply-server-error {
  background: rgba(127, 29, 29, 0.22);
}

.reply-notice {
  margin-top: 8px;
  padding: 6px 9px 6px 11px;
  border-left: 3px solid rgba(16, 185, 129, 0.4);
  border-radius: 7px;
  background: rgba(236, 253, 245, 0.85);
  color: #047857;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  line-height: 1.6;
}

.dark .reply-notice {
  border-left-color: rgba(52, 211, 153, 0.45);
  background: rgba(6, 78, 59, 0.28);
  color: #6ee7b7;
}

.reply-review-hint {
  padding: 0 6px;
  border-radius: 999px;
  background: #eef4fb;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  line-height: 17px;
}

.dark .reply-review-hint {
  background: rgba(95, 166, 221, 0.14);
  color: #bfdbfe;
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

.reply-btn:focus-visible {
  outline: 2px solid #8ecbff;
  outline-offset: 2px;
}

.reply-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

@media (max-width: 420px) {
  .reply-identity {
    flex-direction: column;
  }

  .reply-name-input,
  .reply-email-input {
    width: 100%;
  }
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
