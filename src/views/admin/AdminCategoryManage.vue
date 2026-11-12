<template>
  <div class="relative flex h-full w-full flex-col gap-3">
    <CategoryManageHeader class="shrink-0" @keySearch="keywordSearch" />

    <CategoryManageContent
      class="min-h-0 flex-1"
      :categories="categories"
      :keyword="keyword"
      @refresh="refresh"
    />

    <AdminLoding overlay v-if="loading" :text="loadingText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  adminCategoryErrorMessage,
  fetchAdminCategories,
  type AdminCategoryRow,
} from '@/api/adminCategories'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import CategoryManageContent from '@/components/business/admin/manage/categoryManage/CategoryManageContent.vue'
import CategoryManageHeader from '@/components/business/admin/manage/categoryManage/CategoryManageHeader.vue'

const adminAlert = useAdminAlert()

const categories = ref<AdminCategoryRow[] | null>(null)
const keyword = ref('')
const loading = ref(true)
const loadingText = ref('获取分类数据中...')

async function loadList(text: string) {
  loadingText.value = text
  loading.value = true

  try {
    categories.value = await fetchAdminCategories(keyword.value)
  } catch (error) {
    console.error('[categoryManage] 获取分类列表失败', error)
    adminAlert.error(adminCategoryErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function keywordSearch(value: string) {
  const next = value.trim()
  if (next === keyword.value) return

  keyword.value = next
  void loadList(next ? `搜索「${next}」相关的分类中...` : '获取全部分类中...')
}

// 新增 / 编辑 / 删除成功后刷新当前列表
function refresh() {
  void loadList('刷新分类列表中...')
}

onMounted(() => {
  void loadList('获取分类数据中...')
})
</script>

<style scoped></style>
