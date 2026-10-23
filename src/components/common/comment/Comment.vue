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
        <h2 class="tracking-[2px] text-[#2f4a77] dark:text-gray-100">咕咕窝</h2>
        <span
          class="flex items-center gap-1 font-sans text-[13px] text-gray-400 dark:text-gray-500"
        >
          咕咕！<IconFont name="xiaojijiniaodongwu" class="text-[20px]" />
        </span>
      </div>
      <p
        class="mt-1 text-center font-[huoxie] text-[13px] tracking-[1px] text-gray-400 dark:text-gray-500"
      >
        共 {{ totalCount }} 条咕咕 · 友善发言，咕咕有责
      </p>
    </header>

    <CommentInput ref="inputRef" @submit="handleSubmit" />

    <!-- 一级评论列表：每页最多 10 条 -->
    <div
      v-if="comments.length"
      id="comment-list"
      class="mt-3 scroll-mt-24 divide-y divide-gray-100 dark:divide-gray-800/80"
    >
      <CommentItem
        v-for="thread of pagedComments"
        :key="thread.id"
        :comment="thread"
        :profile="profile"
        class="py-5"
        @submit-reply="handleReply"
      />
    </div>

    <div
      v-else
      class="mt-6 rounded-xl border border-dashed border-gray-200 py-10 text-center font-[huoxie] text-[15px] text-gray-400 dark:border-gray-700 dark:text-gray-500"
    >
      还没有咕咕，来抢个沙发吧～
    </div>

    <!-- 一级评论分页 -->
    <div v-if="pageCount > 1" class="mt-5 flex justify-center">
      <el-pagination
        v-model:current-page="page"
        class="comment-pagination"
        :page-size="PAGE_SIZE"
        :total="comments.length"
        :pager-count="5"
        layout="prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { CommentFormPayload, CommentReplyPayload, CommentThread, CommentUser } from '@/types'
import { comments as seedComments } from '@/data/comments'
import CommentInput from './CommentInput.vue'
import CommentItem from './CommentItem.vue'

const PAGE_SIZE = 10

const comments = ref<CommentThread[]>(
  seedComments.map((thread) => ({
    ...thread,
    replies: thread.replies.map((reply) => ({ ...reply })),
  })),
)

// 评论者身份：第一次发言后记下来，后续回复直接复用
const profile = reactive<CommentUser>({
  uname: '',
  uemail: '',
  ulink: '',
})

const page = ref(1)
const inputRef = ref<InstanceType<typeof CommentInput> | null>(null)

const pageCount = computed(() => Math.max(1, Math.ceil(comments.value.length / PAGE_SIZE)))
const pagedComments = computed(() =>
  comments.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)
const totalCount = computed(() =>
  comments.value.reduce((total, thread) => total + 1 + thread.replies.length, 0),
)

let uid = 0
function nextId(prefix: string) {
  uid += 1
  return `${prefix}-${Date.now()}-${uid}`
}

function nowText() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function handleSubmit(payload: CommentFormPayload) {
  const content = payload.content.trim()
  if (!content) return

  comments.value.unshift({
    id: nextId('c'),
    uname: payload.uname,
    ulink: payload.ulink || undefined,
    time: nowText(),
    content,
    replies: [],
  })

  Object.assign(profile, {
    uname: payload.uname,
    uemail: payload.uemail,
    ulink: payload.ulink,
  })

  // 新评论插在最前面，回到第一页展示
  page.value = 1
  inputRef.value?.reset()
}

function handleReply(payload: CommentReplyPayload) {
  const thread = comments.value.find((item) => item.id === payload.parentId)
  if (!thread) return

  // 无论回复的是一级还是二级评论，都追加到同一个 replies 数组，保证只有二级
  thread.replies.push({
    id: nextId('r'),
    uname: payload.uname,
    ulink: payload.ulink || undefined,
    time: nowText(),
    content: payload.content,
    replyTo: payload.replyTo,
  })

  if (!profile.uname) {
    profile.uname = payload.uname
    profile.uemail = payload.uemail
    profile.ulink = payload.ulink
  }
}

function handlePageChange() {
  document.getElementById('comment-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
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
</style>
