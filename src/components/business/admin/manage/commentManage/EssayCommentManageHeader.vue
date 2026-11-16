<template>
  <header
    class="essay-comment-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找随笔评论昵称、内容"
      aria-label="搜索随笔评论"
      @search="emit('keySearch', $event)"
    />
    <AdminTimeSelect @change="onTimeSearch"></AdminTimeSelect>
    <AdminSelect
      :options="statusOptions"
      aria-label="按随笔评论状态筛选"
      @change="onStatusSearch"
    ></AdminSelect>
  </header>
</template>

<script setup lang="ts">
import type { AdminEssayCommentStatusFilter } from '@/api/adminEssayComments'
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'
import AdminSelect from '@/components/common/admin/AdminSelect.vue'
import AdminTimeSelect from '@/components/common/admin/AdminTimeSelect.vue'

interface SelectOptions {
  optionarr: { text: string; value: string }[]
}

const emit = defineEmits<{
  keySearch: [keyword: string]
  dataSearch: [time: { year: number | null; month: number | null }]
  statusSearch: [status: AdminEssayCommentStatusFilter]
}>()

const statusOptions: SelectOptions = {
  optionarr: [
    { text: '待审核', value: 'pending' },
    { text: '已通过', value: 'approved' },
    { text: '未通过', value: 'rejected' },
    { text: '全部', value: 'all' },
  ],
}

function onTimeSearch(time: { year: number | null; month: number | null }) {
  emit('dataSearch', time)
}

function onStatusSearch(value: string) {
  emit('statusSearch', value as AdminEssayCommentStatusFilter)
}
</script>

<style scoped>
@media (max-width: 639px) {
  .essay-comment-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
