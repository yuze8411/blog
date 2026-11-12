<template>
  <header
    class="comment-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找评论昵称、内容"
      aria-label="搜索评论"
      @search="onKeySearch"
    ></AdminSearchInput>
    <AdminTimeSelect @change="onTimeSearch"></AdminTimeSelect>
    <AdminSelect
      :options="statusOptions"
      aria-label="按评论状态筛选"
      @change="onStatusSearch"
    ></AdminSelect>
  </header>
</template>

<script setup lang="ts">
import type { AdminCommentStatusFilter } from '@/api/adminComments'

interface SelectOptions {
  optionarr: { text: string; value: string }[]
}

const emit = defineEmits<{
  keySearch: [keyword: string]
  dataSearch: [time: { year: number | null; month: number | null }]
  statusSearch: [status: AdminCommentStatusFilter]
}>()

const statusOptions: SelectOptions = {
  optionarr: [
    { text: '待审核', value: 'pending' },
    { text: '已通过', value: 'approved' },
    { text: '未通过', value: 'rejected' },
    { text: '全部', value: 'all' },
  ],
}

function onKeySearch(keyword: string) {
  emit('keySearch', keyword)
}

function onTimeSearch(time: { year: number | null; month: number | null }) {
  emit('dataSearch', time)
}

function onStatusSearch(value: string) {
  emit('statusSearch', value as AdminCommentStatusFilter)
}
</script>

<style scoped>
/* 小屏再收紧一点间距，避免三组筛选控件把屏幕挤得太满 */
@media (max-width: 639px) {
  .comment-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
