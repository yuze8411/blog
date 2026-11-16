<template>
  <header
    class="essay-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="搜索随笔标题或内容"
      aria-label="搜索随笔"
      @search="emit('keySearch', $event)"
    />
    <AdminSelect
      :options="statusOptions"
      aria-label="按随笔展示状态筛选"
      @change="onStatusSearch"
    />
  </header>
</template>

<script setup lang="ts">
import type { AdminEssayStatusFilter } from '@/api/adminEssays'
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'
import AdminSelect from '@/components/common/admin/AdminSelect.vue'

const emit = defineEmits<{
  keySearch: [keyword: string]
  statusSearch: [status: AdminEssayStatusFilter]
}>()

const statusOptions = {
  optionarr: [
    { text: '显示中', value: 'visible' },
    { text: '隐藏中', value: 'hidden' },
    { text: '全部', value: 'all' },
  ],
}

function onStatusSearch(value: string) {
  emit('statusSearch', value as AdminEssayStatusFilter)
}
</script>

<style scoped>
@media (max-width: 639px) {
  .essay-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
