<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <TravelManageHeader class="shrink-0" @keySearch="keywordSearch" @dataSearch="dataSearch" />

    <TravelManageContent
      class="min-h-0 flex-1"
      :photos="travelList?.list"
      :list="travelList"
      :current-page="searchQuery.page"
      :keyword="searchQuery.keyword"
      :year="searchQuery.year"
      :month="searchQuery.month"
      @pageJump="pageJump"
      @refresh="refresh"
    />

    <AdminLoding overlay v-if="loading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  adminTravelErrorMessage,
  fetchAdminTravel,
  type AdminTravelListResult,
  type AdminTravelQuery,
} from '@/api/adminTravel'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import TravelManageContent from '@/components/business/admin/manage/travelManage/TravelManageContent.vue'
import TravelManageHeader from '@/components/business/admin/manage/travelManage/TravelManageHeader.vue'

const adminAlert = useAdminAlert()

const travelList = ref<AdminTravelListResult | null>(null)
const loading = ref(true)
const loadingText = ref('获取游记照片中...')

const searchQuery = reactive<AdminTravelQuery>({
  keyword: '',
  year: null,
  month: null,
  page: 1,
})

/** 把年份、月份拼成好读的文字，用在加载提示里 */
function timeText(year: number | null, month: number | null) {
  if (year === null) return ''
  return month === null ? `${year} 年` : `${year} 年 ${month} 月`
}

async function loadList(text: string, resetPage = false) {
  if (resetPage) searchQuery.page = 1
  loadingText.value = text
  loading.value = true

  try {
    travelList.value = await fetchAdminTravel(searchQuery)
  } catch (error) {
    console.error('[travelManage] 获取游记照片失败', error)
    adminAlert.error(adminTravelErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function keywordSearch(value: string) {
  const next = value.trim()
  if (next === searchQuery.keyword) return

  searchQuery.keyword = next
  void loadList(next ? `搜索「${next}」相关的照片中...` : '获取全部游记照片中...', true)
}

function dataSearch(time: { year: number | null; month: number | null }) {
  if (time.year === searchQuery.year && time.month === searchQuery.month) return

  searchQuery.year = time.year
  searchQuery.month = time.month

  const text = timeText(time.year, time.month)
  void loadList(text ? `筛选${text}的照片中...` : '获取全部游记照片中...', true)
}

function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页照片中...`)
}

// 新增 / 编辑 / 删除后刷新；这页被删空了就自动退回上一页
async function refresh() {
  loadingText.value = '刷新游记照片中...'
  loading.value = true

  try {
    let result = await fetchAdminTravel(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminTravel(searchQuery)
    }
    travelList.value = result
  } catch (error) {
    console.error('[travelManage] 刷新游记照片失败', error)
    adminAlert.error(adminTravelErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function initTravelList() {
  try {
    travelList.value = await fetchAdminTravel(searchQuery)
  } catch (error) {
    console.error('[travelManage] 初始化游记照片失败', error)
    adminAlert.error(adminTravelErrorMessage(error))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void initTravelList()
})
</script>

<style scoped></style>
