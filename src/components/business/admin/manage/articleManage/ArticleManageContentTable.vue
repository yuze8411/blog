<template>
  <div class="mt-1 flex h-[calc(100%-39px)] w-full flex-col pb-3">
    <div
      v-if="isTable"
      class="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800"
    >
      <el-table
        ref="tableRef"
        :data="articleList?.list ?? []"
        row-key="id"
        height="100%"
        class="admin-article-table"
        @selection-change="onSelectionChange"
      >
        <!-- 勾选列：el-table 自带全选 / 单选逻辑 -->
        <el-table-column type="selection" width="48" />

        <!-- 封面 + 标题 + 摘要 -->
        <el-table-column label="文章" min-width="280" align="left">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-image
                v-if="row.cover_url"
                :src="row.cover_url"
                :alt="row.title"
                fit="cover"
                lazy
                class="h-11 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700/70"
              />
              <span
                v-else
                class="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-800 dark:text-slate-600 dark:ring-slate-700/70"
              >
                <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect
                    x="2.5"
                    y="3"
                    width="11"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <path
                    d="m3.5 11 3-3 2.2 2.2L10.5 8l2 2.5"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="6" cy="6" r="1" fill="currentColor" />
                </svg>
              </span>

              <div class="min-w-0">
                <p
                  class="truncate text-[14px] font-medium text-slate-700 dark:text-slate-200"
                  :title="row.title"
                >
                  {{ row.title }}
                </p>
                <p class="mt-0.5 truncate text-[12px] leading-5 text-slate-400 dark:text-slate-500">
                  {{ row.excerpt || '暂无摘要' }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 分类：图标用和前台顶部导航同一套 iconfont（fenlei1） -->
        <el-table-column label="分类" width="140" align="left">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" round class="admin-category-tag">
              <span class="admin-tag-text">{{ row.categories?.name || '未分类' }}</span>
            </el-tag>
          </template>
        </el-table-column>

        <!-- 标签：最多显示两个，其余折叠成 +n -->
        <el-table-column label="标签" width="210" align="left">
          <template #default="{ row }">
            <div class="flex flex-wrap items-center gap-1">
              <el-tag
                v-for="tag in (row.post_tags ?? []).slice(0, 2)"
                :key="tag.tags?.id ?? tag.tags?.name"
                size="small"
                round
                class="admin-post-tag"
              >
                <IconFont name="biaoqian1" class="admin-tag-icon" />
                <span class="admin-tag-text">{{ tag.tags?.name }}</span>
              </el-tag>
              <el-tag
                v-if="(row.post_tags ?? []).length > 2"
                size="small"
                round
                class="admin-count-tag"
              >
                +{{ (row.post_tags ?? []).length - 2 }}
              </el-tag>
              <span
                v-if="!(row.post_tags ?? []).length"
                class="text-[12px] text-slate-300 dark:text-slate-600"
              >
                —
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 状态：草稿 / 已发布 / 禁展示 -->
        <el-table-column label="状态" width="104" align="left">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="light"
              round
              :type="!row.is_published ? 'info' : row.is_visible ? 'success' : 'danger'"
            >
              {{ !row.is_published ? '草稿' : row.is_visible ? '已发布' : '禁展示' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 发布时间：直接截取 ISO 字符串的日期部分，避免时区偏移 -->
        <el-table-column label="发布时间" width="124" align="left">
          <template #default="{ row }">
            <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
              {{ String(row.created_at ?? '').slice(0, 10) }}
            </span>
          </template>
        </el-table-column>

        <!-- 浏览量 -->
        <el-table-column label="浏览" width="80" align="right" header-align="right">
          <template #default="{ row }">
            <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
              {{ row.view_count ?? 0 }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作：文字按钮，事件等 TS 部分再接 -->
        <el-table-column label="操作" width="196" align="right" header-align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-0.5">
              <!-- 编辑 -->
              <el-button
                link
                size="small"
                class="admin-row-action admin-row-action--edit"
                @click="emit('edit', row)"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
                  />
                  <path
                    d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
                  />
                </svg>
                编辑
              </el-button>

              <!-- 隐藏 / 展示：已展示时给「闭眼」，隐藏时给「睁眼」；草稿会在点击时给出提示 -->
              <el-button
                link
                size="small"
                class="admin-row-action admin-row-action--toggle"
                :title="row.is_published ? '在前台隐藏或重新展示' : '草稿不会在前台展示，无需隐藏'"
                @click="emit('toggle', row)"
              >
                <svg
                  v-if="row.is_visible"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z"
                  />
                  <path
                    d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z"
                  />
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                  />
                </svg>
                {{ row.is_visible ? '隐藏' : '展示' }}
              </el-button>

              <!-- 删除：淡一些的玫红，悬停才加深 -->
              <el-button
                link
                size="small"
                class="admin-row-action admin-row-action--danger"
                @click="emit('delete', row)"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482 41.03 41.03 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                  />
                </svg>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 没有数据：按搜索条件展示对应文案 -->
    <AdminBlank :title="title" v-if="!isTable" class="min-h-0 flex-1" />

    <!-- 分页条：把列表数据和当前页传下去，翻页事件原样往上抛 -->
    <AdminPagination
      v-if="isTable"
      :list="articleList"
      :current-page="searchquery?.page ?? 1"
      unit="篇"
      class="mt-3 shrink-0"
      @pageJump="pageJump"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AdminBlank from '@/components/common/admin/AdminBlank.vue'
import AdminPagination from '@/components/common/admin/AdminPagination.vue'
import type { ArticleManageRow } from './types'

// 获取文章列表数据
const props = defineProps(['articleList', 'searchquery'])
const emit = defineEmits<{
  pageJump: [page: number]
  edit: [row: ArticleManageRow]
  toggle: [row: ArticleManageRow]
  delete: [row: ArticleManageRow]
  selectionChange: [rows: ArticleManageRow[]]
}>()

const tableRef = ref()

// 分页条只负责抛出页码，这里原样交给 ArticleManageContent
function pageJump(page: number) {
  emit('pageJump', page)
}

// el-table 勾选变化时把当前选中的行抛给父级，批量删除要用
function onSelectionChange(rows: ArticleManageRow[]) {
  emit('selectionChange', rows)
}

// 换页或换筛选条件后，表格回到顶部并清空勾选，避免删到上一页的行
watch(
  () => props.articleList?.list,
  async () => {
    await nextTick()
    tableRef.value?.setScrollTop(0)
    tableRef.value?.clearSelection()
  },
)

let isTable = computed(() => {
  if (!props.articleList) return true
  return props.articleList.list?.length > 0
})

const STATUS_PHRASE: Record<string, string> = {
  published: '已发布的文章',
  unpublished: '草稿',
  banned: '禁展示的文章',
}

function parseRange(raw: unknown): { year: number | null; month: number | null } {
  if (typeof raw !== 'string' || !raw.trim()) return { year: null, month: null }

  const [yearText = '', monthText = ''] = raw.trim().split(/\s+/)
  const year = Number(yearText)
  const month = Number(monthText)

  return {
    year: Number.isInteger(year) && year > 0 ? year : null,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
  }
}

let title = computed(() => {
  const query = props.searchquery ?? {}

  const keyword = String(query.search_keyword ?? '').trim()
  const statusPhrase = STATUS_PHRASE[String(query.status ?? '')] ?? ''
  const { month, year } = parseRange(query.data_range)

  // 时间文案：2025 年 3 月 / 2025 年 / 空
  const timePhrase = year === null ? '' : month === null ? `${year} 年` : `${year} 年 ${month} 月`
  // 关键字太长时截断，避免标题被撑成好几行
  const keywordPhrase = keyword
    ? `「${keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword}」`
    : ''

  // 1. 有关键字时，关键字是主角，状态和时间作为限定
  if (keywordPhrase) {
    if (statusPhrase && timePhrase)
      return `没有找到 ${timePhrase}包含 ${keywordPhrase} 的${statusPhrase}`
    if (statusPhrase) return `没有找到包含 ${keywordPhrase} 的${statusPhrase}`
    if (timePhrase) return `没有找到 ${timePhrase}包含 ${keywordPhrase} 的文章`
    return `没有找到包含 ${keywordPhrase} 的文章`
  }

  // 2. 没有关键字时，按状态 / 时间组合
  if (statusPhrase && timePhrase) return `${timePhrase}没有${statusPhrase}`
  if (statusPhrase) return `暂无${statusPhrase}`
  if (timePhrase) return `${timePhrase}还没有文章`
  return '还没有任何文章'
})
</script>

<style scoped>
/* ==================== el-table 基础配色 ==================== */
/*
 * 用 Element Plus 自己的 CSS 变量改色，比一项项覆盖内部类更稳，
 * 背景设成透明，让外层卡片的底色透过来。
 */
.admin-article-table {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #94a3b8;
  --el-table-text-color: #475569;
  --el-table-row-hover-bg-color: #f0f9ff;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  font-size: 13px;
}

/* 表头：小一号、不加粗，和页面上其它筛选控件保持同一层级 */
.admin-article-table :deep(.el-table__header th.el-table__cell) {
  font-size: 12px;
  font-weight: 500;
}

/* 单元格上下留白，让 44px 的封面不显得拥挤；垂直居中让标题和数据在同一条线上 */
.admin-article-table :deep(.el-table__cell) {
  padding: 9px 0;
  vertical-align: middle;
}

/*
 * 表头和数据格使用同一套左右内边距（14px）：
 * 每列的数据都能和自己的列标题左对齐，列与列之间也留出 28px 的间隙。
 */
.admin-article-table :deep(.el-table .cell) {
  padding: 0 14px;
  line-height: 1.5;
}

/* 行悬停背景有过渡，不会突然跳色 */
.admin-article-table :deep(.el-table__body tr.el-table__row > td.el-table__cell) {
  transition: background-color 0.2s ease;
}

/* el-table 底部自带的一条 1px 线，和外层的圆角边框重复了，去掉 */
.admin-article-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 行进入时轻轻上浮淡入，前几行错开一点 */
.admin-article-table :deep(.el-table__body tr.el-table__row) {
  animation: admin-table-row-in 0.32s ease both;
}

.admin-article-table :deep(.el-table__body tr.el-table__row:nth-child(2)) {
  animation-delay: 0.03s;
}

.admin-article-table :deep(.el-table__body tr.el-table__row:nth-child(3)) {
  animation-delay: 0.06s;
}

.admin-article-table :deep(.el-table__body tr.el-table__row:nth-child(4)) {
  animation-delay: 0.09s;
}

.admin-article-table :deep(.el-table__body tr.el-table__row:nth-child(5)) {
  animation-delay: 0.12s;
}

.admin-article-table :deep(.el-table__body tr.el-table__row:nth-child(n + 6)) {
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

/* ==================== 分类 / 标签 ==================== */
/*
 * 分类：淡蓝灰渐变的小药丸 + iconfont 图标（fenlei1，和前台顶部导航同一套）。
 * 标签：更淡的天空蓝药丸 + 小标签图标（biaoqian1）。
 * 图标颜色都很克制，整张表仍然只有状态列是彩色重点。
 */
.admin-article-table :deep(.admin-category-tag) {
  --el-tag-text-color: #475569;
  height: 22px;
  max-width: 100%;
  padding: 0 9px;
  border-color: #dbeafe;
  background-image: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  color: #475569;
  font-weight: 500;
}

.admin-article-table :deep(.admin-count-tag) {
  --el-tag-bg-color: #f8fafc;
  --el-tag-border-color: #e2e8f0;
  --el-tag-text-color: #94a3b8;
  font-weight: 400;
}

.admin-article-table :deep(.admin-post-tag) {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #e0f2fe;
  --el-tag-text-color: #0369a1;
  max-width: 100%;
  font-weight: 400;
}

/* el-tag 会把插槽包一层 .el-tag__content，图标和文字要在这一层做间距 */
.admin-article-table :deep(.admin-category-tag .el-tag__content),
.admin-article-table :deep(.admin-post-tag .el-tag__content) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.admin-article-table :deep(.admin-category-tag .el-tag__content) {
  gap: 4px;
}

.admin-article-table :deep(.admin-post-tag .el-tag__content) {
  gap: 3px;
}

/* 标签里的 iconfont：尺寸比文字略小，颜色只带一点天空蓝 */
.admin-article-table :deep(.admin-tag-icon) {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #38bdf8;
}

.admin-article-table :deep(.admin-post-tag .admin-tag-icon) {
  width: 11px;
  height: 11px;
}

/* 分类名 / 标签名太长时省略，避免把列撑开或换行 */
.admin-article-table :deep(.admin-tag-text) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 行内操作按钮 ==================== */
/*
 * 三个按钮平时都是灰的，只靠图标区分类别；
 * 悬停时才亮出各自的一点颜色（编辑偏蓝、展示偏深灰、删除偏玫红），
 * 这样整列不会花，也不抢状态列的视觉重点。
 */
.admin-article-table :deep(.el-button.is-link.admin-row-action) {
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

/* 图标和文字之间留一点空隙 */
.admin-article-table :deep(.el-button.is-link.admin-row-action > span) {
  gap: 4px;
  line-height: 1;
}

/* 按钮之间的间距交给外层 flex 的 gap，去掉 Element Plus 默认的 12px 左外边距 */
.admin-article-table :deep(.el-button.is-link.admin-row-action + .admin-row-action) {
  margin-left: 0;
}

.admin-article-table :deep(.el-button.is-link.admin-row-action svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.admin-article-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: #f8fafc;
}

.admin-article-table :deep(.el-button.is-link.admin-row-action:focus-visible) {
  outline: 2px solid #bae6fd;
  outline-offset: 1px;
}

/* 编辑：悬停是很深的蓝，不刺眼 */
.admin-article-table :deep(.el-button.is-link.admin-row-action--edit:hover) {
  color: #0369a1;
}

/* 展示 / 隐藏：悬停加深到接近正文的灰 */
.admin-article-table :deep(.el-button.is-link.admin-row-action--toggle:hover) {
  color: #334155;
}

/* 删除：平时是半透明玫红，悬停才实一点 */
.admin-article-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(225, 29, 72, 0.72);
}

.admin-article-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #be123c;
  background-color: #fff1f2;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-article-table {
  --el-table-border-color: #1e293b;
  --el-table-header-bg-color: #1e293b;
  --el-table-header-text-color: #64748b;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(2, 132, 199, 0.1);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

/* 深色下 el-tag 的浅色底会发白，按类型各补一套低饱和的深色 */
:global(html.dark) .admin-article-table :deep(.el-tag--success) {
  --el-tag-bg-color: rgba(16, 185, 129, 0.16);
  --el-tag-border-color: rgba(16, 185, 129, 0.32);
  --el-tag-text-color: #6ee7b7;
}

:global(html.dark) .admin-article-table :deep(.el-tag--danger) {
  --el-tag-bg-color: rgba(244, 63, 94, 0.16);
  --el-tag-border-color: rgba(244, 63, 94, 0.32);
  --el-tag-text-color: #fda4af;
}

:global(html.dark) .admin-article-table :deep(.el-tag--info) {
  --el-tag-bg-color: #1e293b;
  --el-tag-border-color: #334155;
  --el-tag-text-color: #94a3b8;
}

/* 深色下的分类 / 标签：同样走低饱和，标签只保留一点点天空蓝 */
:global(html.dark) .admin-article-table :deep(.admin-count-tag) {
  --el-tag-bg-color: #1e293b;
  --el-tag-border-color: #334155;
  --el-tag-text-color: #94a3b8;
}

:global(html.dark) .admin-article-table :deep(.admin-category-tag) {
  --el-tag-text-color: #cbd5e1;
  border-color: rgba(56, 189, 248, 0.18);
  background-image: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(12, 45, 72, 0.9) 100%);
  color: #cbd5e1;
}

:global(html.dark) .admin-article-table :deep(.admin-post-tag) {
  --el-tag-bg-color: rgba(2, 132, 199, 0.14);
  --el-tag-border-color: rgba(56, 189, 248, 0.22);
  --el-tag-text-color: #7dd3fc;
}

:global(html.dark) .admin-article-table :deep(.admin-tag-icon) {
  color: #7dd3fc;
}

/* 深色下操作按钮统一再亮一档，悬停只轻微提亮 */
:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action) {
  --el-button-text-color: #94a3b8;
  --el-button-hover-link-text-color: #94a3b8;
  color: #94a3b8;
}

:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action:hover) {
  background-color: rgba(148, 163, 184, 0.08);
}

:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action--edit:hover) {
  color: #7dd3fc;
}

:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action--toggle:hover) {
  color: #e2e8f0;
}

:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action--danger) {
  color: rgba(251, 113, 133, 0.78);
}

:global(html.dark) .admin-article-table :deep(.el-button.is-link.admin-row-action--danger:hover) {
  color: #fda4af;
  background-color: rgba(244, 63, 94, 0.12);
}

/* ==================== 减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .admin-article-table :deep(.el-table__body tr.el-table__row) {
    animation: none;
  }
}
</style>
