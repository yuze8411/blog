<template>
  <div
    class="group relative flex h-[38px] w-[130px] shrink-0 items-center rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-slate-300 focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(186,230,253,0.45)] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:focus-within:border-sky-500/70 dark:focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.18)]"
  >
    <select
      class="admin-select-native h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent pl-3.5 pr-9 text-[13px] text-slate-600 focus:outline-none dark:text-slate-300"
      aria-label="按文章状态筛选"
      @change="change"
      v-model="selectValue"
    >
      <option
        v-for="(item, index) in props.options.optionarr"
        :value="item.value"
        :key="index"
        :class="index == 0 ? 'checked' : ''"
      >
        {{ item.text }}
      </option>
    </select>

    <svg
      class="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-focus-within:rotate-180 dark:text-slate-500"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6.5 8 10l4-3.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
interface options {
  optionarr: { text: string; value: string }[]
}
interface props {
  options: options
}
const emit = defineEmits(['change'])
let props = defineProps<props>()
let selectValue = ref('')
// 状态改变时的回调
function change() {
  emit('change', selectValue.value)
}
onMounted(() => {
  selectValue.value = props.options.optionarr[0]?.value as string
})
</script>

<style scoped>
/* 让下拉选项的颜色和整个后台的深灰文字保持一致 */
.admin-select-native option {
  background-color: #fff;
  color: #334155;
}

/* 黑夜模式下原生下拉列表也跟着变深，避免突然弹出一块白底 */
:global(html.dark) .admin-select-native option {
  background-color: #1e293b;
  color: #e2e8f0;
}
</style>
