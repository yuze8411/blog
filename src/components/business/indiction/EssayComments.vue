<template>
  <section class="essay-comments" aria-label="随笔评论">
    <header class="essay-comments-head">
      <div class="flex items-center gap-2">
        <span class="essay-comments-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M3.5 3.75A1.75 1.75 0 0 1 5.25 2h9.5A1.75 1.75 0 0 1 16.5 3.75v7.5A1.75 1.75 0 0 1 14.75 13H9.06l-3.2 2.77A.75.75 0 0 1 4.67 15.2V13h-.92A1.75 1.75 0 0 1 2 11.25v-7.5A1.75 1.75 0 0 1 3.5 3.75Z"
            />
          </svg>
        </span>
        <h3 class="essay-comments-title">评论</h3>
        <span class="essay-comments-count">{{ comments.length }}</span>
      </div>

      <button
        type="button"
        class="essay-comments-refresh"
        :class="{ 'is-loading': loading }"
        :disabled="loading"
        title="刷新评论"
        aria-label="刷新评论"
        @click="loadComments"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
          />
        </svg>
      </button>
    </header>

    <!-- 评论列表 -->
    <div v-if="loading && !loaded" class="essay-comment-state">正在加载评论…</div>
    <div v-else-if="error && !loaded" class="essay-comment-state is-error">
      <span>{{ error }}</span>
      <button type="button" @click="loadComments">重试</button>
    </div>
    <div v-else-if="!comments.length" class="essay-comment-empty">
      还没有评论，来留下第一句话吧。
    </div>
    <div v-else class="essay-comment-list">
      <div v-if="error" class="essay-comment-inline-error">
        <span>{{ error }}</span>
        <button type="button" @click="loadComments">重试</button>
      </div>

      <article v-for="item in comments" :key="item.id" class="essay-comment-item">
        <CommentAvatar
          :name="item.nickname"
          :src="item.avatarUrl || (item.isOwner ? ownerFallbackAvatar : undefined)"
          :size="31"
        />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              v-if="item.websiteUrl"
              :href="item.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="essay-comment-name is-link"
            >
              {{ item.nickname }}
            </a>
            <span v-else class="essay-comment-name">{{ item.nickname }}</span>
            <span v-if="item.isOwner" class="essay-comment-owner">博主</span>
            <time class="essay-comment-time">{{ formatDate(item.createdAt) }}</time>
          </div>
          <p class="essay-comment-content">{{ item.content }}</p>
        </div>
      </article>
    </div>

    <!-- 评论输入 -->
    <form class="essay-comment-form" novalidate @submit.prevent="submit">
      <div v-if="!identityReady" class="essay-comment-identity">正在确认身份…</div>

      <div v-else-if="isBlogger" class="essay-comment-owner-tip">
        <span class="essay-comment-owner">博主</span>
        以 {{ ownerName }} 的身份评论
      </div>

      <div v-else class="essay-comment-fields">
        <label class="essay-comment-field">
          <span>昵称</span>
          <input
            v-model.trim="form.nickname"
            type="text"
            maxlength="30"
            autocomplete="nickname"
            placeholder="你的昵称"
          />
        </label>
        <label class="essay-comment-field">
          <span>邮箱</span>
          <input
            v-model.trim="form.email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="用于显示头像"
            :class="{ 'is-invalid': emailTouched && !emailCheck.ok }"
            @blur="emailTouched = true"
          />
          <span v-if="emailTouched && !emailCheck.ok" class="essay-comment-field-error">
            {{ emailCheck.message }}
          </span>
        </label>
      </div>

      <textarea
        v-model="form.content"
        class="essay-comment-textarea"
        rows="3"
        maxlength="1000"
        :disabled="submitting"
        placeholder="写点什么吧…"
        aria-label="评论内容"
      ></textarea>

      <div class="essay-comment-form-foot">
        <div class="min-w-0 text-[11px]">
          <span v-if="formError" class="essay-comment-error" role="alert">{{ formError }}</span>
          <span v-else-if="formNotice" class="essay-comment-notice" role="status">
            {{ formNotice }}
          </span>
          <span v-else class="essay-comment-hint">
            {{ isBlogger ? '友善发言，博主评论会直接展示' : '友善发言，审核通过后展示' }}
          </span>
        </div>
        <button type="submit" class="essay-comment-submit" :disabled="!canSubmit || submitting">
          <span v-if="submitting" class="essay-comment-spinner" aria-hidden="true"></span>
          {{ submitting ? '发送中…' : '发表评论' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getSessionUser, isOwner } from '@/api/auth'
import type { AdminUser } from '@/api/auth'
import ownerFallbackAvatar from '@/assets/images/mycover.jpg'
import {
  createEssayComment,
  essayCommentErrorMessage,
  fetchEssayComments,
} from '@/api/essayComments'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import type { EssayComment } from '@/types'
import { avatarFromEmail, validateCommentEmail } from '@/utils/comment'
import { formatDate } from '@/utils/date'
import { essayCommentGuestProfile } from '@/utils/essayCommentProfile'

const props = defineProps<{
  essayId: string
}>()

const emit = defineEmits<{
  countChange: [count: number]
}>()

const comments = ref<EssayComment[]>([])
const loading = ref(true)
const loaded = ref(false)
const error = ref('')

const viewer = ref<AdminUser | null>(null)
const identityReady = ref(false)
let identityPromise: Promise<void> | null = null

const isBlogger = computed(() => isOwner(viewer.value))
const ownerName = computed(() => {
  const name = viewer.value?.name.trim() ?? ''
  const emailPrefix = viewer.value?.email.split('@')[0] ?? ''
  return name && name !== emailPrefix ? name : '雨落千山'
})
const ownerAvatar = computed(() => viewer.value?.avatarUrl || null)
const ownerAvatarForSave = computed(() => {
  const url = ownerAvatar.value ?? ''
  return /^https?:\/\//i.test(url) ? url : null
})

const form = reactive({
  nickname: essayCommentGuestProfile.nickname,
  email: essayCommentGuestProfile.email,
  content: '',
})
const emailTouched = ref(false)
const submitting = ref(false)
const formError = ref('')
const formNotice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | undefined

const emailCheck = computed(() => validateCommentEmail(form.email))
const canSubmit = computed(() => {
  if (submitting.value || !form.content.trim()) return false
  if (isBlogger.value) return true
  return Boolean(form.nickname.trim()) && emailCheck.value.ok
})

// 开始重新输入时，把上一次的错误 / 成功提示收起来
watch(
  () => [form.nickname, form.email, form.content],
  ([, , content]) => {
    formError.value = ''
    if (content) {
      formNotice.value = ''
      clearTimeout(noticeTimer)
    }
  },
)

function ensureIdentity(): Promise<void> {
  if (identityReady.value) return Promise.resolve()
  if (!identityPromise) {
    identityPromise = (async () => {
      try {
        viewer.value = await getSessionUser()
      } catch (err) {
        console.warn('[essayComments] 读取登录状态失败', err)
      } finally {
        identityReady.value = true
      }
    })()
  }
  return identityPromise
}

async function loadComments() {
  loading.value = true
  error.value = ''

  try {
    const rows = await fetchEssayComments(props.essayId)
    comments.value = rows
    loaded.value = true
    emit('countChange', rows.length)
  } catch (err) {
    console.error('[essayComments] 加载评论失败', err)
    error.value = '评论暂时加载不出来'
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!canSubmit.value) {
    emailTouched.value = true
    if (!form.nickname.trim()) formError.value = '填一下昵称吧'
    else if (!emailCheck.value.ok) formError.value = emailCheck.value.message
    return
  }

  await ensureIdentity()
  submitting.value = true
  formError.value = ''
  formNotice.value = ''

  try {
    const status = await createEssayComment({
      essayId: props.essayId,
      nickname: isBlogger.value ? ownerName.value : form.nickname,
      avatarUrl: isBlogger.value ? ownerAvatarForSave.value : (avatarFromEmail(form.email) ?? null),
      websiteUrl: null,
      content: form.content,
    })

    if (!isBlogger.value) {
      essayCommentGuestProfile.nickname = form.nickname
      essayCommentGuestProfile.email = form.email
    }

    form.content = ''
    formNotice.value = status === 'pending' ? '评论已提交，审核通过后就会出现在这里' : '评论已发表'
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      formNotice.value = ''
    }, 3600)

    // 待审核评论不会立刻出现在公开列表里，不需要重新拉取
    if (status === 'approved') await loadComments()
  } catch (err) {
    console.error('[essayComments] 发表评论失败', err)
    formError.value = essayCommentErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

// 切换随笔时重新加载；组件本身只在用户展开评论时才创建，所以是懒加载
watch(
  () => props.essayId,
  () => {
    comments.value = []
    loaded.value = false
    formError.value = ''
    formNotice.value = ''
    void loadComments()
  },
  { immediate: true },
)

onMounted(() => {
  void ensureIdentity()
})
</script>

<style scoped>
.essay-comments {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--accent-line, #dfeaf4);
}

.essay-comments-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.essay-comments-icon {
  display: grid;
  height: 24px;
  width: 24px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent-soft, #eef7fd);
  color: var(--accent-strong, #3f719b);
}

.essay-comments-icon svg {
  height: 13px;
  width: 13px;
}

.essay-comments-title {
  color: #475569;
  font-family: 'huoxie', sans-serif;
  font-size: 16px;
  letter-spacing: 0.06em;
}

.essay-comments-count {
  border-radius: 999px;
  padding: 0 7px;
  background: var(--accent-soft, #eef7fd);
  color: var(--accent-strong, #3f719b);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
}

.essay-comments-refresh {
  display: grid;
  height: 26px;
  width: 26px;
  place-items: center;
  border: 1px solid var(--accent-line, #dfeaf4);
  border-radius: 8px;
  background: #fff;
  color: #94a3b8;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.essay-comments-refresh svg {
  height: 12px;
  width: 12px;
}

.essay-comments-refresh:hover:not(:disabled) {
  background: var(--accent-soft, #eef7fd);
  color: var(--accent-strong, #3f719b);
}

.essay-comments-refresh.is-loading svg {
  animation: essay-comment-spin 0.8s linear infinite;
}

.essay-comment-state,
.essay-comment-empty {
  margin-top: 10px;
  border: 1px dashed #e2eaf3;
  border-radius: 10px;
  padding: 15px;
  background: #fbfdff;
  color: #94a3b8;
  font-size: 12.5px;
  text-align: center;
}

.essay-comment-state.is-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #b45309;
}

.essay-comment-state button,
.essay-comment-inline-error button {
  border: 1px solid #dbe7f4;
  border-radius: 999px;
  padding: 2px 10px;
  background: #fff;
  color: var(--accent-strong, #3f719b);
  font-size: 11.5px;
}

.essay-comment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.essay-comment-inline-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 8px;
  padding: 6px 10px;
  background: #fffbeb;
  color: #b45309;
  font-size: 11.5px;
}

.essay-comment-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  border: 1px solid #edf3f9;
  border-radius: 11px;
  padding: 10px 11px;
  background: linear-gradient(180deg, #fbfdff, #f8fbfe);
}

.essay-comment-name {
  color: #475569;
  font-size: 12.5px;
  font-weight: 600;
}

.essay-comment-name.is-link {
  color: var(--accent-strong, #3f719b);
  text-decoration: none;
}

.essay-comment-name.is-link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.essay-comment-owner {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 6px;
  background: var(--accent-soft, #eef7fd);
  color: var(--accent-strong, #3f719b);
  font-size: 9.5px;
  line-height: 16px;
}

.essay-comment-time {
  color: #a4b2c2;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.essay-comment-content {
  margin-top: 3px;
  color: #5b6b7c;
  font-size: 12.5px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

.essay-comment-form {
  margin-top: 12px;
  border: 1px solid #e8f0f8;
  border-radius: 12px;
  padding: 11px;
  background: linear-gradient(180deg, #fbfdff, #f7fbfe);
}

.essay-comment-identity,
.essay-comment-owner-tip {
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 11.5px;
}

.essay-comment-owner-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-family: 'huoxie', sans-serif;
}

.essay-comment-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.essay-comment-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #8494a6;
  font-size: 11px;
}

.essay-comment-field input,
.essay-comment-textarea {
  width: 100%;
  border: 1px solid #e2ebf4;
  border-radius: 9px;
  padding: 7px 10px;
  outline: none;
  background: #fff;
  color: #475569;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 1.65;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.essay-comment-field input::placeholder,
.essay-comment-textarea::placeholder {
  color: #a8b5c3;
}

.essay-comment-field input:focus,
.essay-comment-textarea:focus {
  border-color: var(--accent, #8fb8d8);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(139, 192, 226, 0.18));
}

.essay-comment-field input.is-invalid {
  border-color: #fca5a5;
}

.essay-comment-field-error {
  color: #dc2626;
  font-size: 10px;
  line-height: 1.4;
}

.dark .essay-comment-field-error {
  color: #fca5a5;
}

.essay-comment-textarea {
  display: block;
  min-height: 76px;
  resize: vertical;
}

.essay-comment-form-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.essay-comment-hint {
  color: #a4b2c2;
}

.essay-comment-error {
  color: #dc2626;
}

.essay-comment-notice {
  color: #2f6f9f;
}

.essay-comment-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  background: var(--accent-strong, #3f719b);
  color: #fff;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  letter-spacing: 0.05em;
  box-shadow: 0 6px 14px -10px var(--accent, rgba(63, 113, 155, 0.7));
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.essay-comment-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.essay-comment-submit:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.essay-comment-spinner {
  height: 12px;
  width: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 999px;
  animation: essay-comment-spin 0.8s linear infinite;
}

@keyframes essay-comment-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 暗色模式 */
.dark .essay-comments {
  border-top-color: var(--accent-line, #243247);
}

.dark .essay-comments-title {
  color: #cbd5e1;
}

.dark .essay-comments-refresh {
  border-color: #2a3a50;
  background: #0d1726;
  color: #64748b;
}

.dark .essay-comments-refresh:hover:not(:disabled) {
  background: #132238;
  color: var(--accent, #8ecbff);
}

.dark .essay-comment-state,
.dark .essay-comment-empty {
  border-color: #243247;
  background: rgba(15, 26, 42, 0.6);
  color: #64748b;
}

.dark .essay-comment-item {
  border-color: #1e2d42;
  background: rgba(15, 26, 42, 0.62);
}

.dark .essay-comment-name {
  color: #cbd5e1;
}

.dark .essay-comment-name.is-link {
  color: var(--accent, #8ecbff);
}

.dark .essay-comment-time {
  color: #5d7089;
}

.dark .essay-comment-content {
  color: #a8b7c8;
}

.dark .essay-comment-form {
  border-color: #243247;
  background: rgba(11, 21, 35, 0.65);
}

.dark .essay-comment-field {
  color: #7f90a4;
}

.dark .essay-comment-field input,
.dark .essay-comment-textarea {
  border-color: #2a3a50;
  background: #0d1726;
  color: #cbd5e1;
}

.dark .essay-comment-field input::placeholder,
.dark .essay-comment-textarea::placeholder {
  color: #55677d;
}

.dark .essay-comment-hint {
  color: #64748b;
}

.dark .essay-comment-notice {
  color: #9ed2f2;
}

.dark .essay-comment-submit {
  background: var(--accent, #8ecbff);
  color: #08111d;
  font-weight: 600;
}

@media (max-width: 640px) {
  .essay-comment-fields {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .essay-comments-refresh.is-loading svg,
  .essay-comment-spinner {
    animation: none;
  }
}
</style>
