<template>
  <el-drawer
    v-model="visible"
    class="admin-milestone-picker"
    body-class="admin-milestone-picker-body"
    size="440px"
    destroy-on-close
    :with-header="false"
    :close-on-click-modal="!addingId"
  >
    <div class="flex h-full flex-col">
      <!-- 抽屉头 -->
      <header
        class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-white px-5 py-4 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900"
      >
        <div class="flex min-w-0 items-center gap-2.5">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500 ring-1 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .21.09.41.25.55l3 2.7a.75.75 0 0 0 .99-1.13l-2.74-2.47V5Z"
              />
            </svg>
          </span>
          <div class="min-w-0">
            <h3 class="truncate text-[15px] font-semibold text-slate-700 dark:text-slate-100">
              添加文章到时光轴
            </h3>
            <p class="mt-0.5 truncate text-[10.5px] text-slate-400 dark:text-slate-500">
              选中后会按文章发布时间自动排在对应位置
            </p>
          </div>
        </div>
        <el-button
          text
          circle
          aria-label="关闭添加文章面板"
          :disabled="Boolean(addingId)"
          @click="visible = false"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </el-button>
      </header>

      <!-- 搜索 -->
      <div class="flex shrink-0 items-center gap-2 px-5 py-3">
        <AdminSearchInput
          class="min-w-0 flex-1 !w-full"
          placeholder="搜索要添加的文章"
          aria-label="搜索可添加的文章"
          @search="onSearch"
        />
        <button
          type="button"
          class="picker-refresh"
          :class="{ 'is-loading': loading }"
          :disabled="loading"
          title="刷新可添加的文章"
          aria-label="刷新可添加的文章"
          @click="load"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
            />
          </svg>
        </button>
      </div>

      <!-- 列表 -->
      <el-scrollbar class="min-h-0 flex-1">
        <div v-if="loading" class="px-5 pb-6">
          <AdminLoding size="sm" text="获取可添加的文章中…" class="py-14" />
        </div>

        <div v-else-if="error" class="px-5 pb-6">
          <AdminBlank compact title="文章列表没有加载出来" :description="error">
            <template #action>
              <button type="button" class="picker-retry" @click="load">重新加载</button>
            </template>
          </AdminBlank>
        </div>

        <div v-else-if="!candidates.length" class="px-5 pb-6">
          <AdminBlank
            compact
            :title="searchedKeyword ? '没有找到可以添加的文章' : '暂时没有可添加的文章'"
            :description="
              searchedKeyword
                ? '换个关键词试试，或者先到文章管理里发布一篇新文章'
                : '已发布且前台可见的文章，只要还没加入时光轴，都会出现在这里'
            "
          />
        </div>

        <div v-else class="px-5 pb-6">
          <p class="mb-2.5 px-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            可添加
            <span class="font-medium tabular-nums text-slate-500 dark:text-slate-400">
              {{ candidates.length }}
            </span>
            篇{{
              candidates.length >= CANDIDATE_LIMIT ? '（最多显示 100 篇，可搜索缩小范围）' : ''
            }}
          </p>

          <div class="space-y-2">
            <button
              v-for="item in candidates"
              :key="item.id"
              type="button"
              class="picker-item group"
              :disabled="Boolean(addingId)"
              @click="add(item)"
            >
              <el-image
                :src="item.cover_url || undefined"
                :alt="item.title"
                fit="cover"
                lazy
                class="picker-cover"
              >
                <template #error>
                  <span class="picker-cover-error">
                    <IconFont name="tupian" class="text-[15px]" />
                  </span>
                </template>
              </el-image>

              <span class="min-w-0 flex-1 text-left">
                <span
                  class="block truncate text-[13px] font-medium text-slate-600 dark:text-slate-200"
                >
                  {{ item.title }}
                </span>
                <span
                  class="mt-1 block truncate text-[11px] leading-5 text-slate-400 dark:text-slate-500"
                >
                  {{ item.excerpt || '暂无摘要' }}
                </span>
                <span
                  class="mt-1.5 block text-[10px] tabular-nums text-slate-400 dark:text-slate-500"
                >
                  {{ formatDate(item.published_at, false) }} 发布
                </span>
              </span>

              <span class="picker-add-icon" :class="{ 'is-adding': addingId === item.id }">
                <span v-if="addingId === item.id" class="picker-spinner" aria-hidden="true"></span>
                <svg v-else viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  addMilestone,
  adminMilestoneErrorMessage,
  fetchMilestoneCandidates,
  type AdminMilestoneCandidate,
} from '@/api/adminMilestones'
import AdminBlank from '@/components/common/admin/AdminBlank.vue'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import AdminSearchInput from '@/components/common/admin/AdminSearchInput.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import { formatDate } from '@/utils/date'

const CANDIDATE_LIMIT = 100

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  added: []
}>()

const adminAlert = useAdminAlert()

const candidates = ref<AdminMilestoneCandidate[]>([])
const loading = ref(false)
const error = ref('')
const searchedKeyword = ref('')
const keyword = ref('')
const addingId = ref<string | null>(null)

/** 只接受最后一次请求的结果，避免快速搜索时旧结果把新结果覆盖掉 */
let requestId = 0

async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''

  try {
    const rows = await fetchMilestoneCandidates(keyword.value)
    if (current !== requestId) return
    candidates.value = rows
  } catch (err) {
    if (current !== requestId) return
    console.error('[milestoneManage] 获取可添加文章失败', err)
    error.value = adminMilestoneErrorMessage(err)
  } finally {
    if (current === requestId) loading.value = false
  }
}

function onSearch(value: string) {
  keyword.value = value.trim()
  searchedKeyword.value = keyword.value
  void load()
}

async function add(item: AdminMilestoneCandidate) {
  if (addingId.value) return

  addingId.value = item.id
  try {
    await addMilestone(item.id)
    candidates.value = candidates.value.filter((row) => row.id !== item.id)
    adminAlert.success(`「${item.title}」已加入时光轴`)
    emit('added')
  } catch (err) {
    console.error('[milestoneManage] 添加时光轴文章失败', err)
    adminAlert.error(adminMilestoneErrorMessage(err))
    // 大概率是重复添加，重新拉一次列表把这篇排除掉
    void load()
  } finally {
    addingId.value = null
  }
}

watch(visible, (open) => {
  if (!open) return
  keyword.value = ''
  searchedKeyword.value = ''
  candidates.value = []
  error.value = ''
  void load()
})
</script>

<style scoped>
.picker-refresh {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #fff;
  color: #94a3b8;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.picker-refresh svg {
  height: 15px;
  width: 15px;
}

.picker-refresh:hover:not(:disabled) {
  border-color: #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
}

.picker-refresh:disabled {
  cursor: default;
  opacity: 0.65;
}

.picker-refresh.is-loading svg {
  animation: picker-spin 0.9s linear infinite;
}

@keyframes picker-spin {
  to {
    transform: rotate(360deg);
  }
}

.picker-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  padding: 10px;
  background: #fff;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.picker-item:hover:not(:disabled) {
  border-color: #7dd3fc;
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -16px rgba(2, 132, 199, 0.8);
}

.picker-item:focus-visible {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(186, 230, 253, 0.55);
}

.picker-item:disabled {
  cursor: default;
}

.picker-cover {
  height: 56px;
  width: 76px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f5f9;
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.6);
}

.picker-cover-error {
  display: grid;
  height: 100%;
  width: 100%;
  place-items: center;
  background: #f1f5f9;
  color: #cbd5e1;
}

.picker-add-icon {
  display: inline-flex;
  height: 26px;
  width: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0f9ff;
  color: #38bdf8;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.picker-add-icon svg {
  height: 15px;
  width: 15px;
}

.picker-item:hover:not(:disabled) .picker-add-icon {
  background: #0ea5e9;
  color: #fff;
  transform: scale(1.06);
}

.picker-add-icon.is-adding {
  background: #e0f2fe;
  color: #0284c7;
}

.picker-spinner {
  height: 14px;
  width: 14px;
  border: 2px solid rgba(2, 132, 199, 0.25);
  border-top-color: #0284c7;
  border-radius: 999px;
  animation: picker-spin 0.7s linear infinite;
}

.picker-retry {
  display: inline-flex;
  height: 32px;
  align-items: center;
  border: 1px solid #bae6fd;
  border-radius: 0.6rem;
  background: #f0f9ff;
  padding: 0 13px;
  color: #0284c7;
  font-size: 12px;
  font-weight: 500;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.picker-retry:hover {
  border-color: #7dd3fc;
  background: #e0f2fe;
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .picker-refresh {
  border-color: #334155;
  background: #1e293b;
  color: #94a3b8;
}

:global(html.dark) .picker-refresh:hover:not(:disabled) {
  border-color: #0369a1;
  background: #0c4a6e;
  color: #7dd3fc;
}

:global(html.dark) .picker-item {
  border-color: #334155;
  background: #111c2e;
}

:global(html.dark) .picker-item:hover:not(:disabled) {
  border-color: #0369a1;
  background: #13233c;
}

:global(html.dark) .picker-item:focus-visible {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
}

:global(html.dark) .picker-cover,
:global(html.dark) .picker-cover-error {
  background: #1e293b;
  box-shadow: inset 0 0 0 1px rgba(51, 65, 85, 0.8);
}

:global(html.dark) .picker-cover-error {
  color: #475569;
}

:global(html.dark) .picker-add-icon {
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

:global(html.dark) .picker-item:hover:not(:disabled) .picker-add-icon {
  background: #0284c7;
  color: #fff;
}

:global(html.dark) .picker-retry {
  border-color: #075985;
  background: rgba(2, 132, 199, 0.14);
  color: #7dd3fc;
}

:global(html.dark) .picker-retry:hover {
  border-color: #0369a1;
  background: rgba(2, 132, 199, 0.22);
}

/* 抽屉被 teleport 到 body，暗色样式要写成全局的 */
:global(.admin-milestone-picker-body) {
  padding: 0;
}

:global(html.dark .admin-milestone-picker) {
  background-color: #0f172a;
  color: #cbd5e1;
}

@media (max-width: 479px) {
  :global(.admin-milestone-picker) {
    width: 100% !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .picker-refresh.is-loading svg,
  .picker-spinner {
    animation: none;
  }

  .picker-item,
  .picker-add-icon {
    transition: none;
  }

  .picker-item:hover:not(:disabled) {
    transform: none;
  }
}
</style>
