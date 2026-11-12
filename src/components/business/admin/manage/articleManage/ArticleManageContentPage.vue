<template>
  <!--
    文章列表分页条：基于 el-pagination。
    total / pageSize 来自 articleList；当前页由父级传进来（currentPage），
    这样筛选条件变化、页码被重置时，这里显示的数字也会跟着回到第 1 页。
  -->
  <div class="flex flex-wrap items-center justify-between gap-3 px-1">
    <p class="text-[12px] text-slate-400 dark:text-slate-500">
      共
      <span class="font-medium tabular-nums text-slate-600 dark:text-slate-300">
        {{ articleList?.total ?? 0 }}
      </span>
      {{ unit }} · 每页 {{ articleList?.pageSize ?? 10 }} {{ unit }}
    </p>

    <el-pagination
      class="admin-article-pager"
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :total="articleList?.total ?? 0"
      :page-size="articleList?.pageSize ?? 10"
      :pager-count="5"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
interface PagerData {
  total?: number
  pageSize?: number
}

const props = withDefaults(
  defineProps<{
    /** 列表结果，只需要 total / pageSize */
    articleList?: PagerData | null
    /** 当前页，由父级传入，筛选变化时能跟着回到第 1 页 */
    currentPage?: number
    /** 计数单位：文章页用「篇」，评论页可以传「条」 */
    unit?: string
  }>(),
  {
    articleList: null,
    currentPage: 1,
    unit: '篇',
  },
)

const emit = defineEmits<{
  pageJump: [page: number]
}>()

// el-pagination 点页码 / 上一页 / 下一页时触发，把页码往上抛，由父级去请求数据
function handleCurrentChange(page: number) {
  if (page === props.currentPage) return
  emit('pageJump', page)
}
</script>

<style scoped>
/* ==================== el-pagination 基础样式 ==================== */
/* 先改 Element Plus 的变量，再把细节（圆角、渐变、悬停）补上 */
.admin-article-pager {
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

/* 页码：圆角 + 过渡，悬停浅蓝 */
.admin-article-pager :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-article-pager :deep(.el-pager li:hover) {
  background: #eef6ff;
  color: #0284c7;
}

/* 当前页：和添加按钮同一套天蓝 → 蓝渐变 */
.admin-article-pager :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 6px 14px -8px rgba(37, 99, 235, 0.75);
}

/* 上一页 / 下一页 */
.admin-article-pager :deep(.btn-prev),
.admin-article-pager :deep(.btn-next) {
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.admin-article-pager :deep(.btn-prev:hover),
.admin-article-pager :deep(.btn-next:hover) {
  background: #eef6ff;
  color: #0284c7;
}

.admin-article-pager :deep(.btn-prev:disabled),
.admin-article-pager :deep(.btn-next:disabled) {
  background: #f1f5f9;
  color: #cbd5e1;
  cursor: not-allowed;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-article-pager {
  --el-pagination-button-bg-color: #1e293b;
  --el-pagination-button-color: #94a3b8;
  --el-pagination-button-disabled-bg-color: #172033;
  --el-pagination-button-disabled-color: #475569;
  --el-pagination-hover-color: #38bdf8;
  --el-pagination-bg-color: transparent;
}

:global(html.dark) .admin-article-pager :deep(.el-pager li) {
  color: #94a3b8;
}

:global(html.dark) .admin-article-pager :deep(.el-pager li:hover) {
  background: #1e293b;
  color: #cbd5e1;
}

:global(html.dark) .admin-article-pager :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
}

:global(html.dark) .admin-article-pager :deep(.btn-prev),
:global(html.dark) .admin-article-pager :deep(.btn-next) {
  background: #1e293b;
  color: #94a3b8;
}

:global(html.dark) .admin-article-pager :deep(.btn-prev:hover),
:global(html.dark) .admin-article-pager :deep(.btn-next:hover) {
  background: #334155;
  color: #cbd5e1;
}

:global(html.dark) .admin-article-pager :deep(.btn-prev:disabled),
:global(html.dark) .admin-article-pager :deep(.btn-next:disabled) {
  background: #172033;
  color: #475569;
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-article-pager :deep(.el-pager li),
  .admin-article-pager :deep(.btn-prev),
  .admin-article-pager :deep(.btn-next) {
    transition: none;
  }
}
</style>
