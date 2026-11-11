<template>
  <div
    ref="rootRef"
    class="w-full md:w-[90%] lg:w-[67%] xl:w-[72%] mx-auto transition-width"
  >
    <HomeContentLeftBanner v-reveal></HomeContentLeftBanner>

    <!-- 加载中：骨架屏和真实卡片差不多高，翻页时页面不会猛地上下跳 -->
    <div v-if="loading" class="mt-3 space-y-3" aria-busy="true" aria-label="文章加载中">
      <div
        v-for="n in 3"
        :key="n"
        class="article-skeleton"
        :class="{ 'is-reverse': n % 2 === 0 }"
      >
        <div class="skeleton-cover"></div>
        <div class="skeleton-body">
          <div class="skeleton-line is-title w-3/5"></div>
          <div class="skeleton-line mt-5 w-full"></div>
          <div class="skeleton-line mt-3 w-[92%]"></div>
          <div class="skeleton-line mt-3 w-4/5"></div>
          <div class="skeleton-line mt-9 w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- 加载失败：给个明确的重新加载入口，别只留一片空白 -->
    <div v-else-if="loadError" class="state-card">
      <p class="state-title">{{ loadError }}</p>
      <p class="state-desc">网络恢复后可以再试一次，文章不会丢的。</p>
      <button type="button" class="state-btn" @click="loadPosts()">重新加载</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!articleList.length" class="state-card">
      <p class="state-title">这里还空着</p>
      <p class="state-desc">博主正在努力写第一篇，过段时间再来看看吧～</p>
    </div>

    <!-- 真实文章列表 -->
    <template v-else>
      <div ref="listRef">
        <div v-for="(item, index) of articleList" :key="item.textId" v-reveal="index * 90">
          <HomeContentLeftBox
            :article="item"
            :index="index"
            @open="openArticle(item)"
          ></HomeContentLeftBox>
        </div>
      </div>

      <HomeContentLeftPages
        v-if="total > pageSize"
        :total="total"
        :page-size="pageSize"
        :model-value="page"
        @change="changePage"
      ></HomeContentLeftPages>
    </template>
  </div>
</template>

<script setup lang="ts">
// 首页左侧内容：轮播图 + 文章列表 + 分页
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPublicPosts, type PublicPost } from '@/api/posts'
import { vReveal } from '@/directives/reveal'
import { formatDate } from '@/utils/date'
import type { Article } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

const PAGE_SIZE = 10
// 模板里也用它渲染分页条，单独起个可读的名字
const pageSize = PAGE_SIZE

const route = useRoute()
const router = useRouter()

const articleList = ref<Article[]>([])
const total = ref(0)
const page = ref(readPageFromQuery())
const loading = ref(true)
const loadError = ref('')
const rootRef = ref<HTMLElement>()
const listRef = ref<HTMLElement>()

// 快速连续翻页时，只认最后一次请求的结果，避免旧数据把新数据盖掉
let requestId = 0

function readPageFromQuery() {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : 1
}

/** 把数据库里的文章行转换成首页卡片需要的数据 */
function toArticle(row: PublicPost): Article {
  return {
    textId: row.id,
    slug: row.slug,
    coverSrc: row.cover_url || fallbackCover,
    title: row.title,
    content: row.excerpt?.trim() || '这篇文章暂时还没有摘要，点进来看看吧～',
    time: formatDate(row.published_at ?? row.created_at),
    comment: row.comment_count ?? 0,
    eyes: row.view_count ?? 0,
    tags: row.tags ?? [],
    category: row.category_name ?? undefined,
  }
}

async function loadPosts(targetPage = page.value) {
  const current = ++requestId
  loading.value = true
  loadError.value = ''

  try {
    const res = await fetchPublicPosts(targetPage, PAGE_SIZE)
    if (current !== requestId) return

    articleList.value = res.list.map(toArticle)
    total.value = res.total

    // 地址栏里的页码可能超出范围（比如文章被删了），自动退回最后一页
    const lastPage = Math.max(1, Math.ceil(res.total / PAGE_SIZE))
    if (!res.list.length && targetPage > lastPage) {
      page.value = lastPage
      await router.replace({
        query: { ...route.query, page: lastPage > 1 ? String(lastPage) : undefined },
      })
      await loadPosts(lastPage)
      return
    }

    page.value = targetPage
  } catch (error) {
    if (current !== requestId) return
    console.error('[home] 加载文章列表失败', error)
    articleList.value = []
    total.value = 0
    loadError.value = '文章加载失败了'
  } finally {
    if (current === requestId) loading.value = false
  }
}

/** 翻页：同步地址栏页码（刷新、前进后退都能回到同一页），再重新取数据 */
async function changePage(next: number) {
  if (next === page.value || loading.value) return

  page.value = next
  scrollToList()
  void router.replace({
    query: { ...route.query, page: next > 1 ? String(next) : undefined },
  })
  await loadPosts(next)
}

/** 点击卡片进入详情页，优先使用更好看的 slug */
function openArticle(article: Article) {
  void router.push({
    name: 'articleDetail',
    query: article.slug ? { slug: article.slug } : { id: article.textId },
  })
}

/** 翻页后回到列表顶部，别让用户还停在上一页的底部 */
function scrollToList() {
  const target = listRef.value ?? rootRef.value
  if (!target) return

  const top = target.getBoundingClientRect().top + window.scrollY - 90
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

// 浏览器前进/后退切换页码时，跟着重新加载（changePage 自己改地址栏时页码没变，会自动跳过）
watch(
  () => route.query.page,
  () => {
    const next = readPageFromQuery()
    if (next === page.value) return
    page.value = next
    scrollToList()
    // 即使上一次请求还没回来也继续：loadPosts 内部会用 requestId 丢掉旧结果
    void loadPosts(next)
  },
)

onMounted(() => {
  void loadPosts()
})
</script>

<style scoped>
/* ---------- 骨架屏：浅色页面用白卡片，暗色模式再换回深色 ---------- */
.article-skeleton {
  display: flex;
  height: 280px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e9eef5;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.article-skeleton.is-reverse {
  flex-direction: row-reverse;
}

.skeleton-cover {
  width: 40%;
  background: linear-gradient(110deg, #eef2f7 8%, #fafcff 18%, #eef2f7 33%);
  background-size: 220% 100%;
  animation: shimmer 1.6s linear infinite;
}

.skeleton-body {
  flex: 1;
  min-width: 0;
  padding: 30px 28px;
}

.skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: #edf1f6;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line.is-title {
  height: 26px;
}

@keyframes shimmer {
  from {
    background-position: 120% 0;
  }

  to {
    background-position: -120% 0;
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

/* 小屏幕下卡片本来就不显示封面，骨架屏也跟着收起来 */
@media (max-width: 1023px) {
  .skeleton-cover {
    display: none;
  }
}

/* ---------- 加载失败 / 空状态 ---------- */
.state-card {
  margin-top: 12px;
  padding: 54px 24px;
  border: 1px solid #e9eef5;
  border-radius: 10px;
  background: #fff;
  text-align: center;
  font-family: 'huoxie', sans-serif;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.state-title {
  color: #334155;
  font-size: 22px;
  letter-spacing: 1px;
}

.state-desc {
  margin-top: 10px;
  color: #94a3b8;
  font-size: 16px;
}

.state-btn {
  margin-top: 22px;
  padding: 9px 26px;
  border: 1px solid rgba(83, 157, 253, 0.45);
  border-radius: 999px;
  background: #f0f7ff;
  color: #2f6fbf;
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.state-btn:hover {
  border-color: rgba(83, 157, 253, 0.75);
  background: #e3f1ff;
}

/* ---------- 暗色模式 ---------- */
:global(html.dark .article-skeleton) {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.62);
  box-shadow: none;
}

:global(html.dark .skeleton-cover) {
  background: linear-gradient(
    110deg,
    rgba(148, 163, 184, 0.14) 8%,
    rgba(148, 163, 184, 0.24) 18%,
    rgba(148, 163, 184, 0.14) 33%
  );
  background-size: 220% 100%;
}

:global(html.dark .skeleton-line) {
  background: rgba(148, 163, 184, 0.18);
}

:global(html.dark .state-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.55);
  box-shadow: none;
}

:global(html.dark .state-title) {
  color: #e2e8f0;
}

:global(html.dark .state-desc) {
  color: #94a3b8;
}

:global(html.dark .state-btn) {
  border-color: rgba(83, 157, 253, 0.45);
  background: rgba(83, 157, 253, 0.12);
  color: #8ecbff;
}

:global(html.dark .state-btn:hover) {
  border-color: rgba(83, 157, 253, 0.75);
  background: rgba(83, 157, 253, 0.2);
}
</style>
