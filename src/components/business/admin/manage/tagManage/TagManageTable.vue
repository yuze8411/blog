<template>
  <AdminTableShell
    :data="tags"
    :list="list"
    :current-page="currentPage"
    unit="个"
    :empty-title="emptyTitle"
    class="min-h-0 flex-1"
    @page-jump="emit('pageJump', $event)"
    @selection-change="emit('selectionChange', $event)"
  >
    <!-- 勾选列：批量删除用 -->
    <el-table-column type="selection" width="48" />

    <!-- 标签名 -->
    <el-table-column label="标签" min-width="240" align="left">
      <template #default="{ row }">
        <span class="admin-chip admin-chip--tag">
          <IconFont name="biaoqian1" class="text-[12px] text-sky-500 dark:text-sky-400" />
          <span class="admin-chip__text">{{ row.name }}</span>
        </span>
      </template>
    </el-table-column>

    <!-- 关联文章数（包含草稿） -->
    <el-table-column label="文章" width="120" align="right" header-align="right">
      <template #default="{ row }">
        <span class="text-[12.5px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.post_count }}
          <span class="text-slate-300 dark:text-slate-600">篇</span>
        </span>
      </template>
    </el-table-column>

    <!-- 创建时间 -->
    <el-table-column label="创建时间" width="150" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ formatDate(row.created_at, false) }}
        </span>
      </template>
    </el-table-column>

    <!-- 操作 -->
    <el-table-column label="操作" width="170" align="right" header-align="right">
      <template #default="{ row }">
        <div class="flex items-center justify-end gap-0.5">
          <el-button
            link
            size="small"
            class="admin-row-action admin-row-action--edit"
            @click="emit('rename', row)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
              />
              <path
                d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
              />
            </svg>
            重命名
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
import type { AdminTagRow } from '@/api/adminTags'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  tags?: AdminTagRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  rename: [row: AdminTagRow]
  delete: [row: AdminTagRow]
  selectionChange: [rows: AdminTagRow[]]
}>()

const emptyTitle = computed(() => {
  const keyword = props.keyword?.trim()
  if (!keyword) return '还没有任何标签'
  const short = keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword
  return `没有找到包含「${short}」的标签`
})
</script>

<style scoped></style>
