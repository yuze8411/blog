<template>
  <AdminTableShell
    :data="categories"
    :paginated="false"
    :empty-title="emptyTitle"
    unit="个"
    class="min-h-0 flex-1"
  >
    <!-- 分类名 -->
    <el-table-column label="分类" min-width="220" align="left">
      <template #default="{ row }">
        <div class="flex items-center gap-2.5">
          <span class="admin-category-icon">
            <IconFont name="fenlei1" class="text-[15px]" />
          </span>
          <span class="truncate text-[13.5px] font-medium text-slate-700 dark:text-slate-200">
            {{ row.name }}
          </span>
        </div>
      </template>
    </el-table-column>

    <!-- slug：前台地址栏里用 -->
    <el-table-column label="Slug" width="160" align="left">
      <template #default="{ row }">
        <code class="admin-slug">{{ row.slug }}</code>
      </template>
    </el-table-column>

    <!-- 已发布文章数（来自 categories_with_counts 视图） -->
    <el-table-column label="文章" width="110" align="right" header-align="right">
      <template #default="{ row }">
        <span class="text-[12.5px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.post_count }}
          <span class="text-slate-300 dark:text-slate-600">篇</span>
        </span>
      </template>
    </el-table-column>

    <!-- 排序值：数字小的排前面 -->
    <el-table-column label="排序" width="96" align="right" header-align="right">
      <template #default="{ row }">
        <span class="text-[12.5px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.sort_order }}
        </span>
      </template>
    </el-table-column>

    <!-- 操作 -->
    <el-table-column label="操作" width="150" align="right" header-align="right">
      <template #default="{ row }">
        <div class="flex items-center justify-end gap-0.5">
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
  </AdminTableShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminCategoryRow } from '@/api/adminCategories'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'

const props = defineProps<{
  categories?: AdminCategoryRow[] | null
  /** 当前搜索关键字，用来生成更贴切的空状态文案 */
  keyword?: string
}>()

const emit = defineEmits<{
  edit: [row: AdminCategoryRow]
  delete: [row: AdminCategoryRow]
}>()

const emptyTitle = computed(() => {
  const keyword = props.keyword?.trim()
  if (!keyword) return '还没有任何分类'
  const short = keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword
  return `没有找到包含「${short}」的分类`
})
</script>

<style scoped>
.admin-category-icon {
  display: grid;
  height: 28px;
  width: 28px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.25);
}

.admin-slug {
  border-radius: 6px;
  background: #f8fafc;
  padding: 1px 6px;
  color: #64748b;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11.5px;
}

:global(html.dark) .admin-category-icon {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(3, 105, 161, 0.12) 100%);
  color: #7dd3fc;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.2);
}

:global(html.dark) .admin-slug {
  background: #1e293b;
  color: #94a3b8;
}
</style>
