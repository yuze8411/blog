<template>
  <div class="flex h-full w-full flex-col gap-3 relative">
    <ArticleManageHeader
      class="shrink-0"
      @keySearch="keywordSearch"
      @dataSearch="dataRangeSearch"
      @statusSearch="statusSearch"
    ></ArticleManageHeader>
    <ArticleManageContent
      class="min-h-0 flex-1"
      :articleList="articleList"
      :searchquery="search_query"
      @pageJump="pageJump"
      @refresh="refreshArticleList"
    ></ArticleManageContent>
    <AdminLoding overlay v-if="isLoding" :text="lodingtext"></AdminLoding>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'

const adminAlert = useAdminAlert()

let articleList = ref() // 文章列表
let search_query = ref({
  search_keyword: '',
  status: 'published',
  year: null,
  month: 0,
  page: 1,
})
let searchquery = computed(() => {
  return {
    keyword: search_query.value.search_keyword,
    status: search_query.value.status,
    page: search_query.value.page,
    year: search_query.value.year,
    month: search_query.value.month,
  }
})
let lodingtext = ref('获取文章数据中...')
let isLoding = ref(true)

// 关键字搜索
async function keywordSearch(keyword: string) {
  if (keyword == search_query.value.search_keyword) return
  search_query.value.search_keyword = keyword
  // 搜索请求..
  lodingtext.value = `搜索 ${search_query.value.search_keyword} 相关的文章中...`
  isLoding.value = true
  search_query.value.page = 1
  let res = await fetchArticleList(searchquery.value)
  articleList.value = res
  isLoding.value = false
}
// 创建时间范围搜索
async function dataRangeSearch(time: { year: number | null; month: number | null }) {
  if (time.year == search_query.value.year && time.month == search_query.value.month) return
  ;(search_query.value.year as number | null) = time.year
  ;(search_query.value.month as number | null) = time.month

  // 年月范围搜索
  lodingtext.value = `搜索${search_query.value.year == null ? '全部时间段的' : search_query.value.year + '年' + search_query.value.month + '月的时间段发布的'}文章中...`
  isLoding.value = true
  search_query.value.page = 1
  let res = await fetchArticleList(searchquery.value)
  articleList.value = res
  isLoding.value = false
}
// 文章展示状态搜索
async function statusSearch(statusS: string) {
  if (statusS == search_query.value.status) return
  search_query.value.status = statusS
  // 状态改变搜索
  lodingtext.value = `搜索 ${search_query.value.status} 状态的文章中...`
  isLoding.value = true
  search_query.value.page = 1
  let res = await fetchArticleList(searchquery.value)
  articleList.value = res
  isLoding.value = false
}
// 删除 / 隐藏之后刷新当前页；如果这页被删空了，自动退回上一页
async function refreshArticleList() {
  lodingtext.value = '刷新文章列表中...'
  isLoding.value = true

  try {
    let res = await fetchArticleList(searchquery.value)
    if (!res.list.length && search_query.value.page > 1) {
      search_query.value.page -= 1
      res = await fetchArticleList(searchquery.value)
    }
    articleList.value = res
  } catch (error) {
    console.error('[articleManage] 刷新文章列表失败', error)
    adminAlert.error('刷新文章列表失败，请稍后重试')
  } finally {
    isLoding.value = false
  }
}

// 换页：分页条已经把页码算好了，这里只更新状态并重新取当前页数据
async function pageJump(page: number) {
  if (page === search_query.value.page) return
  search_query.value.page = page
  lodingtext.value = `加载第 ${page} 页文章数据中...`
  isLoding.value = true
  let res = await fetchArticleList(searchquery.value)
  articleList.value = res
  isLoding.value = false
}

interface ArticleQuery {
  keyword: string
  status: string
  year: number | null
  month: number | null
  page: number
}

// 获取博客列表
async function fetchArticleList(params: ArticleQuery) {
  const PAGE_SIZE = 10
  const from = (params.page - 1) * PAGE_SIZE
  // 构造请求
  let query = supabase
    .from('posts')
    .select(
      'id, title, slug , excerpt , cover_url, created_at, updated_at, is_published, is_visible, view_count, categories(id, name), post_tags(tags(id, name))',
      { count: 'exact' },
    )

  // 状态 .eq 类似sql里where的等号判断条件
  if (params.status === 'published') query = query.eq('is_published', true).eq('is_visible', true)
  else if (params.status === 'unpublished') query = query.eq('is_published', false)
  else if (params.status === 'banned')
    query = query.eq('is_published', true).eq('is_visible', false)

  // 关键字
  const safe = params.keyword.trim().replace(/[,()%\\]/g, ' ')
  if (safe) query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%`)

  // 时间
  if (params.year !== null) {
    const start = new Date(params.year, (params.month ?? 1) - 1, 1)
    const end =
      params.month === null
        ? new Date(params.year + 1, 0, 1)
        : new Date(params.year, params.month, 1)
    query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error
  return { list: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE }
}

// 初始化文章列表数据
async function initArticleList() {
  let res = await fetchArticleList({
    keyword: '',
    status: 'published',
    year: null,
    month: 1,
    page: 1,
  })
  articleList.value = res
  isLoding.value = false
}
onMounted(() => {
  initArticleList()
})
</script>

<style scoped></style>
