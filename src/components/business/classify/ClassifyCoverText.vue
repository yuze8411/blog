<template>
  <div
    class="enter-fade-in absolute w-full left-0 top-[45%] -translate-y-[50%] flex flex-col items-center"
    style="animation-delay: 0.15s"
  >
    <h2
      class="text-[35px] font-[huoxie] text-white max-w-[70%] overflow-hidden text-ellipsis text-nowrap [text-shadow:0_5px_10px_rgba(0,0,0,1)] flex items-center gap-2"
      :title="displayName"
    >
      <IconFont :name="icon" class="text-[26px]"></IconFont>{{ displayName }} |
      {{ total }}
    </h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name?: string
    icon?: string
    total?: number
  }>(),
  {
    name: '文章分类',
    icon: 'biaoqian1',
    total: 0,
  },
)

const displayName = computed(() => props.name.trim() || '文章分类')
</script>

<style scoped></style>
