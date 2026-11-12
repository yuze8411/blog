<template>
  <form class="comment-card mt-3" novalidate @submit.prevent="handleSubmit">
    <!-- 标题 + 头像预览：填 QQ 邮箱时能直接看到会用什么头像 -->
    <div class="comment-card-head flex items-center gap-2">
      <p class="font-[huoxie] text-[17px] tracking-[1px] text-gray-800 dark:text-gray-100">
        发表评论
      </p>

      <div class="ml-auto flex min-w-0 items-center gap-2">
        <CommentAvatar :name="previewName" :src="previewAvatar" :size="28" />
        <span class="hidden truncate text-[12px] text-gray-400 dark:text-gray-500 sm:block">
          <template v-if="owner">
            以 <b class="comment-owner-name">{{ ownerName }}</b> 的博主身份评论
          </template>
          <template v-else>邮箱仅用于显示头像，不会公开</template>
        </span>
      </div>
    </div>

    <!-- 博主不需要再填昵称和邮箱，直接写内容 -->
    <div v-if="owner" class="comment-owner-tip mt-3">
      <span class="comment-owner-badge">博主</span>
      <span>不用填昵称和邮箱，直接写想说的话就好</span>
    </div>

    <!-- 游客身份信息 -->
    <div v-else class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label class="block" for="uname">
        <span class="comment-label">咕名<span class="comment-required">*</span></span>
        <input
          id="uname"
          v-model.trim="comment.uname"
          type="text"
          autocomplete="nickname"
          maxlength="30"
          placeholder="你的昵称"
          class="comment-field"
          :class="{ 'is-invalid': nameTouched && !comment.uname }"
          :aria-invalid="nameTouched && !comment.uname ? 'true' : undefined"
          @blur="nameTouched = true"
        />
        <span v-if="nameTouched && !comment.uname" class="comment-error">填一下昵称吧</span>
      </label>

      <label class="block" for="uemail">
        <span class="comment-label">邮箱<span class="comment-required">*</span></span>
        <input
          id="uemail"
          v-model.trim="comment.uemail"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="QQ 邮箱会显示 QQ 头像"
          class="comment-field"
          :class="{ 'is-invalid': emailTouched && !emailCheck.ok }"
          :aria-invalid="emailTouched && !emailCheck.ok ? 'true' : undefined"
          aria-describedby="uemail-hint"
          @blur="emailTouched = true"
        />
        <span v-if="emailTouched && !emailCheck.ok" id="uemail-hint" class="comment-error">
          {{ emailCheck.message }}
        </span>
        <span v-else-if="emailCheck.qq" id="uemail-hint" class="comment-ok">
          已识别 QQ {{ emailCheck.qq }}，会使用 QQ 头像
        </span>
        <span v-else id="uemail-hint" class="comment-hint">普通邮箱会使用昵称首字作为头像</span>
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
          :class="{ 'is-invalid': linkTouched && !websiteCheck.ok }"
          :aria-invalid="linkTouched && !websiteCheck.ok ? 'true' : undefined"
          aria-describedby="ulink-hint"
          @blur="linkTouched = true"
        />
        <span v-if="linkTouched && !websiteCheck.ok" id="ulink-hint" class="comment-error">
          {{ websiteCheck.message }}
        </span>
        <span v-else id="ulink-hint" class="comment-hint">可以只写域名，会自动补 https://</span>
      </label>
    </div>

    <!-- 评论内容 -->
    <div class="mt-3">
      <textarea
        id="ucontent"
        v-model="comment.content"
        rows="5"
        maxlength="2000"
        :disabled="submitting"
        aria-label="评论内容"
        placeholder="快点咕咕，不然让你变成黄焖咕咕、炸咕咕、地锅咕咕……"
        class="comment-field comment-textarea"
      ></textarea>
    </div>

    <!-- 服务端错误 / 游客提交成功提示：两者不会同时出现，用过渡避免生硬跳变 -->
    <Transition name="comment-message" mode="out-in">
      <p v-if="formError" key="error" class="comment-submit-error" role="alert">
        {{ formError }}
      </p>
      <p v-else-if="formNotice" key="notice" class="comment-submit-notice" role="status">
        {{ formNotice }}
      </p>
    </Transition>

    <!-- 底部：字数 + 提交 -->
    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="comment-counter" :class="counterTone">
          {{ comment.content.length }} / 2000 字
        </span>
        <span v-if="!owner" class="comment-review-hint">游客评论审核通过后展示</span>
      </div>
      <button type="submit" class="comment-submit" :disabled="!canSubmit || submitting">
        <span v-if="submitting" class="comment-submit-spinner" aria-hidden="true"></span>
        <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M3.105 3.105a.75.75 0 0 1 .82-.163l13.25 5.75a.75.75 0 0 1 0 1.383l-13.25 5.75a.75.75 0 0 1-1.005-.905l1.36-4.986a.75.75 0 0 1 .553-.53l6.586-1.653a.25.25 0 0 0 0-.485L4.833 6.473a.75.75 0 0 1-.553-.53l-1.36-4.986a.75.75 0 0 1 .185-.852Z"
          />
        </svg>
        {{ submitting ? '发送中…' : '发表评论' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { CommentFormPayload, CommentUser } from '@/types'
import { avatarFromEmail, normalizeWebsite, validateCommentEmail } from '@/utils/comment'
import CommentAvatar from './CommentAvatar.vue'

const props = withDefaults(
  defineProps<{
    /** 当前登录的是博主：隐藏昵称 / 邮箱 / 链接，直接用账号身份评论 */
    owner?: boolean
    ownerName?: string
    ownerAvatar?: string
    /** 之前评论 / 回复时留下的身份，回到顶部表单时自动补全 */
    profile?: CommentUser
  }>(),
  { owner: false, ownerName: '博主', ownerAvatar: '' },
)

type SubmitDone = (ok: boolean, message?: string) => void

const emit = defineEmits<{
  submit: [payload: CommentFormPayload, done: SubmitDone]
}>()

const comment = reactive({
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

const emailCheck = computed(() => validateCommentEmail(comment.uemail))
const websiteCheck = computed(() => normalizeWebsite(comment.ulink))

const previewName = computed(() => (props.owner ? props.ownerName : comment.uname.trim() || '咕咕'))
const previewAvatar = computed(() =>
  props.owner ? props.ownerAvatar || undefined : avatarFromEmail(comment.uemail),
)

const canSubmit = computed(() => {
  if (submitting.value || !comment.content.trim()) return false
  if (props.owner) return true
  return Boolean(comment.uname.trim()) && emailCheck.value.ok && websiteCheck.value.ok
})

/** 字数接近上限时给一点颜色提示，不用等到发不出去才发现 */
const counterTone = computed(() => {
  const length = comment.content.length
  if (length >= 1800) return 'is-danger'
  if (length >= 1500) return 'is-warn'
  return ''
})

// 如果先在下方回复框里发过言，回到顶部表单时把昵称 / 邮箱带过来
watch(
  () => props.profile,
  (profile) => {
    if (!profile || props.owner) return
    if (!comment.uname && profile.uname) comment.uname = profile.uname
    if (!comment.uemail && profile.uemail) comment.uemail = profile.uemail
    if (!comment.ulink && profile.ulink) comment.ulink = profile.ulink
  },
  { deep: true, immediate: true },
)

// 用户开始写新内容时，收起上一次提交成功的提示
watch(
  () => comment.content,
  (content) => {
    if (content) formNotice.value = ''
  },
)

function handleSubmit() {
  nameTouched.value = true
  emailTouched.value = true
  linkTouched.value = true

  const content = comment.content.trim()
  if (!content || !canSubmit.value) return

  submitting.value = true
  formError.value = ''
  formNotice.value = ''

  const payload: CommentFormPayload = {
    uname: props.owner ? props.ownerName : comment.uname.trim(),
    uemail: props.owner ? '' : comment.uemail.trim(),
    ulink: props.owner ? '' : websiteCheck.value.url,
    content,
  }

  emit('submit', payload, (ok, message) => {
    submitting.value = false
    if (ok) {
      comment.content = ''
      formError.value = ''
      formNotice.value = message ?? ''
      return
    }
    formError.value = message || '评论发送失败了，请稍后再试'
  })
}
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

  position: relative;
  width: 100%;
  padding: 1rem 1.15rem 1.1rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fbff;
  box-shadow: 0 14px 34px -32px rgba(47, 74, 119, 0.55);
}

/* 顶部一条很淡的渐变，和大面积浅色背景配合，卡片不会太平 */
.comment-card::before {
  position: absolute;
  top: 0;
  right: 12%;
  left: 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(95, 166, 221, 0.55), transparent);
  content: '';
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
  box-shadow: 0 16px 36px -32px rgba(0, 0, 0, 0.8);
}

.comment-card-head {
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}

.dark .comment-card-head {
  border-bottom-color: rgba(51, 65, 85, 0.85);
}

.comment-owner-name {
  color: #3f74ad;
  font-weight: normal;
}

.dark .comment-owner-name {
  color: #9ecfff;
}

.comment-owner-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #e4eef9;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.7);
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  color: #64748b;
}

.dark .comment-owner-tip {
  border-color: rgba(56, 189, 248, 0.12);
  background: rgba(30, 41, 59, 0.36);
  color: #94a3b8;
}

.comment-owner-badge {
  padding: 1px 8px;
  border-radius: 999px;
  background: #eef4fb;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 11px;
  line-height: 18px;
}

.dark .comment-owner-badge {
  background: rgba(95, 166, 221, 0.14);
  color: #bfdbfe;
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

.comment-field:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.comment-field.is-invalid {
  border-color: #fca5a5;
}

.comment-field.is-invalid:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.14);
}

.comment-textarea {
  min-height: 132px;
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 1.75;
  resize: none;
}

.comment-error,
.comment-ok,
.comment-hint {
  display: block;
  margin-top: 4px;
  font-size: 11.5px;
  line-height: 1.5;
}

.comment-error {
  color: #dc2626;
}

.comment-ok {
  color: #0f766e;
}

.comment-hint {
  color: #94a3b8;
}

.dark .comment-error {
  color: #fca5a5;
}

.dark .comment-ok {
  color: #5eead4;
}

.dark .comment-hint {
  color: #64748b;
}

.comment-submit-error {
  margin-top: 10px;
  padding: 7px 10px 7px 12px;
  border-left: 3px solid rgba(220, 38, 38, 0.45);
  border-radius: 8px;
  background: rgba(254, 226, 226, 0.7);
  color: #b91c1c;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 1.6;
}

.dark .comment-submit-error {
  border-left-color: rgba(248, 113, 113, 0.55);
  background: rgba(127, 29, 29, 0.22);
  color: #fca5a5;
}

.comment-submit-notice {
  margin-top: 10px;
  padding: 7px 10px 7px 12px;
  border-left: 3px solid rgba(16, 185, 129, 0.45);
  border-radius: 8px;
  background: rgba(236, 253, 245, 0.85);
  color: #047857;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  line-height: 1.6;
}

.dark .comment-submit-notice {
  border-left-color: rgba(52, 211, 153, 0.5);
  background: rgba(6, 78, 59, 0.28);
  color: #6ee7b7;
}

/* 错误 / 审核提示切换时轻轻淡入，不会突然把下方向下顶 */
.comment-message-enter-active,
.comment-message-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.comment-message-enter-from,
.comment-message-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.comment-review-hint {
  padding: 1px 7px;
  border-radius: 999px;
  background: #eef4fb;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 11px;
  line-height: 18px;
}

.dark .comment-review-hint {
  background: rgba(95, 166, 221, 0.14);
  color: #bfdbfe;
}

/* 字数：默认灰，接近上限时变琥珀 / 玫红 */
.comment-counter {
  color: #94a3b8;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

.dark .comment-counter {
  color: #64748b;
}

.comment-counter.is-warn {
  color: #b45309;
}

.dark .comment-counter.is-warn {
  color: #fcd34d;
}

.comment-counter.is-danger {
  color: #be123c;
}

.dark .comment-counter.is-danger {
  color: #fda4af;
}

.comment-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.comment-submit svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.comment-submit-spinner {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 999px;
  animation: comment-submit-spin 0.8s linear infinite;
}

@keyframes comment-submit-spin {
  to {
    transform: rotate(360deg);
  }
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

@media (prefers-reduced-motion: reduce) {
  .comment-submit-spinner {
    animation: none;
  }

  .comment-message-enter-active,
  .comment-message-leave-active {
    transition: none;
  }
}
</style>
