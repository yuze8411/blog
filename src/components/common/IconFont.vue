<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

// 必须用 computed：普通 const 只在 setup 执行时算一次，
// 父组件切换分类后 name 变了，href 也不会跟着更新
const iconName = computed(() => `#icon-${props.name}`)
</script>
<style scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
