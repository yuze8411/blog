<template>
  <TopNavigation></TopNavigation>

  <!-- 文章加载中 -->
  <div v-if="loading" class="detail-state">
    <span class="detail-spinner" aria-hidden="true"></span>
    <p class="detail-state-text">文章正在赶来…</p>
  </div>

  <!-- 文章不存在 / 加载失败 -->
  <div v-else-if="loadError" class="detail-state">
    <p class="detail-state-title">{{ loadError }}</p>
    <p class="detail-state-text">可以刷新试试，或者先回首页看看其它文章。</p>
    <div class="detail-state-actions">
      <button type="button" class="detail-btn is-primary" @click="loadArticle">重新加载</button>
      <button type="button" class="detail-btn" @click="router.push('/')">返回首页</button>
    </div>
  </div>

  <!-- 正文 -->
  <template v-else-if="virtureData">
    <ArticleData :virtureData="virtureData"></ArticleData>
    <ArticleContent :virtureData="virtureData"></ArticleContent>
  </template>

  <SiteFooter></SiteFooter>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SiteFooter from '@/components/common/SiteFooter.vue'
import { fetchPublicPost, increasePostView } from '@/api/posts'
import { formatDate } from '@/utils/date'
import { countWords } from '@/utils/text'
import type { ArticleDetail } from '@/types'

// 离开详情页时把标签页标题还原，避免回首页后还显示文章名
const DEFAULT_TITLE = '雨落千山 | 个人博客 · 前端开发 · 技术笔记 · 生活记录'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const virtureData = ref<ArticleDetail | null>(null)

// 快速切换文章时只保留最后一次请求，避免旧文章覆盖新文章
let requestId = 0

/** 从地址栏取查询参数，空字符串当作没传 */
function readQuery(name: 'slug' | 'id') {
  const raw = route.query[name]
  return typeof raw === 'string' ? raw.trim() : ''
}

async function loadArticle() {
  const current = ++requestId
  const slug = readQuery('slug')
  const id = readQuery('id')

  if (!slug && !id) {
    loading.value = false
    loadError.value = '没有找到要阅读的文章'
    virtureData.value = null
    return
  }

  loading.value = true
  loadError.value = ''
  virtureData.value = null

  try {
    const post = await fetchPublicPost({
      slug: slug || undefined,
      id: slug ? undefined : id,
    })

    // 请求期间用户已经切到了另一篇文章，这次结果直接丢掉
    if (current !== requestId) return

    if (!post) {
      loadError.value = '这篇文章可能被删除了，或者暂时不可见'
      return
    }

    const content = post.content ?? ''

    virtureData.value = {
      id: post.id,
      coverUrl: post.cover_url || undefined,
      author: '雨落千山',
      category: post.category_name || '未分类',
      wordsNumber: countWords(content),
      publishTime: formatDate(post.published_at ?? post.created_at),
      tags: post.tags ?? [],
      title: post.title,
      commentNum: post.comment_count ?? 0,
      content,
    }

    document.title = `${post.title} - 雨落千山的博客`

    // 浏览量 +1；即使失败也不影响正文阅读，只在控制台留个记录
    if (post.slug) {
      void increasePostView(post.slug).catch((error) => {
        console.warn('[articleDetail] 浏览量自增失败', error)
      })
    }
  } catch (error) {
    if (current !== requestId) return
    console.error('[articleDetail] 加载文章失败', error)
    loadError.value = '文章加载失败了'
  } finally {
    if (current === requestId) loading.value = false
  }
}

onUnmounted(() => {
  document.title = DEFAULT_TITLE
})

// 进入页面时加载；同一页面内切换文章（slug / id 变化）时也重新加载
watch(
  () => [route.query.slug, route.query.id],
  () => {
    window.scrollTo({ top: 0 })
    void loadArticle()
  },
  { immediate: true },
)
</script>

<style scoped>
.detail-state {
  display: flex;
  min-height: calc(100vh - 220px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 24px;
  background: rgb(250, 250, 250);
  text-align: center;
  font-family: 'huoxie', sans-serif;
}

.detail-state-title {
  color: #1f2937;
  font-size: 26px;
  letter-spacing: 1px;
}

.detail-state-text {
  color: #64748b;
  font-size: 17px;
}

.detail-state-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.detail-btn {
  padding: 9px 24px;
  border: 1px solid #d6dfeb;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.detail-btn:hover {
  border-color: #539dfd;
  color: #2f6fbf;
}

.detail-btn.is-primary {
  border-color: #539dfd;
  background: #539dfd;
  color: #fff;
}

.detail-btn.is-primary:hover {
  border-color: #3f8ae6;
  background: #3f8ae6;
  color: #fff;
}

/* 加载圈：纯 CSS，不额外引组件 */
.detail-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(83, 157, 253, 0.18);
  border-top-color: #539dfd;
  border-radius: 50%;
  animation: detail-spin 0.8s linear infinite;
}

@keyframes detail-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 暗色模式 */
:global(html.dark .detail-state) {
  background: #030712;
}

:global(html.dark .detail-state-title) {
  color: #e8eff8;
}

:global(html.dark .detail-state-text) {
  color: #94a3b8;
}

:global(html.dark .detail-btn) {
  border-color: #334155;
  background: #0b1220;
  color: #cbd5e1;
}

:global(html.dark .detail-btn:hover) {
  border-color: #539dfd;
  color: #8ecbff;
}

:global(html.dark .detail-btn.is-primary) {
  border-color: #539dfd;
  background: #539dfd;
  color: #fff;
}

:global(html.dark .detail-btn.is-primary:hover) {
  border-color: #3f8ae6;
  background: #3f8ae6;
}
</style>
