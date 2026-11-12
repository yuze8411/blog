<template>
  <header
    class="tag-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找标签名称"
      aria-label="搜索标签"
      @search="emit('keySearch', $event)"
    />
  </header>
</template>

<script setup lang="ts">
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'

const emit = defineEmits<{
  keySearch: [keyword: string]
}>()
</script>

<style scoped>
@media (max-width: 639px) {
  .tag-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
