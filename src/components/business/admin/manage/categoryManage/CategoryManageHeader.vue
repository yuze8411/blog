<template>
  <header
    class="category-manage-header flex w-full flex-wrap items-center gap-2.5 rounded-[12px] border border-transparent bg-white p-3 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 lg:gap-5"
  >
    <AdminSearchInput
      placeholder="查找分类名称、slug"
      aria-label="搜索分类"
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
/* 小屏收紧间距，避免筛选控件把屏幕挤得太满 */
@media (max-width: 639px) {
  .category-manage-header {
    gap: 8px;
    padding: 10px;
  }
}
</style>
