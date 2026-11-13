<template>
  <header
    class="milestone-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找时光轴上的文章"
      aria-label="搜索时光轴文章"
      @search="emit('keySearch', $event)"
    />
    <AdminSelect :options="statusOptions" aria-label="按时光轴状态筛选" @change="onStatusSearch" />
  </header>
</template>

<script setup lang="ts">
import type { AdminMilestoneStatusFilter } from '@/api/adminMilestones'
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'
import AdminSelect from '@/components/common/admin/AdminSelect.vue'

const emit = defineEmits<{
  keySearch: [keyword: string]
  statusSearch: [status: AdminMilestoneStatusFilter]
}>()

const statusOptions = {
  optionarr: [
    { text: '展示中', value: 'visible' },
    { text: '隐藏中', value: 'hidden' },
    { text: '全部', value: 'all' },
  ],
}

function onStatusSearch(value: string) {
  emit('statusSearch', value as AdminMilestoneStatusFilter)
}
</script>

<style scoped>
@media (max-width: 639px) {
  .milestone-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
