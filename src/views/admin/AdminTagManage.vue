<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <TagManageHeader class="shrink-0" @keySearch="keywordSearch" />

    <TagManageContent
      class="min-h-0 flex-1"
      :tags="tagList?.list"
      :list="tagList"
      :current-page="searchQuery.page"
      :keyword="searchQuery.keyword"
      @pageJump="pageJump"
      @refresh="refresh"
    />

    <AdminLoding overlay v-if="loading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminTagErrorMessage, fetchAdminTags, type AdminTagListResult } from '@/api/adminTags'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import TagManageContent from '@/components/business/admin/manage/tagManage/TagManageContent.vue'
import TagManageHeader from '@/components/business/admin/manage/tagManage/TagManageHeader.vue'

const adminAlert = useAdminAlert()

const tagList = ref<AdminTagListResult | null>(null)
const loading = ref(true)
const loadingText = ref('获取标签数据中...')

const searchQuery = reactive({
  keyword: '',
  page: 1,
})

async function loadList(text: string, resetPage = false) {
  if (resetPage) searchQuery.page = 1
  loadingText.value = text
  loading.value = true

  try {
    tagList.value = await fetchAdminTags(searchQuery)
  } catch (error) {
    console.error('[tagManage] 获取标签列表失败', error)
    adminAlert.error(adminTagErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function keywordSearch(value: string) {
  const next = value.trim()
  if (next === searchQuery.keyword) return

  searchQuery.keyword = next
  void loadList(next ? `搜索「${next}」相关的标签中...` : '获取全部标签中...', true)
}

function pageJump(page: number) {
  if (page === searchQuery.page) return
  searchQuery.page = page
  void loadList(`加载第 ${page} 页标签数据中...`)
}

// 新增 / 重命名 / 删除后刷新；这页被删空了就自动退回上一页
async function refresh() {
  loadingText.value = '刷新标签列表中...'
  loading.value = true

  try {
    let result = await fetchAdminTags(searchQuery)
    if (!result.list.length && searchQuery.page > 1) {
      searchQuery.page -= 1
      result = await fetchAdminTags(searchQuery)
    }
    tagList.value = result
  } catch (error) {
    console.error('[tagManage] 刷新标签列表失败', error)
    adminAlert.error(adminTagErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function initTagList() {
  try {
    tagList.value = await fetchAdminTags(searchQuery)
  } catch (error) {
    console.error('[tagManage] 初始化标签列表失败', error)
    adminAlert.error(adminTagErrorMessage(error))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void initTagList()
})
</script>

<style scoped></style>
