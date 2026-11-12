<template>
  <AdminTableShell
    :data="photos"
    :list="list"
    :current-page="currentPage"
    unit="张"
    :empty-title="emptyTitle"
    class="min-h-0 flex-1"
    @page-jump="emit('pageJump', $event)"
    @selection-change="emit('selectionChange', $event)"
  >
    <!-- 勾选列：批量删除用 -->
    <el-table-column type="selection" width="48" />

    <!-- 缩略图 + 介绍 -->
    <el-table-column label="照片" min-width="360" align="left">
      <template #default="{ row }">
        <div class="flex items-center gap-3">
          <el-image
            :src="row.img_url"
            :alt="row.img_introduction || '游记照片'"
            fit="cover"
            lazy
            class="admin-travel-thumb"
          >
            <template #error>
              <span class="admin-travel-thumb-error">
                <IconFont name="tupian" class="text-[15px]" />
              </span>
            </template>
          </el-image>

          <div class="min-w-0 flex-1">
            <p class="admin-travel-intro" :title="row.img_introduction || '暂无照片介绍'">
              {{ row.img_introduction || '暂无照片介绍' }}
            </p>
          </div>
        </div>
      </template>
    </el-table-column>

    <!-- 标签：最多显示两个，其余折叠 -->
    <el-table-column label="标签" width="220" align="left">
      <template #default="{ row }">
        <div class="flex flex-wrap items-center gap-1">
          <span
            v-for="tag in (row.img_tags ?? []).slice(0, 2)"
            :key="tag"
            class="admin-chip admin-chip--tag"
          >
            <span class="admin-chip__text">{{ tag }}</span>
          </span>

          <span v-if="(row.img_tags ?? []).length > 2" class="admin-chip admin-chip--count">
            +{{ (row.img_tags ?? []).length - 2 }}
          </span>

          <span
            v-if="!(row.img_tags ?? []).length"
            class="text-[12px] text-slate-300 dark:text-slate-600"
          >
            —
          </span>
        </div>
      </template>
    </el-table-column>

    <!-- 拍摄日期 -->
    <el-table-column label="拍摄日期" width="130" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ row.img_time || '未填写' }}
        </span>
      </template>
    </el-table-column>

    <!-- 入库时间 -->
    <el-table-column label="添加时间" width="130" align="left">
      <template #default="{ row }">
        <span class="text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
          {{ formatDate(row.created_at, false) }}
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
import type { AdminTravelRow } from '@/api/adminTravel'
import AdminTableShell from '@/components/common/admin/AdminTableShell.vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  photos?: AdminTravelRow[] | null
  list?: { total?: number; pageSize?: number } | null
  currentPage?: number
  keyword?: string
  year?: number | null
  month?: number | null
}>()

const emit = defineEmits<{
  pageJump: [page: number]
  edit: [row: AdminTravelRow]
  delete: [row: AdminTravelRow]
  selectionChange: [rows: AdminTravelRow[]]
}>()

const emptyTitle = computed(() => {
  const keyword = props.keyword?.trim()
  const short = keyword && keyword.length > 12 ? `${keyword.slice(0, 12)}…` : keyword

  const timePhrase =
    props.year == null
      ? ''
      : props.month == null
        ? `${props.year} 年`
        : `${props.year} 年 ${props.month} 月`

  if (short) {
    return timePhrase
      ? `没有找到 ${timePhrase}包含「${short}」的照片`
      : `没有找到包含「${short}」的照片`
  }

  return timePhrase ? `${timePhrase}还没有照片` : '还没有任何游记照片'
})
</script>

<style scoped>
.admin-travel-thumb {
  height: 46px;
  width: 66px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f5f9;
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.6);
}

.admin-travel-thumb-error {
  display: grid;
  height: 100%;
  width: 100%;
  place-items: center;
  background: #f1f5f9;
  color: #cbd5e1;
}

.admin-travel-intro {
  display: -webkit-box;
  overflow: hidden;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:global(html.dark) .admin-travel-thumb {
  background: #1e293b;
  box-shadow: inset 0 0 0 1px rgba(51, 65, 85, 0.8);
}

:global(html.dark) .admin-travel-thumb-error {
  background: #1e293b;
  color: #475569;
}

:global(html.dark) .admin-travel-intro {
  color: #cbd5e1;
}
</style>
