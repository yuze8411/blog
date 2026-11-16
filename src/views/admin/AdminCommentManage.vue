<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <!-- 评论管理分成文章评论 / 随笔评论两张独立数据表 -->
    <div class="comment-manage-tabs shrink-0" role="tablist" aria-label="评论类型">
      <button
        type="button"
        role="tab"
        class="comment-manage-tab"
        :class="{ 'is-active': activeTab === 'article' }"
        :aria-selected="activeTab === 'article'"
        @click="activeTab = 'article'"
      >
        文章评论
      </button>
      <button
        type="button"
        role="tab"
        class="comment-manage-tab"
        :class="{ 'is-active': activeTab === 'essay' }"
        :aria-selected="activeTab === 'essay'"
        @click="activeTab = 'essay'"
      >
        随笔评论
      </button>
    </div>

    <div v-show="activeTab === 'article'" class="flex min-h-0 flex-1 flex-col gap-3">
      <CommentManageHeader
        class="shrink-0"
        @keySearch="keywordSearch"
        @dataSearch="dataRangeSearch"
        @statusSearch="statusSearch"
      />

      <CommentManageContent
        class="min-h-0 flex-1"
        :commentList="commentList"
        :searchquery="searchQuery"
        @pageJump="pageJump"
        @refresh="refreshCommentList"
      />
    </div>

    <EssayCommentManagePanel v-if="activeTab === 'essay'" class="min-h-0 flex-1" />

    <AdminLoding overlay v-if="activeTab === 'article' && isLoading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  adminCommentErrorMessage,
  fetchAdminComments,
  type AdminCommentListResult,
  type AdminCommentStatusFilter,
} from '@/api/adminComments'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import CommentManageContent from '@/components/business/admin/manage/commentManage/CommentManageContent.vue'
import CommentManageHeader from '@/components/business/admin/manage/commentManage/CommentManageHeader.vue'
import EssayCommentManagePanel from '@/components/business/admin/manage/commentManage/EssayCommentManagePanel.vue'
import type { CommentSearchState } from '@/components/business/admin/manage/commentManage/types'

const adminAlert = useAdminAlert()

/** 当前查看的是文章评论还是随笔评论 */
const activeTab = ref<'article' | 'essay'>('article')

const commentList = ref<AdminCommentListResult | null>(null)
const isLoading = ref(true)
const loadingText = ref('获取评论数据中...')

/** 默认落在「待审核」，打开后台先处理需要审核的评论 */
const searchQuery = reactive<CommentSearchState>({
  keyword: '',
  status: 'pending',
  year: null,
  month: null,
  page: 1,
})

const STATUS_LABEL: Record<AdminCommentStatusFilter, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '未通过',
  all: '全部',
}

function timePhrase(year: number | null, month: number | null) {
  if (year === null) return '全部时间段的'
  return month === null ? `${year} 年的` : `${year} 年 ${month} 月的`
}

async function loadList(text: string, resetPage = false) {
  if (resetPage) searchQuery.page = 1
  loadingText.value = text
  isLoading.value = true

  try {
    commentList.value = await fetchAdminComments(searchQuery)
  } catch (error) {
    console.error('[commentManage] 获取评论列表失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

// 关键字搜索
function keywordSearch(keyword: string) {
  if (keyword === searchQuery.keyword) return
  searchQuery.keyword = keyword
  const tip = keyword.trim() ? `「${keyword.trim()}」相关的评论中...` : '全部评论中...'
  void loadList(`搜索 ${tip}`, true)
}

// 创建时间范围搜索
function dataRangeSearch(time: { year: number | null; month: number | null }) {
  if (time.year === searchQuery.year && time.month === searchQuery.month) return
  searchQuery.year = time.year
  searchQuery.month = time.month
  void loadList(`搜索${timePhrase(time.year, time.month)}评论中...`, true)
}

// 审核状态搜索
function statusSearch(status: AdminCommentStatusFilter) {
  if (status === searchQuery.status) return
  searchQuery.status = status
  const label = STATUS_LABEL[status] ?? '评论'
  void loadList(status === 'all' ? '获取全部评论中...' : `搜索${label}的评论中...`, true)
}

// 换页：分页条已经把页码算好了，这里只更新状态并重新取当前页数据
function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页评论数据中...`)
}

// 通过 / 隐藏 / 删除之后刷新当前页；如果这页被处理空了，自动退回上一页
async function refreshCommentList() {
  loadingText.value = '刷新评论列表中...'
  isLoading.value = true

  try {
    let result = await fetchAdminComments(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminComments(searchQuery)
    }
    commentList.value = result
  } catch (error) {
    console.error('[commentManage] 刷新评论列表失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

async function initCommentList() {
  try {
    commentList.value = await fetchAdminComments(searchQuery)
  } catch (error) {
    console.error('[commentManage] 初始化评论列表失败', error)
    adminAlert.error(adminCommentErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void initCommentList()
})
</script>

<style scoped>
/* 文章评论 / 随笔评论切换 */
.comment-manage-tabs {
  display: inline-flex;
  align-self: flex-start;
  gap: 2px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.comment-manage-tab {
  border: none;
  border-radius: 9px;
  padding: 6px 16px;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.comment-manage-tab:hover {
  color: #2563eb;
}

.comment-manage-tab.is-active {
  background: linear-gradient(135deg, #eff6ff, #f8fbff);
  color: #2563eb;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.1);
}

:global(html.dark) .comment-manage-tabs {
  border-color: #334155;
  background: #0f172a;
  box-shadow: none;
}

:global(html.dark) .comment-manage-tab {
  color: #94a3b8;
}

:global(html.dark) .comment-manage-tab:hover {
  color: #7dd3fc;
}

:global(html.dark) .comment-manage-tab.is-active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(37, 99, 235, 0.05));
  color: #7dd3fc;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.1);
}
</style>
