<template>
  <header
    class="travel-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找照片介绍"
      aria-label="搜索游记照片"
      @search="emit('keySearch', $event)"
    />
    <AdminTimeSelect @change="emit('dataSearch', $event)" />
  </header>
</template>

<script setup lang="ts">
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'
import AdminTimeSelect from '@/components/common/admin/AdminTimeSelect.vue'

const emit = defineEmits<{
  keySearch: [keyword: string]
  dataSearch: [time: { year: number | null; month: number | null }]
}>()
</script>

<style scoped>
@media (max-width: 639px) {
  .travel-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
