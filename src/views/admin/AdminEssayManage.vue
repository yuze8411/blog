<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <EssayManageHeader class="shrink-0" @keySearch="keywordSearch" @statusSearch="statusSearch" />

    <EssayManageContent
      class="min-h-0 flex-1"
      :rows="essayList?.list"
      :list="essayList"
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
  adminEssayErrorMessage,
  fetchAdminEssays,
  type AdminEssayListResult,
  type AdminEssayQuery,
  type AdminEssayStatusFilter,
} from '@/api/adminEssays'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import EssayManageContent from '@/components/business/admin/manage/essayManage/EssayManageContent.vue'
import EssayManageHeader from '@/components/business/admin/manage/essayManage/EssayManageHeader.vue'

const adminAlert = useAdminAlert()

const essayList = ref<AdminEssayListResult | null>(null)
const loading = ref(true)
const loadingText = ref('获取随笔列表中…')

const searchQuery = reactive<AdminEssayQuery>({
  keyword: '',
  status: 'visible',
  page: 1,
})

let requestId = 0

const STATUS_TEXT: Record<AdminEssayStatusFilter, string> = {
  visible: '显示中的随笔',
  hidden: '隐藏中的随笔',
  all: '全部随笔',
}

function defaultLoadingText() {
  return searchQuery.keyword
    ? `搜索「${searchQuery.keyword}」相关的随笔中…`
    : `获取${STATUS_TEXT[searchQuery.status]}中…`
}

async function loadList(text: string, resetPage = false) {
  if (resetPage) searchQuery.page = 1

  const current = ++requestId
  loadingText.value = text
  loading.value = true

  try {
    const result = await fetchAdminEssays(searchQuery)
    if (current !== requestId) return
    essayList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[essayManage] 获取随笔列表失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    if (current === requestId) loading.value = false
  }
}

function keywordSearch(value: string) {
  const next = value.trim()
  if (next === searchQuery.keyword) return

  searchQuery.keyword = next
  void loadList(
    next ? `搜索「${next}」相关的随笔中…` : `获取${STATUS_TEXT[searchQuery.status]}中…`,
    true,
  )
}

function statusSearch(status: AdminEssayStatusFilter) {
  if (status === searchQuery.status) return

  searchQuery.status = status
  void loadList(
    searchQuery.keyword
      ? `搜索「${searchQuery.keyword}」相关的随笔中…`
      : `获取${STATUS_TEXT[status]}中…`,
    true,
  )
}

function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页随笔中…`)
}

// 删除 / 隐藏后刷新当前页；当前页被清空时自动退回上一页
async function refresh() {
  const current = ++requestId
  loadingText.value = '刷新随笔列表中…'
  loading.value = true

  try {
    let result = await fetchAdminEssays(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminEssays(searchQuery)
    }

    if (current !== requestId) return
    essayList.value = result
  } catch (error) {
    if (current !== requestId) return
    console.error('[essayManage] 刷新随笔列表失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    if (current === requestId) loading.value = false
  }
}

onMounted(() => {
  void loadList(defaultLoadingText())
})
</script>

<style scoped></style>
