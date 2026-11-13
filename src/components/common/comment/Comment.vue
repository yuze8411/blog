<template>
  <section
    id="comment-section"
    class="mt-8 w-full scroll-mt-24 border-t border-gray-200 pt-6 dark:border-gray-700"
  >
    <!-- 评论区标题 -->
    <header class="mb-5">
      <div class="flex items-center justify-center gap-3 font-[huoxie] text-[26px]">
        <span
          class="flex items-center gap-1 font-sans text-[13px] text-gray-400 dark:text-gray-500"
        >
          <IconFont name="chicken" class="mr-1 text-[20px]" />咕咕?
        </span>
        <h2 class="tracking-[2px] text-[#2f4a77] dark:text-gray-100">咕咕咕</h2>
        <span
          class="flex items-center gap-1 font-sans text-[13px] text-gray-400 dark:text-gray-500"
        >
          咕咕！<IconFont name="xiaojijiniaodongwu" class="text-[20px]" />
        </span>
      </div>
      <p
        class="mt-1 text-center font-[huoxie] text-[13px] tracking-[1px] text-gray-400 dark:text-gray-500"
      >
        <template v-if="loading && !loaded">正在数咕咕…</template>
        <template v-else-if="loadError && !loaded">咕咕们暂时躲起来了</template>
        <template v-else>
          共 <span class="comment-count">{{ totalCount }}</span> 条咕咕 · 友善发言，人人有责
        </template>
      </p>
    </header>

    <CommentInput
      :owner="isBlogger"
      :owner-name="ownerName"
      :owner-avatar="ownerAvatar"
      :profile="profile"
      @submit="handleSubmit"
    />

    <!-- 首次加载：和评论行等高的骨架 -->
    <div
      v-if="loading && !loaded"
      class="comment-skeleton mt-4"
      aria-busy="true"
      aria-label="评论加载中"
    >
      <div v-for="n in 3" :key="n" class="comment-skeleton-row">
        <span class="comment-skeleton-avatar"></span>
        <div class="min-w-0 flex-1">
          <span class="comment-skeleton-line w-24"></span>
          <span class="comment-skeleton-line is-long"></span>
          <span class="comment-skeleton-line is-short"></span>
        </div>
      </div>
    </div>

    <!-- 首次加载失败：整块错误提示 -->
    <div v-else-if="loadError && !loaded" class="comment-state">
      <p class="comment-state-title">{{ loadError }}</p>
      <p class="comment-state-text">可能是网络抖了一下，点下面重新拉一次。</p>
      <button type="button" class="comment-state-btn" @click="loadComments">重新加载</button>
    </div>

    <template v-else>
      <!-- 刷新失败：保留上一次的评论，只在上方提示 -->
      <div v-if="loadError" class="comment-inline-error">
        <span>{{ loadError }}</span>
        <button type="button" @click="loadComments">重试</button>
      </div>

      <!-- 一级评论列表：每页最多 10 条 -->
      <div
        v-if="threads.length"
        id="comment-list"
        class="mt-3 scroll-mt-24 divide-y divide-gray-100 dark:divide-gray-800/80"
      >
        <CommentItem
          v-for="thread of pagedComments"
          :key="thread.id"
          :comment="thread"
          :profile="threadProfile"
          class="py-5"
          @submit-reply="handleReply"
        />
      </div>

      <div v-else class="comment-empty mt-6 rounded-xl border border-dashed py-9 text-center">
        <svg
          class="mx-auto mb-2 h-7 w-7 text-slate-300 dark:text-slate-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-2.8-.4L3 21l1.5-4.2A8.4 8.4 0 1 1 21 11.5Z"
            stroke-linejoin="round"
          />
          <path d="M8 10.5h8M8 14h5" stroke-linecap="round" />
        </svg>
        <p class="font-[huoxie] text-[15px] text-gray-400 dark:text-gray-500">
          还没有咕咕，来抢个沙发吧～
        </p>
      </div>

      <!-- 一级评论分页 -->
      <div v-if="pageCount > 1" class="mt-5 flex justify-center">
        <el-pagination
          v-model:current-page="page"
          class="comment-pagination"
          :page-size="PAGE_SIZE"
          :total="threads.length"
          :pager-count="5"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { AdminUser } from '@/api/auth'
import { getSessionUser, isOwner } from '@/api/auth'
import { commentErrorMessage, createComment, fetchPostComments } from '@/api/comments'
import ownerFallbackAvatar from '@/assets/images/mycover.jpg'
import type { CommentFormPayload, CommentReplyPayload, CommentThread, CommentUser } from '@/types'
import { avatarFromEmail, buildCommentThreads } from '@/utils/comment'
import CommentInput from './CommentInput.vue'
import CommentItem from './CommentItem.vue'

const props = defineProps<{
  postId: string
}>()

const emit = defineEmits<{
  /** 评论总数变化，通知详情页顶部同步 */
  'count-change': [count: number]
}>()

const PAGE_SIZE = 10

/** 游客评论 / 回复提交成功后的提示：它不会立刻出现在公开列表里 */
const PENDING_SUBMIT_NOTICE = '评论已提交，等博主审核通过后就会出现在这里～'
const PENDING_REPLY_NOTICE = '回复已提交，审核通过后就会展示在这里～'

const threads = ref<CommentThread[]>([])
const loading = ref(true)
const loaded = ref(false)
const loadError = ref('')
const page = ref(1)

// 当前登录的博主；只有 owner 才能直接用博主身份评论
const viewer = ref<AdminUser | null>(null)
const identityReady = ref(false)
let identityPromise: Promise<void> | null = null

const isBlogger = computed(() => isOwner(viewer.value))

/**
 * 等本地会话读完再决定用哪种身份提交。
 * 刚进页面立刻评论时，viewer 可能还是 null，直接按游客提交会让博主评论进入待审核，
 * 甚至因为身份和 RLS 对不上被拦下来。
 */
function ensureIdentity(): Promise<void> {
  if (identityReady.value) return Promise.resolve()
  if (!identityPromise) {
    identityPromise = (async () => {
      try {
        viewer.value = await getSessionUser()
      } catch (error) {
        console.warn('[comment] 读取登录状态失败', error)
      } finally {
        identityReady.value = true
      }
    })()
  }
  return identityPromise
}

// 博主没在账号元数据里设置昵称时，AdminUser 会退回邮箱前缀。
// 评论区是公开的，这里换成站点固定署名，避免把邮箱前缀漏出去。
const ownerName = computed(() => {
  const name = viewer.value?.name.trim() ?? ''
  const emailPrefix = viewer.value?.email.split('@')[0] ?? ''
  return name && name !== emailPrefix ? name : '雨落千山'
})
const ownerAvatar = computed(() => viewer.value?.avatarUrl || ownerFallbackAvatar)

// 写进数据库的头像必须是 http(s)；本地兜底图只用于展示，不能存进 avatar_url
const ownerAvatarForSave = computed(() => {
  const url = viewer.value?.avatarUrl ?? ''
  return /^https?:\/\//i.test(url) ? url : null
})

// 游客第一次发言后记下身份，后续回复和再次评论直接复用
const profile = reactive<CommentUser>({
  uname: '',
  uemail: '',
  ulink: '',
})

// 回复框使用的身份：博主用账号信息，游客用刚留下的昵称 / 邮箱
const threadProfile = computed<CommentUser>(() => {
  if (isBlogger.value) {
    return {
      uname: ownerName.value,
      avatar: ownerAvatar.value,
      isOwner: true,
    }
  }
  return {
    ...profile,
    avatar: avatarFromEmail(profile.uemail),
  }
})

const pageCount = computed(() => Math.max(1, Math.ceil(threads.value.length / PAGE_SIZE)))
const pagedComments = computed(() =>
  threads.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)
const totalCount = computed(() =>
  threads.value.reduce((total, thread) => total + 1 + thread.replies.length, 0),
)

// 快速切换文章时只保留最后一次请求
let requestId = 0

async function loadComments() {
  const current = ++requestId
  loading.value = true
  loadError.value = ''

  try {
    const rows = await fetchPostComments(props.postId)
    if (current !== requestId) return

    threads.value = buildCommentThreads(rows)
    loaded.value = true

    if (page.value > pageCount.value) page.value = 1
    emit('count-change', totalCount.value)
  } catch (error) {
    if (current !== requestId) return
    console.error('[comment] 加载评论失败', error)
    loadError.value = loaded.value ? '评论刷新失败了，先看看上一次的内容' : '评论暂时加载不出来'
  } finally {
    if (current === requestId) loading.value = false
  }
}

/** 数据库要求昵称 1-30 字，博主元数据里的名字也可能超长，这里统一收一下 */
function safeNickname(value: string) {
  return value.trim().slice(0, 30) || '咕咕'
}

/** 博主评论用账号身份，游客用表单里的昵称 / QQ 头像 / 友链 */
function resolveIdentity(payload: CommentUser) {
  if (isBlogger.value) {
    return {
      nickname: safeNickname(ownerName.value),
      avatarUrl: ownerAvatarForSave.value,
      websiteUrl: null,
    }
  }

  return {
    nickname: safeNickname(payload.uname),
    avatarUrl: avatarFromEmail(payload.uemail) ?? null,
    websiteUrl: payload.ulink || null,
  }
}

async function handleSubmit(
  payload: CommentFormPayload,
  done: (ok: boolean, message?: string) => void,
) {
  const content = payload.content.trim()
  if (!content) {
    done(false, '先写点内容吧')
    return
  }

  await ensureIdentity()
  const blogger = isBlogger.value

  try {
    await createComment({
      ...resolveIdentity(payload),
      postId: props.postId,
      content,
    })

    if (!blogger) {
      Object.assign(profile, {
        uname: payload.uname.trim(),
        uemail: payload.uemail?.trim() ?? '',
        ulink: payload.ulink ?? '',
      })

      // 游客评论还在待审核队列里，公开列表不会立刻出现它；
      // 这里不重新拉列表，只在表单下方提示等待审核。
      done(true, PENDING_SUBMIT_NOTICE)
      return
    }

    // 博主的评论直接通过，新评论在最前面，回到第一页展示
    page.value = 1
    await loadComments()
    done(true)
  } catch (error) {
    console.error('[comment] 发表评论失败', error)
    done(false, commentErrorMessage(error))
  }
}

async function handleReply(
  payload: CommentReplyPayload,
  done: (ok: boolean, message?: string) => void,
) {
  const thread = threads.value.find((item) => item.id === payload.parentId)
  if (!thread) {
    done(false, '这条评论可能被删掉了，刷新后再试试')
    return
  }

  const content = payload.content.trim()
  if (!content) {
    done(false, '回复内容不能为空')
    return
  }

  await ensureIdentity()
  const blogger = isBlogger.value

  try {
    await createComment({
      ...resolveIdentity(payload),
      postId: props.postId,
      rootId: thread.id,
      replyToId: payload.replyToId || thread.id,
      content,
    })

    if (!blogger) {
      if (!profile.uname) {
        Object.assign(profile, {
          uname: payload.uname.trim(),
          uemail: payload.uemail?.trim() ?? '',
          ulink: payload.ulink ?? '',
        })
      }

      // 回复同样要审核通过后才会出现在评论区
      done(true, PENDING_REPLY_NOTICE)
      return
    }

    await loadComments()
    done(true)
  } catch (error) {
    console.error('[comment] 回复失败', error)
    done(false, commentErrorMessage(error))
  }
}

function handlePageChange() {
  document.getElementById('comment-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 进入页面 / 同页切换文章时重新拉评论；旧文章数据先清空，避免串台
watch(
  () => props.postId,
  () => {
    threads.value = []
    loaded.value = false
    loadError.value = ''
    page.value = 1
    void loadComments()
  },
  { immediate: true },
)

// 读本地会话判断是不是博主；读失败就按游客处理，不影响评论浏览
onMounted(() => {
  void ensureIdentity()
})
</script>

<style scoped>
.comment-count {
  color: #3f74ad;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dark .comment-count {
  color: #9ecfff;
}

.comment-empty {
  border-color: #e2e8f0;
  background: linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%);
}

.dark .comment-empty {
  border-color: #334155;
  background: rgba(148, 163, 184, 0.04);
}

.comment-pagination {
  --el-pagination-button-width: 32px;
  --el-pagination-button-height: 32px;
  --el-pagination-font-size: 15px;
}

.comment-pagination :deep(.btn-prev),
.comment-pagination :deep(.btn-next),
.comment-pagination :deep(.el-pager li) {
  border-radius: 8px;
  background-color: #f1f5f9;
  color: #64748b;
  font-family: 'huoxie', 'Courier New', Courier, monospace;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.comment-pagination :deep(.btn-prev:hover),
.comment-pagination :deep(.btn-next:hover),
.comment-pagination :deep(.el-pager li:hover) {
  background-color: #e2e8f0;
  color: #3f74ad;
}

.comment-pagination :deep(.el-pager li.is-active) {
  background-color: #3f74ad;
  color: #fff;
}

.comment-pagination :deep(.btn-prev:disabled),
.comment-pagination :deep(.btn-next:disabled) {
  opacity: 0.4;
}

.dark .comment-pagination :deep(.btn-prev),
.dark .comment-pagination :deep(.btn-next),
.dark .comment-pagination :deep(.el-pager li) {
  background-color: #1e293b;
  color: #94a3b8;
}

.dark .comment-pagination :deep(.btn-prev:hover),
.dark .comment-pagination :deep(.btn-next:hover),
.dark .comment-pagination :deep(.el-pager li:hover) {
  background-color: #334155;
  color: #8ecbff;
}

.dark .comment-pagination :deep(.el-pager li.is-active) {
  background-color: #3f74ad;
  color: #fff;
}

/* ---------- 首次加载骨架 ---------- */
.comment-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-skeleton-row {
  display: flex;
  gap: 12px;
}

.comment-skeleton-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #edf1f6;
  animation: comment-pulse 1.5s ease-in-out infinite;
}

.comment-skeleton-line {
  display: block;
  height: 12px;
  margin-bottom: 9px;
  border-radius: 999px;
  background: #edf1f6;
  animation: comment-pulse 1.5s ease-in-out infinite;
}

.comment-skeleton-line.is-long {
  width: 82%;
}

.comment-skeleton-line.is-short {
  width: 48%;
  margin-bottom: 0;
}

@keyframes comment-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

:global(html.dark .comment-skeleton-avatar),
:global(html.dark .comment-skeleton-line) {
  background: rgba(148, 163, 184, 0.18);
}

/* ---------- 错误 / 重试 ---------- */
.comment-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 32px 20px;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  text-align: center;
}

.comment-state-title {
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  color: #64748b;
}

.comment-state-text {
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
  color: #94a3b8;
}

.comment-state-btn {
  margin-top: 6px;
  padding: 5px 16px;
  border: 1px solid #dbe7f4;
  border-radius: 999px;
  background: #fff;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.comment-state-btn:hover {
  border-color: #5fa6dd;
  background: #f8fbff;
}

.comment-inline-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 8px 12px;
  border-radius: 9px;
  background: rgba(254, 243, 199, 0.7);
  color: #92400e;
  font-family: 'huoxie', sans-serif;
  font-size: 12.5px;
}

.comment-inline-error button {
  flex-shrink: 0;
  padding: 2px 10px;
  border: 1px solid rgba(146, 64, 14, 0.25);
  border-radius: 999px;
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.comment-inline-error button:hover {
  background: rgba(146, 64, 14, 0.08);
}

:global(html.dark .comment-state) {
  border-color: #334155;
}

:global(html.dark .comment-state-title) {
  color: #94a3b8;
}

:global(html.dark .comment-state-text) {
  color: #64748b;
}

:global(html.dark .comment-state-btn) {
  border-color: #334155;
  background: rgba(15, 23, 42, 0.5);
  color: #8ecbff;
}

:global(html.dark .comment-state-btn:hover) {
  background: rgba(30, 41, 59, 0.8);
}

:global(html.dark .comment-inline-error) {
  background: rgba(120, 53, 15, 0.25);
  color: #fcd34d;
}

:global(html.dark .comment-inline-error button) {
  border-color: rgba(252, 211, 77, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .comment-skeleton-avatar,
  .comment-skeleton-line {
    animation: none;
  }
}
</style>
