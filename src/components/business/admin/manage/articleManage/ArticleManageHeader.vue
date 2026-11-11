<template>
  <header
    class="article-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput @search="onKeySearch"></AdminSearchInput>
    <AdminTimeSelect @change="onTimeSearch"></AdminTimeSelect>
    <AdminSelect @change="onStatusSearch" :options="statusOptions"></AdminSelect>
  </header>
</template>
<script setup lang="ts">
interface options {
  optionarr: { text: string; value: string }[]
}
const emit = defineEmits(['keySearch', 'dataSearch', 'statusSearch'])
let statusOptions: options = {
  optionarr: [
    {
      text: '已发布',
      value: 'published',
    },
    {
      text: '草稿箱',
      value: 'unpublished',
    },
    {
      text: '禁展示',
      value: 'banned',
    },
  ],
}
function onKeySearch(keyword: string) {
  emit('keySearch', keyword)
}
function onStatusSearch(val: string) {
  emit('statusSearch', val)
}
function onTimeSearch(time: { year: number | null; month: number | null }) {
  emit('dataSearch', time)
}
</script>

<style scoped>
/* 小屏再收紧一点间距，避免三组筛选控件把屏幕挤得太满 */
@media (max-width: 639px) {
  .article-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
