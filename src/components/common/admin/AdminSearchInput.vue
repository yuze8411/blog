<template>
  <div
    class="group flex h-[38px] w-full items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 pl-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-slate-300 focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(186,230,253,0.45)] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:focus-within:border-sky-500/70 dark:focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.18)] sm:w-[230px]"
  >
    <input
      type="text"
      class="admin-search-input h-full min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
      placeholder="查找文章的标题、内容"
      v-model="keyword"
    />
    <button
      type="button"
      class="grid h-full w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-500 transition-all duration-200 hover:bg-sky-100 hover:text-sky-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 group-focus-within:bg-sky-100 group-focus-within:text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-900/60 dark:hover:text-sky-300 dark:group-focus-within:bg-sky-900/60 dark:group-focus-within:text-sky-300 dark:focus-visible:ring-sky-800"
      aria-label="搜索文章"
      @click="searchHandler"
    >
      <IconFont name="sousuo" class="text-[13px]"></IconFont>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['search'])
let keyword = ref('')
// 搜索回调
function searchHandler() {
  emit('search', keyword.value)
}
</script>

<style scoped>
.admin-search-input {
  caret-color: #0ea5e9;
}
</style>
