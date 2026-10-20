<template>
  <div class="flex justify-center mt-6 mb-8">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :pager-count="5"
      layout="prev, pager, next"
      background
      @current-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
// 首页文章展示分页，一次最多展示10个文章(不包含banner图)
import { ref, watch } from 'vue'
import type { PaginationProps } from '@/types'

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 10,
  modelValue: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', page: number): void
  (e: 'change', page: number): void
}>()

const currentPage = ref(props.modelValue)

watch(
  () => props.modelValue,
  (page) => (currentPage.value = page),
)

const handleChange = (page: number) => {
  emit('update:modelValue', page)
  emit('change', page)
}
</script>

<style scoped>
:deep(.el-pagination) {
  --el-pagination-button-width: 36px;
  --el-pagination-button-height: 36px;
  --el-pagination-font-size: 18px;
}

:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .el-pager li) {
  color: #838383;
  border-radius: 8px;
  font-family: 'huoxie', 'Courier New', Courier, monospace;
}

:deep(.el-pagination.is-background .btn-prev:hover),
:deep(.el-pagination.is-background .btn-next:hover),
:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #539dfd;
  background-color: #e2e2e2;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #539dfd;
  color: #fff;
}
</style>
