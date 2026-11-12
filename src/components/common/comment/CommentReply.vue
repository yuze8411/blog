<template>
  <div class="flex gap-2">
    <CommentAvatar :name="reply.uname" :src="reply.avatar" :size="28" />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <a
          v-if="reply.ulink"
          :href="reply.ulink"
          target="_blank"
          rel="noopener noreferrer"
          class="reply-name transition-colors hover:text-[#3f74ad] dark:hover:text-[#8ecbff]"
        >
          {{ reply.uname }}
        </a>
        <span v-else class="reply-name">{{ reply.uname }}</span>

        <span v-if="reply.isAuthor" class="reply-badge">博主</span>
        <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ reply.time }}</span>
      </div>

      <p
        class="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-6 text-gray-600 dark:text-gray-300"
      >
        <span v-if="reply.replyTo" class="reply-mention">@{{ reply.replyTo }}</span>
        {{ reply.content }}
      </p>

      <button
        type="button"
        class="reply-action"
        @click="emit('reply', { id: reply.id, name: reply.uname })"
      >
        回复
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommentReplyProps } from '@/types'
import CommentAvatar from './CommentAvatar.vue'

defineProps<CommentReplyProps>()

/** 把被回复评论的 id 也带出去，写入 reply_to_id 后视图才能显示正确的 @ 对象 */
const emit = defineEmits<{ reply: [target: { id: string; name: string }] }>()
</script>

<style scoped>
.reply-name {
  font-family: 'huoxie', sans-serif;
  font-size: 13px;
  color: #475569;
  text-underline-offset: 2px;
}

a.reply-name:hover {
  text-decoration: underline;
}

.dark .reply-name {
  color: #dbe3ee;
}

.reply-badge {
  padding: 0 6px;
  border-radius: 999px;
  background: #eef4fb;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  line-height: 16px;
}

.dark .reply-badge {
  background: rgba(95, 166, 221, 0.14);
  color: #bfdbfe;
}

.reply-mention {
  margin-right: 3px;
  color: #3f74ad;
  font-family: 'huoxie', sans-serif;
}

.dark .reply-mention {
  color: #9ecfff;
}

.reply-action {
  margin-top: 3px;
  padding: 0 6px;
  border-radius: 999px;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  color: #94a3b8;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.reply-action:hover {
  background: #f1f7ff;
  color: #3f74ad;
}

.dark .reply-action {
  color: #64748b;
}

.dark .reply-action:hover {
  background: rgba(56, 189, 248, 0.08);
  color: #8ecbff;
}
</style>
