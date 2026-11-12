<!--
  后台列表表格外壳：统一表格边框、表头配色、行悬停、行内操作按钮和分页条。

  用法（列仍然由页面自己写，和直接用 el-table 一样）：
  <AdminTableShell :data="list" :list="result" :current-page="page" @page-jump="loadPage">
    <el-table-column type="selection" width="48" />
    <el-table-column label="名称" ...>...</el-table-column>
  </AdminTableShell>

  数据为空时自动换成 AdminBlank 空状态。
  想关掉分页条（例如分类全量展示）传 :paginated="false"。
-->
<template>
  <div class="mt-1 flex min-h-0 w-full flex-col pb-3">
    <div
      v-if="hasData"
      class="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800"
    >
      <el-table
        ref="tableRef"
        :data="data ?? []"
        :row-key="rowKey"
        height="100%"
        class="admin-data-table"
        @selection-change="onSelectionChange"
      >
        <slot />
      </el-table>
    </div>

    <AdminBlank v-else :title="emptyTitle" class="min-h-0 flex-1" />

    <AdminPagination
      v-if="paginated && hasData && list"
      :list="list"
      :current-page="currentPage"
      :unit="unit"
      class="mt-3 shrink-0"
      @page-jump="emit('pageJump', $event)"
    />
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, ref, watch } from 'vue'
import AdminBlank from './AdminBlank.vue'
import AdminPagination from './AdminPagination.vue'

interface PagerData {
  total?: number
  pageSize?: number
}

const props = withDefaults(
  defineProps<{
    data?: T[] | null
    /** 表格行的唯一标识字段，默认 id */
    rowKey?: string
    /** 分页条数据（total / pageSize） */
    list?: PagerData | null
    currentPage?: number
    unit?: string
    emptyTitle?: string
    /** 关闭分页条：分类这种数量少、不需要翻页的列表用 */
    paginated?: boolean
  }>(),
  {
    data: null,
    rowKey: 'id',
    list: null,
    currentPage: 1,
    unit: '条',
    emptyTitle: '还没有任何数据',
    paginated: true,
  },
)

const emit = defineEmits<{
  pageJump: [page: number]
  selectionChange: [rows: T[]]
}>()

const tableRef = ref<{
  setScrollTop?: (top: number) => void
  clearSelection?: () => void
} | null>(null)

const hasData = computed(() => (props.data?.length ?? 0) > 0)

function onSelectionChange(rows: T[]) {
  emit('selectionChange', rows)
}

// 换页或换筛选条件后，表格回到顶部并清空勾选，避免操作到上一页的数据
watch(
  () => props.data,
  async () => {
    await nextTick()
    tableRef.value?.setScrollTop?.(0)
    tableRef.value?.clearSelection?.()
  },
)
</script>

<style scoped>
/* ==================== el-table 基础配色 ==================== */
.admin-data-table {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #94a3b8;
  --el-table-text-color: #475569;
  --el-table-row-hover-bg-color: #f0f9ff;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  font-size: 13px;
}

.admin-data-table :deep(.el-table__header th.el-table__cell) {
  font-size: 12px;
  font-weight: 500;
}

.admin-data-table :deep(.el-table__cell) {
  padding: 9px 0;
  vertical-align: middle;
}

.admin-data-table :deep(.el-table .cell) {
  padding: 0 14px;
  line-height: 1.5;
}

.admin-data-table :deep(.el-table__body tr.el-table__row > td.el-table__cell) {
  transition: background-color 0.2s ease;
}

.admin-data-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 行进入时轻轻上浮淡入，前几行错开一点 */
.admin-data-table :deep(.el-table__body tr.el-table__row) {
  animation: admin-table-row-in 0.32s ease both;
}

.admin-data-table :deep(.el-table__body tr.el-table__row:nth-child(2)) {
  animation-delay: 0.03s;
}

.admin-data-table :deep(.el-table__body tr.el-table__row:nth-child(3)) {
  animation-delay: 0.06s;
}

.admin-data-table :deep(.el-table__body tr.el-table__row:nth-child(4)) {
  animation-delay: 0.09s;
}

.admin-data-table :deep(.el-table__body tr.el-table__row:nth-child(5)) {
  animation-delay: 0.12s;
}

.admin-data-table :deep(.el-table__body tr.el-table__row:nth-child(n + 6)) {
  animation-delay: 0.15s;
}

@keyframes admin-table-row-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 行内操作按钮 ==================== */
/*
 * 行内按钮平时都是灰的，悬停才亮出各自颜色：
 * 编辑偏蓝、删除偏玫红，整列不会太花。
 */
.admin-data-table :deep(.el-button.is-link.admin-row-action) {
  --el-button-text-color: #64748b;
  --el-button-hover-link-text-color: #64748b;
  height: auto;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action > span) {
  gap: 4px;
  line-height: 1;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action + .admin-row-action) {
  margin-left: 0;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: #f8fafc;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action:focus-visible) {
  outline: 2px solid #bae6fd;
  outline-offset: 1px;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action--edit:hover) {
  color: #0369a1;
}

.admin-data-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(225, 29, 72, 0.72);
}

.admin-data-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #be123c;
  background-color: #fff1f2;
}

/* ==================== 通用小药丸（分类 / 标签 / +n） ==================== */
.admin-chip {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0 8px;
  font-size: 11.5px;
  line-height: 20px;
  white-space: nowrap;
}

.admin-chip--category {
  border-color: #dbeafe;
  background-image: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  color: #475569;
}

.admin-chip--tag {
  border-color: #e0f2fe;
  background: #f0f9ff;
  color: #0369a1;
}

.admin-chip--count {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
}

.admin-chip__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-data-table {
  --el-table-border-color: #1e293b;
  --el-table-header-bg-color: #1e293b;
  --el-table-header-text-color: #64748b;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(2, 132, 199, 0.1);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

:global(html.dark) .admin-data-table :deep(.el-button.is-link.admin-row-action) {
  --el-button-text-color: #94a3b8;
  --el-button-hover-link-text-color: #94a3b8;
  color: #94a3b8;
}

:global(html.dark) .admin-data-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: rgba(148, 163, 184, 0.08);
}

:global(html.dark) .admin-data-table :deep(.el-button.is-link.admin-row-action--edit:hover) {
  color: #7dd3fc;
}

:global(html.dark) .admin-data-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(251, 113, 133, 0.78);
}

:global(html.dark) .admin-data-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #fda4af;
  background-color: rgba(244, 63, 94, 0.12);
}

:global(html.dark) .admin-chip--category {
  border-color: rgba(56, 189, 248, 0.18);
  background-image: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(12, 45, 72, 0.9) 100%);
  color: #cbd5e1;
}

:global(html.dark) .admin-chip--tag {
  border-color: rgba(56, 189, 248, 0.22);
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

:global(html.dark) .admin-chip--count {
  border-color: #334155;
  background: #1e293b;
  color: #94a3b8;
}

@media (prefers-reduced-motion: reduce) {
  .admin-data-table :deep(.el-table__body tr.el-table__row) {
    animation: none;
  }
}
</style>
