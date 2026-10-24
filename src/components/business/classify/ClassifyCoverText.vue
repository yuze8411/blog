<template>
  <div
    class="enter-fade-in absolute w-full left-0 top-[45%] -translate-y-[50%] flex flex-col items-center"
    style="animation-delay: 0.15s"
  >
    <h2
      class="text-[35px] font-[huoxie] text-white max-w-[70%] overflow-hidden text-ellipsis text-nowrap [text-shadow:0_5px_10px_rgba(0,0,0,1)] flex items-center gap-2"
      :title="types[Number(classify)]"
    >
      <IconFont :name="iconname" class="text-[26px]"></IconFont>{{ types[Number(classify)] }} |
      {{ total }}
    </h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    classify?: string
    total?: number
  }>(),
  {
    classify: '0',
    total: 0,
  },
)

const types = ['开发笔记', '生活记录', '我的吐槽', '科技产品']
const icons = ['kaifazhe', 'shenghuo', 'tucao', 'keji1']
let iconname = computed(() => {
  return icons[Number(props.classify)]
})
</script>

<style scoped></style>
