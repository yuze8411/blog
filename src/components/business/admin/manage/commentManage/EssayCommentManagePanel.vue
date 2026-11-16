<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <EssayCommentManageHeader
      class="shrink-0"
      @keySearch="keywordSearch"
      @dataSearch="dataRangeSearch"
      @statusSearch="statusSearch"
    />

    <EssayCommentManageContent
      class="min-h-0 flex-1"
      :comment-list="commentList"
      :searchquery="searchQuery"
      @page-jump="pageJump"
      @refresh="refreshCommentList"
    />

    <AdminLoding overlay v-if="isLoading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  adminEssayCommentErrorMessage,
  fetchAdminEssayComments,
  type AdminEssayCommentListResult,
  type AdminEssayCommentStatusFilter,
} from '@/api/adminEssayComments'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import EssayCommentManageContent from './EssayCommentManageContent.vue'
import EssayCommentManageHeader from './EssayCommentManageHeader.vue'
import type { EssayCommentSearchState } from './types'

const adminAlert = useAdminAlert()

const commentList = ref<AdminEssayCommentListResult | null>(null)
const isLoading = ref(true)
const loadingText = ref('获取随笔评论中…')

const searchQuery = reactive<EssayCommentSearchState>({
  keyword: '',
  status: 'pending',
  year: null,
  month: null,
  page: 1,
})

let requestId = 0

const STATUS_LABEL: Record<AdminEssayCommentStatusFilter, string> = {
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

  const current = ++requestId
  loadingText.value = text
  isLoading.value = true

  try {
    const result = await fetchAdminEssayComments(searchQuery)
    if (current !== requestId) return
    commentList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[essayCommentManage] 获取随笔评论失败', error)
    adminAlert.error(adminEssayCommentErrorMessage(error))
  } finally {
    if (current === requestId) isLoading.value = false
  }
}

function keywordSearch(keyword: string) {
  const next = keyword.trim()
  if (next === searchQuery.keyword) return

  searchQuery.keyword = next
  void loadList(next ? `搜索「${next}」相关的随笔评论中…` : '获取全部随笔评论中…', true)
}

function dataRangeSearch(time: { year: number | null; month: number | null }) {
  if (time.year === searchQuery.year && time.month === searchQuery.month) return

  searchQuery.year = time.year
  searchQuery.month = time.month
  void loadList(`搜索${timePhrase(time.year, time.month)}随笔评论中…`, true)
}

function statusSearch(status: AdminEssayCommentStatusFilter) {
  if (status === searchQuery.status) return

  searchQuery.status = status
  const label = STATUS_LABEL[status] ?? '随笔评论'
  void loadList(status === 'all' ? '获取全部随笔评论中…' : `搜索${label}的随笔评论中…`, true)
}

function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页随笔评论中…`)
}

async function refreshCommentList() {
  const current = ++requestId
  loadingText.value = '刷新随笔评论中…'
  isLoading.value = true

  try {
    let result = await fetchAdminEssayComments(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminEssayComments(searchQuery)
    }

    if (current !== requestId) return
    commentList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[essayCommentManage] 刷新随笔评论失败', error)
    adminAlert.error(adminEssayCommentErrorMessage(error))
  } finally {
    if (current === requestId) isLoading.value = false
  }
}

onMounted(() => {
  void loadList('获取待审核随笔评论中…')
})
</script>

<style scoped></style>
