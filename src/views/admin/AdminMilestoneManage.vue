<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <MilestoneManageHeader
      class="shrink-0"
      @keySearch="keywordSearch"
      @statusSearch="statusSearch"
    />

    <MilestoneManageContent
      class="min-h-0 flex-1"
      :rows="milestoneList?.list"
      :list="milestoneList"
      :current-page="searchQuery.page"
      :keyword="searchQuery.keyword"
      :status="searchQuery.status"
      @page-jump="pageJump"
      @refresh="refresh"
    />

    <AdminLoding overlay v-if="loading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  adminMilestoneErrorMessage,
  fetchAdminMilestones,
  type AdminMilestoneListResult,
  type AdminMilestoneQuery,
  type AdminMilestoneStatusFilter,
} from '@/api/adminMilestones'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import MilestoneManageContent from '@/components/business/admin/manage/milestoneManage/MilestoneManageContent.vue'
import MilestoneManageHeader from '@/components/business/admin/manage/milestoneManage/MilestoneManageHeader.vue'

const adminAlert = useAdminAlert()

const milestoneList = ref<AdminMilestoneListResult | null>(null)
const loading = ref(true)
const loadingText = ref('获取时光轴文章中...')

const searchQuery = reactive<AdminMilestoneQuery>({
  keyword: '',
  status: 'visible',
  page: 1,
})

/** 只接受最后一次请求的结果，避免快速切换筛选时旧结果覆盖新结果 */
let requestId = 0

const STATUS_TEXT: Record<AdminMilestoneStatusFilter, string> = {
  visible: '展示中的时光轴文章',
  hidden: '隐藏中的时光轴文章',
  all: '全部时光轴文章',
}

function defaultLoadingText() {
  return searchQuery.keyword
    ? `搜索「${searchQuery.keyword}」相关的时光轴文章中...`
    : `获取${STATUS_TEXT[searchQuery.status]}中...`
}

async function loadList(text: string, resetPage = false) {
  if (resetPage) searchQuery.page = 1

  const current = ++requestId
  loadingText.value = text
  loading.value = true

  try {
    const result = await fetchAdminMilestones(searchQuery)
    if (current !== requestId) return
    milestoneList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[milestoneManage] 获取时光轴文章失败', error)
    adminAlert.error(adminMilestoneErrorMessage(error))
  } finally {
    if (current === requestId) loading.value = false
  }
}

function keywordSearch(value: string) {
  const next = value.trim()
  if (next === searchQuery.keyword) return

  searchQuery.keyword = next
  void loadList(
    next ? `搜索「${next}」相关的时光轴文章中...` : `获取${STATUS_TEXT[searchQuery.status]}中...`,
    true,
  )
}

function statusSearch(status: AdminMilestoneStatusFilter) {
  if (status === searchQuery.status) return

  searchQuery.status = status
  void loadList(
    searchQuery.keyword
      ? `搜索「${searchQuery.keyword}」相关的时光轴文章中...`
      : `获取${STATUS_TEXT[status]}中...`,
    true,
  )
}

function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页时光轴文章中...`)
}

// 添加 / 隐藏 / 移除后刷新；当前页被清空时自动退回上一页
async function refresh() {
  const current = ++requestId
  loadingText.value = '刷新时光轴文章中...'
  loading.value = true

  try {
    let result = await fetchAdminMilestones(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminMilestones(searchQuery)
    }

    if (current !== requestId) return
    milestoneList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[milestoneManage] 刷新时光轴文章失败', error)
    adminAlert.error(adminMilestoneErrorMessage(error))
  } finally {
    if (current === requestId) loading.value = false
  }
}

onMounted(() => {
  void loadList('获取展示中的时光轴文章中...')
})
</script>

<style scoped></style>
