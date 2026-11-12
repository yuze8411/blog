<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <MessageManageHeader
      class="shrink-0"
      @keySearch="keywordSearch"
      @dataSearch="dataRangeSearch"
      @statusSearch="statusSearch"
    />

    <MessageManageContent
      class="min-h-0 flex-1"
      :messageList="messageList"
      :searchquery="searchQuery"
      @pageJump="pageJump"
      @refresh="refreshMessageList"
    />

    <AdminLoding overlay v-if="isLoading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  adminMessageErrorMessage,
  fetchAdminMessages,
  type AdminMessageListResult,
  type AdminMessageStatusFilter,
} from '@/api/adminMessages'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import MessageManageContent from '@/components/business/admin/manage/messageManage/MessageManageContent.vue'
import MessageManageHeader from '@/components/business/admin/manage/messageManage/MessageManageHeader.vue'
import type { MessageSearchState } from '@/components/business/admin/manage/messageManage/types'

const adminAlert = useAdminAlert()

const messageList = ref<AdminMessageListResult | null>(null)
const isLoading = ref(true)
const loadingText = ref('获取留言数据中...')

/** 默认落在「待审核」，打开后台先处理需要审核的留言 */
const searchQuery = reactive<MessageSearchState>({
  keyword: '',
  status: 'pending',
  year: null,
  month: null,
  page: 1,
})

const STATUS_LABEL: Record<AdminMessageStatusFilter, string> = {
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
    messageList.value = await fetchAdminMessages(searchQuery)
  } catch (error) {
    console.error('[messageManage] 获取留言列表失败', error)
    adminAlert.error(adminMessageErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

// 关键字搜索
function keywordSearch(keyword: string) {
  if (keyword === searchQuery.keyword) return
  searchQuery.keyword = keyword
  const tip = keyword.trim() ? `「${keyword.trim()}」相关的留言中...` : '全部留言中...'
  void loadList(`搜索 ${tip}`, true)
}

// 创建时间范围搜索
function dataRangeSearch(time: { year: number | null; month: number | null }) {
  if (time.year === searchQuery.year && time.month === searchQuery.month) return
  searchQuery.year = time.year
  searchQuery.month = time.month
  void loadList(`搜索${timePhrase(time.year, time.month)}留言中...`, true)
}

// 审核状态搜索
function statusSearch(status: AdminMessageStatusFilter) {
  if (status === searchQuery.status) return
  searchQuery.status = status
  const label = STATUS_LABEL[status] ?? '留言'
  void loadList(status === 'all' ? '获取全部留言中...' : `搜索${label}的留言中...`, true)
}

// 换页：分页条已经把页码算好了，这里只更新状态并重新取当前页数据
function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页留言数据中...`)
}

// 通过 / 隐藏 / 删除之后刷新当前页；如果这页被处理空了，自动退回上一页
async function refreshMessageList() {
  loadingText.value = '刷新留言列表中...'
  isLoading.value = true

  try {
    let result = await fetchAdminMessages(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminMessages(searchQuery)
    }
    messageList.value = result
  } catch (error) {
    console.error('[messageManage] 刷新留言列表失败', error)
    adminAlert.error(adminMessageErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

async function initMessageList() {
  try {
    messageList.value = await fetchAdminMessages(searchQuery)
  } catch (error) {
    console.error('[messageManage] 初始化留言列表失败', error)
    adminAlert.error(adminMessageErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void initMessageList()
})
</script>

<style scoped></style>
