<template>
  <span
    class="comment-avatar shrink-0"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background,
      fontSize: `${Math.round(size * 0.4)}px`,
    }"
    :title="name"
    aria-hidden="true"
  >
    <img v-if="src && !imageFailed" :src="src" :alt="name" @error="imageFailed = true" />
    <template v-else>{{ initial }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CommentAvatarProps } from '@/types'

const props = withDefaults(defineProps<CommentAvatarProps>(), {
  size: 40,
})

// QQ 头像偶尔会加载失败（QQ 号停用、网络抖动），失败后退回昵称首字，别留一个破图
const imageFailed = ref(false)
watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)

// 没有头像时用昵称首字 + 低饱和蓝紫渐变兜底，保证列表观感统一
const AVATAR_BACKGROUNDS = [
  'linear-gradient(135deg, #2f4a77, #7b7fd1)',
  'linear-gradient(135deg, #3f74ad, #8b8fd1)',
  'linear-gradient(135deg, #5fa6dd, #a9a4e8)',
  'linear-gradient(135deg, #4a6fb5, #9a97dd)',
  'linear-gradient(135deg, #6c8fd0, #c7bff0)',
]

const background = computed(() => {
  let hash = 0
  for (const char of props.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_BACKGROUNDS[hash % AVATAR_BACKGROUNDS.length] ?? '#5fa6dd'
})

// 用 Array.from 而不是 slice(0, 1)：中文、emoji 都按完整字符取第一个
const initial = computed(() => Array.from(props.name.trim())[0] ?? '咕')
</script>

<style scoped>
.comment-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  color: #fff;
  font-family: 'huoxie', sans-serif;
  letter-spacing: 1px;
  line-height: 1;
  user-select: none;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
