<template>
  <form class="message-form" novalidate @submit.prevent="handleSubmit">
    <!-- 顶部一条很淡的渐变，卡片在白色背景上不会太扁 -->
    <span class="message-form-topline" aria-hidden="true"></span>

    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="message-form-eyebrow">LEAVE A NOTE</p>
        <h2
          class="mt-1 font-[huoxie] text-[24px] tracking-[0.05em] text-zinc-800 dark:text-zinc-100"
        >
          写一条留言
        </h2>
        <p class="mt-1 text-[12px] leading-6 text-zinc-400 dark:text-zinc-500">
          留言会先经过审核，通过后才会出现在上面的墙上。
        </p>
      </div>

      <div
        class="flex min-w-0 items-center gap-2.5 rounded-full border border-[#eceef1] bg-[#fafafb]/80 py-1 pl-1 pr-3 dark:border-zinc-700 dark:bg-zinc-800/40"
      >
        <CommentAvatar :name="previewName" :src="previewAvatar" :size="32" tone="cool" />
        <div class="min-w-0 leading-tight">
          <p class="truncate text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
            {{ owner ? ownerName : previewName }}
          </p>
          <p class="truncate text-[10.5px] text-zinc-400 dark:text-zinc-500">
            {{ owner ? '以博主身份留言' : '邮箱只用来显示头像' }}
          </p>
        </div>
      </div>
    </header>

    <!-- 博主：不用填昵称 / 邮箱，但同样需要审核 -->
    <div v-if="owner" class="message-owner-tip mt-5">
      <span class="message-owner-badge">博主</span>
      <span>你的留言也会先进入审核队列，通过后才会展示在墙上。</span>
    </div>

    <!-- 游客身份信息 -->
    <div v-else class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label class="block" for="message-name">
        <span class="message-label">昵称<span class="message-required">*</span></span>
        <input
          id="message-name"
          v-model.trim="form.uname"
          type="text"
          autocomplete="nickname"
          maxlength="30"
          placeholder="怎么称呼你"
          class="message-field"
          :class="{ 'is-invalid': nameTouched && !form.uname }"
          :aria-invalid="nameTouched && !form.uname ? 'true' : undefined"
          @blur="nameTouched = true"
        />
        <span v-if="nameTouched && !form.uname" class="message-error">填一下昵称吧</span>
      </label>

      <label class="block" for="message-email">
        <span class="message-label">邮箱<span class="message-required">*</span></span>
        <input
          id="message-email"
          v-model.trim="form.uemail"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="QQ 邮箱会显示 QQ 头像"
          class="message-field"
          :class="{ 'is-invalid': emailTouched && !emailCheck.ok }"
          :aria-invalid="emailTouched && !emailCheck.ok ? 'true' : undefined"
          aria-describedby="message-email-hint"
          @blur="emailTouched = true"
        />
        <span v-if="emailTouched && !emailCheck.ok" id="message-email-hint" class="message-error">
          {{ emailCheck.message }}
        </span>
        <span v-else-if="emailCheck.qq" id="message-email-hint" class="message-ok">
          已识别 QQ {{ emailCheck.qq }}，会使用 QQ 头像
        </span>
        <span v-else id="message-email-hint" class="message-hint"> 邮箱仅用于头像，不会公开 </span>
      </label>

      <label class="block" for="message-link">
        <span class="message-label">链接</span>
        <input
          id="message-link"
          v-model.trim="form.ulink"
          type="url"
          autocomplete="url"
          placeholder="你的主页（选填）"
          class="message-field"
          :class="{ 'is-invalid': linkTouched && !websiteCheck.ok }"
          :aria-invalid="linkTouched && !websiteCheck.ok ? 'true' : undefined"
          aria-describedby="message-link-hint"
          @blur="linkTouched = true"
        />
        <span v-if="linkTouched && !websiteCheck.ok" id="message-link-hint" class="message-error">
          {{ websiteCheck.message }}
        </span>
        <span v-else id="message-link-hint" class="message-hint">
          可以只写域名，会自动补 https://
        </span>
      </label>
    </div>

    <!-- 留言内容 -->
    <div class="relative mt-4">
      <span class="message-quote-mark" aria-hidden="true">“</span>
      <textarea
        id="message-content"
        v-model="form.content"
        rows="4"
        maxlength="1000"
        :disabled="submitting"
        aria-label="留言内容"
        placeholder="想说什么都可以，慢一点写也没关系…"
        class="message-field message-textarea"
      ></textarea>
    </div>

    <!-- 错误 / 提交成功提示 -->
    <Transition name="message-notice" mode="out-in">
      <p v-if="formError" key="error" class="message-submit-error" role="alert">
        {{ formError }}
      </p>
      <p v-else-if="formNotice" key="notice" class="message-submit-notice" role="status">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          />
        </svg>
        <span>{{ formNotice }}</span>
      </p>
    </Transition>

    <!-- 底部：字数 + 提交 -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="message-counter" :class="counterTone">
          {{ form.content.length }} / 1000 字
        </span>
        <span class="message-review-hint">所有留言都需要审核</span>
      </div>

      <button type="submit" class="message-submit" :disabled="!canSubmit || submitting">
        <span v-if="submitting" class="message-submit-spinner" aria-hidden="true"></span>
        <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M3.105 3.105a.75.75 0 0 1 .82-.163l13.25 5.75a.75.75 0 0 1 0 1.383l-13.25 5.75a.75.75 0 0 1-1.005-.905l1.36-4.986a.75.75 0 0 1 .553-.53l6.586-1.653a.25.25 0 0 0 0-.485L4.833 6.473a.75.75 0 0 1-.553-.53l-1.36-4.986a.75.75 0 0 1 .185-.852Z"
          />
        </svg>
        {{ submitting ? '投递中…' : '投递留言' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import type { MessageFormPayload } from '@/types/message'
import { avatarFromEmail, normalizeWebsite, validateCommentEmail } from '@/utils/comment'

const props = withDefaults(
  defineProps<{
    /** 当前登录的是博主：隐藏昵称 / 邮箱 / 链接，直接用账号身份留言 */
    owner?: boolean
    ownerName?: string
    ownerAvatar?: string
  }>(),
  { owner: false, ownerName: '博主', ownerAvatar: '' },
)

type SubmitDone = (ok: boolean, message?: string) => void

const emit = defineEmits<{
  submit: [payload: MessageFormPayload, done: SubmitDone]
}>()

const form = reactive({
  uname: '',
  uemail: '',
  ulink: '',
  content: '',
})

const nameTouched = ref(false)
const emailTouched = ref(false)
const linkTouched = ref(false)
const submitting = ref(false)
const formError = ref('')
const formNotice = ref('')

const emailCheck = computed(() => validateCommentEmail(form.uemail))
const websiteCheck = computed(() => normalizeWebsite(form.ulink))

const previewName = computed(() => (props.owner ? props.ownerName : form.uname.trim() || '访客'))
const previewAvatar = computed(() =>
  props.owner ? props.ownerAvatar || undefined : avatarFromEmail(form.uemail),
)

/** 博主头像只有在 http(s) 时才能写进数据库，本地兜底图只用于展示 */
const ownerAvatarForSave = computed(() => {
  const url = props.ownerAvatar
  return /^https?:\/\//i.test(url) ? url : null
})

const canSubmit = computed(() => {
  if (submitting.value || !form.content.trim()) return false
  if (props.owner) return true
  return Boolean(form.uname.trim()) && emailCheck.value.ok && websiteCheck.value.ok
})

const counterTone = computed(() => {
  const length = form.content.length
  if (length >= 950) return 'is-danger'
  if (length >= 800) return 'is-warn'
  return ''
})

// 用户开始写新内容时，收起上一次提交成功的提示
watch(
  () => form.content,
  (content) => {
    if (content) formNotice.value = ''
  },
)

function handleSubmit() {
  nameTouched.value = true
  emailTouched.value = true
  linkTouched.value = true

  const content = form.content.trim()
  if (!content || !canSubmit.value) return

  submitting.value = true
  formError.value = ''
  formNotice.value = ''

  const payload: MessageFormPayload = props.owner
    ? {
        nickname: props.ownerName,
        content,
        avatarUrl: ownerAvatarForSave.value,
        websiteUrl: null,
      }
    : {
        nickname: form.uname.trim(),
        content,
        avatarUrl: avatarFromEmail(form.uemail),
        websiteUrl: websiteCheck.value.url || null,
      }

  emit('submit', payload, (ok, message) => {
    submitting.value = false
    if (ok) {
      form.content = ''
      formError.value = ''
      formNotice.value = message ?? ''
      return
    }
    formError.value = message || '留言发送失败了，请稍后再试'
  })
}
</script>

<style scoped>
.message-form {
  --mf-field-bg: #fff;
  --mf-field-border: #e7e9ec;
  --mf-field-hover: #d4d4d8;
  --mf-field-focus: #8b7fac;
  --mf-ring: rgba(139, 127, 172, 0.16);
  --mf-text: #3f3f46;
  --mf-placeholder: #a1a1aa;

  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 1.35rem 1.4rem 1.3rem;
  border: 1px solid #e2e4e8;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 26px 60px -38px rgba(39, 39, 42, 0.28),
    0 2px 6px -2px rgba(39, 39, 42, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.85) inset;
  backdrop-filter: blur(8px);
  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    background-color 0.35s ease;
}

.message-form:hover {
  border-color: #d4d7db;
  box-shadow:
    0 32px 72px -38px rgba(39, 39, 42, 0.34),
    0 3px 8px -3px rgba(39, 39, 42, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.85) inset;
}

html.dark .message-form {
  --mf-field-bg: rgba(255, 255, 255, 0.04);
  --mf-field-border: #3f3f46;
  --mf-field-hover: #52525b;
  --mf-field-focus: #b3a7cf;
  --mf-ring: rgba(179, 167, 207, 0.18);
  --mf-text: #e4e4e7;
  --mf-placeholder: #71717a;

  border-color: #34363a;
  background: rgba(20, 20, 22, 0.94);
  box-shadow:
    0 26px 60px -38px rgba(0, 0, 0, 0.95),
    0 2px 6px -2px rgba(0, 0, 0, 0.4);
}

.message-form-topline {
  position: absolute;
  top: 0;
  right: 16%;
  left: 16%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(161, 161, 170, 0.5),
    rgba(179, 167, 207, 0.5),
    transparent
  );
}

.message-form-eyebrow {
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #71717a;
}

.message-owner-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border: 1px solid #eceef1;
  border-radius: 10px;
  background: rgba(250, 250, 251, 0.9);
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  color: #52525b;
}

html.dark .message-owner-tip {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #a1a1aa;
}

.message-owner-badge {
  padding: 1px 8px;
  border-radius: 999px;
  background: #f4f1fa;
  color: #655a80;
  font-family: 'huoxie', sans-serif;
  font-size: 11px;
  line-height: 18px;
}

html.dark .message-owner-badge {
  background: rgba(190, 175, 225, 0.14);
  color: #d8d0ea;
}

.message-label {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 5px;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: #52525b;
}

html.dark .message-label {
  color: #a1a1aa;
}

.message-required {
  color: #d98b8b;
}

.message-field {
  display: block;
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--mf-field-border);
  border-radius: 10px;
  outline: none;
  background: var(--mf-field-bg);
  color: var(--mf-text);
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.message-field::placeholder {
  color: var(--mf-placeholder);
}

.message-field:hover {
  border-color: var(--mf-field-hover);
}

.message-field:focus {
  border-color: var(--mf-field-focus);
  box-shadow: 0 0 0 3px var(--mf-ring);
}

.message-field:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.message-field.is-invalid {
  border-color: #fca5a5;
}

.message-field.is-invalid:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.14);
}

.message-textarea {
  min-height: 118px;
  padding: 11px 13px 14px 32px;
  line-height: 1.8;
  resize: vertical;
}

.message-quote-mark {
  position: absolute;
  top: 2px;
  left: 10px;
  color: rgba(113, 113, 122, 0.28);
  font-family: Georgia, serif;
  font-size: 30px;
  line-height: 1;
  pointer-events: none;
}

.message-error,
.message-ok,
.message-hint {
  display: block;
  margin-top: 4px;
  font-size: 11.5px;
  line-height: 1.5;
}

.message-error {
  color: #dc2626;
}

.message-ok {
  color: #4f8a6a;
}

.message-hint {
  color: #a1a1aa;
}

html.dark .message-error {
  color: #fca5a5;
}

html.dark .message-ok {
  color: #86b89a;
}

html.dark .message-hint {
  color: #71717a;
}

.message-submit-error,
.message-submit-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 12px;
  padding: 8px 11px;
  border-left: 3px solid transparent;
  border-radius: 9px;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 1.65;
}

.message-submit-error {
  border-left-color: rgba(220, 38, 38, 0.45);
  background: rgba(254, 226, 226, 0.7);
  color: #b91c1c;
}

.message-submit-notice {
  border-left-color: rgba(79, 138, 106, 0.45);
  background: rgba(240, 247, 243, 0.9);
  color: #3f7a5c;
  animation: message-notice-pop 0.35s ease both;
}

.message-submit-notice svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

@keyframes message-notice-pop {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

html.dark .message-submit-error {
  border-left-color: rgba(248, 113, 113, 0.55);
  background: rgba(127, 29, 29, 0.22);
  color: #fca5a5;
}

html.dark .message-submit-notice {
  border-left-color: rgba(134, 184, 154, 0.45);
  background: rgba(50, 90, 65, 0.22);
  color: #9ac4a9;
}

.message-notice-enter-active,
.message-notice-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.message-notice-enter-from,
.message-notice-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.message-counter {
  color: #a1a1aa;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

html.dark .message-counter {
  color: #71717a;
}

.message-counter.is-warn {
  color: #71717a;
}

.message-counter.is-danger {
  color: #b04b4b;
}

.message-review-hint {
  padding: 1px 8px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #52525b;
  font-family: 'huoxie', sans-serif;
  font-size: 11px;
  line-height: 18px;
}

html.dark .message-review-hint {
  background: rgba(255, 255, 255, 0.08);
  color: #d4d4d8;
}

.message-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #46424f, #2a2732);
  color: #fff;
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 18px -12px rgba(39, 39, 42, 0.45);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.message-submit svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.message-submit-spinner {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 999px;
  animation: message-submit-spin 0.8s linear infinite;
}

@keyframes message-submit-spin {
  to {
    transform: rotate(360deg);
  }
}

.message-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px -14px rgba(39, 39, 42, 0.55);
}

.message-submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.message-submit:focus-visible {
  outline: 2px solid #a1a1aa;
  outline-offset: 2px;
}

.message-submit:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

@media (max-width: 639px) {
  .message-form {
    padding: 1.1rem 1rem 1.1rem;
    border-radius: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .message-submit,
  .message-submit-spinner,
  .message-submit-notice,
  .message-notice-enter-active,
  .message-notice-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
