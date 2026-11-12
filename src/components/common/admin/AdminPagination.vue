<!--
  后台列表页通用分页条：文章、评论、标签、游记管理共用。

  用法：
  <AdminPagination
    :list="listData"
    :current-page="page"
    unit="条"
    @page-jump="loadPage"
  />

  list 只需要 total / pageSize 两个字段（文章、评论、标签、游记的列表结果都满足）。
-->
<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-1">
    <p class="text-[12px] text-slate-400 dark:text-slate-500">
      共
      <span class="font-medium tabular-nums text-slate-600 dark:text-slate-300">
        {{ list?.total ?? 0 }}
      </span>
      {{ unit }} · 每页 {{ list?.pageSize ?? 10 }} {{ unit }}
    </p>

    <el-pagination
      class="admin-pagination"
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :total="list?.total ?? 0"
      :page-size="list?.pageSize ?? 10"
      :pager-count="5"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
/** 列表结果里分页条真正用到的字段 */
interface PagerData {
  total?: number
  pageSize?: number
}

const props = withDefaults(
  defineProps<{
    list?: PagerData | null
    /** 当前页由父级传入，筛选条件变化时可以跟着回到第 1 页 */
    currentPage?: number
    /** 计数单位：文章用「篇」，评论 / 标签 / 照片用「条」或「张」 */
    unit?: string
  }>(),
  {
    list: null,
    currentPage: 1,
    unit: '篇',
  },
)

const emit = defineEmits<{
  pageJump: [page: number]
}>()

// 点页码 / 上一页 / 下一页时把页码抛给父级，由父级重新请求数据
function handleCurrentChange(page: number) {
  if (page === props.currentPage) return
  emit('pageJump', page)
}
</script>

<style scoped>
/* ==================== el-pagination 基础配色 ==================== */
.admin-pagination {
  --el-pagination-font-size: 12px;
  --el-pagination-button-width: 30px;
  --el-pagination-button-height: 30px;
  --el-pagination-border-radius: 8px;
  --el-pagination-button-bg-color: #f8fafc;
  --el-pagination-button-color: #64748b;
  --el-pagination-button-disabled-bg-color: #f1f5f9;
  --el-pagination-button-disabled-color: #cbd5e1;
  --el-pagination-hover-color: #0284c7;
  --el-pagination-bg-color: transparent;
}

.admin-pagination :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-pagination :deep(.el-pager li:hover) {
  background: #eef6ff;
  color: #0284c7;
}

/* 当前页：和添加按钮同一套天蓝 → 蓝渐变 */
.admin-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 6px 14px -8px rgba(37, 99, 235, 0.75);
}

.admin-pagination :deep(.btn-prev),
.admin-pagination :deep(.btn-next) {
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.admin-pagination :deep(.btn-prev:hover),
.admin-pagination :deep(.btn-next:hover) {
  background: #eef6ff;
  color: #0284c7;
}

.admin-pagination :deep(.btn-prev:disabled),
.admin-pagination :deep(.btn-next:disabled) {
  background: #f1f5f9;
  color: #cbd5e1;
  cursor: not-allowed;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-pagination {
  --el-pagination-button-bg-color: #1e293b;
  --el-pagination-button-color: #94a3b8;
  --el-pagination-button-disabled-bg-color: #172033;
  --el-pagination-button-disabled-color: #475569;
  --el-pagination-hover-color: #38bdf8;
  --el-pagination-bg-color: transparent;
}

:global(html.dark) .admin-pagination :deep(.el-pager li) {
  color: #94a3b8;
}

:global(html.dark) .admin-pagination :deep(.el-pager li:hover) {
  background: #1e293b;
  color: #cbd5e1;
}

:global(html.dark) .admin-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
}

:global(html.dark) .admin-pagination :deep(.btn-prev),
:global(html.dark) .admin-pagination :deep(.btn-next) {
  background: #1e293b;
  color: #94a3b8;
}

:global(html.dark) .admin-pagination :deep(.btn-prev:hover),
:global(html.dark) .admin-pagination :deep(.btn-next:hover) {
  background: #334155;
  color: #cbd5e1;
}

:global(html.dark) .admin-pagination :deep(.btn-prev:disabled),
:global(html.dark) .admin-pagination :deep(.btn-next:disabled) {
  background: #172033;
  color: #475569;
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-pagination :deep(.el-pager li),
  .admin-pagination :deep(.btn-prev),
  .admin-pagination :deep(.btn-next) {
    transition: none;
  }
}
</style>
