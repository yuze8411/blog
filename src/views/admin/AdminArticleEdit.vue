<template>
  <div class="flex h-full min-h-0 w-full flex-col gap-3 lg:flex-row lg:gap-4">
    <!-- 左侧主区域：手动写作 = 编辑 + 预览；AI 写作 = 预览 + 聊天 -->
    <section class="min-h-0 min-w-0 flex-1">
      <Transition name="article-mode" mode="out-in">
        <div
          v-if="!aiMode"
          key="manual"
          class="flex h-full min-h-0 flex-col gap-3 xl:flex-row xl:gap-4"
        >
          <ArticleEditorPanel v-model="article.content" class="min-h-[320px] flex-1 xl:min-h-0" />
          <ArticlePreviewPanel
            :content="article.content"
            :title="article.title"
            class="min-h-[320px] flex-1 xl:min-h-0"
          />
        </div>

        <div v-else key="ai" class="flex h-full min-h-0 flex-col gap-3 xl:flex-row xl:gap-4">
          <ArticlePreviewPanel
            :content="article.content"
            :title="article.title"
            :streaming="aiBusy"
            :mode="aiStreamMode"
            class="min-h-[320px] flex-[3] xl:min-h-0"
          />
          <AiChatPanel
            :messages="aiMessages"
            :busy="aiBusy"
            :mode="aiStreamMode"
            class="min-h-[380px] flex-[2] xl:min-h-0"
            @send="handleAiSend"
            @stop="stopAi"
          />
        </div>
      </Transition>
    </section>

    <!-- 右侧操作区：两种模式都保留 -->
    <ArticleActionPanel
      :key="editorEpoch"
      v-model:title="article.title"
      v-model:slug="article.slug"
      v-model:excerpt="article.excerpt"
      v-model:cover="article.cover_url"
      v-model:category="article.category_id"
      v-model:chosen="selectedTags"
      v-model:uploading="coverUploading"
      :categories="categories"
      :tags="tags"
      :ai-mode="aiMode"
      :saving="savingDraft"
      :publishing="publishing"
      :generating-excerpt="generatingExcerpt"
      class="min-h-[520px] w-full shrink-0 lg:min-h-0 lg:w-[332px]"
      @publish="saveArticle(true)"
      @draft="saveArticle(false)"
      @open-drafts="openDrafts"
      @back="goBack"
      @toggle-ai="toggleAiMode"
      @generate-excerpt="generateExcerpt"
    />

    <!-- 草稿箱抽屉 -->
    <DraftDrawer
      v-model="draftVisible"
      :drafts="drafts"
      :loading="draftLoading"
      @load="loadDraft"
      @refresh="fetchDrafts"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import { streamDeepSeek } from '@/api/deepseek'
import type { DeepSeekMessage } from '@/api/deepseek'
import ArticleEditorPanel from '@/components/business/admin/articleEdit/ArticleEditorPanel.vue'
import ArticlePreviewPanel from '@/components/business/admin/articleEdit/ArticlePreviewPanel.vue'
import ArticleActionPanel from '@/components/business/admin/articleEdit/ArticleActionPanel.vue'
import AiChatPanel from '@/components/business/admin/articleEdit/AiChatPanel.vue'
import DraftDrawer from '@/components/business/admin/articleEdit/DraftDrawer.vue'
import type {
  AiChatMessage,
  ArticleForm,
  CategoryOption,
  DraftItem,
  TagOption,
} from '@/components/business/admin/articleEdit/types'

const route = useRoute()
const router = useRouter()
const adminAlert = useAdminAlert()

/** 当前正在编辑的文章，字段对应 posts 表 */
const article = reactive<ArticleForm>({
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  cover_url: '',
  category_id: null,
  content: '',
  is_visible: true,
})

const categories = ref<CategoryOption[]>([])
const tags = ref<TagOption[]>([])
// 已有标签存数字 id；手写的新标签在保存前还是字符串
const selectedTags = ref<Array<number | string>>([])

// 保存状态
const savingDraft = ref(false)
const publishing = ref(false)
const coverUploading = ref(false)
// 保存成功后换一个 key，让右侧表单整体重置（顺便清掉封面里没上传的本地图）
const editorEpoch = ref(0)

// AI 写作状态
const aiMode = ref(false)
const aiBusy = ref(false)
const aiStreamMode = ref<'modify' | 'rewrite' | null>(null)
const aiMessages = ref<AiChatMessage[]>([])
let aiController: AbortController | null = null
let messageId = 0

// AI 摘要
const generatingExcerpt = ref(false)
let excerptController: AbortController | null = null

// 草稿箱
const draftVisible = ref(false)
const draftLoading = ref(false)
const drafts = ref<DraftItem[]>([])

onMounted(async () => {
  await fetchMeta()

  // 从文章管理点「编辑」进来时，URL 上会带 ?id=xxx
  const id = route.query.id
  if (typeof id === 'string' && id) await loadPost(id)
})

onBeforeUnmount(() => {
  aiController?.abort()
  excerptController?.abort()
})

/** 分类和标签都是公开可读的，进页面时一次取回来 */
async function fetchMeta() {
  const [categoryResult, tagResult] = await Promise.all([
    supabase.from('categories').select('id, name').order('sort_order'),
    supabase.from('tags').select('id, name').order('name'),
  ])

  if (categoryResult.error) console.error('[articleEdit] 分类加载失败', categoryResult.error)
  if (tagResult.error) console.error('[articleEdit] 标签加载失败', tagResult.error)

  categories.value = categoryResult.data ?? []
  tags.value = tagResult.data ?? []
}

/**
 * 保存文章。
 * publish = true 发布（is_published = true，published_at 必须有值）
 * publish = false 存草稿（is_published = false，published_at 置空）
 */
async function saveArticle(publish: boolean) {
  // 连点两次时，第二次还没等到按钮变成 loading，这里兜一下底
  if (savingDraft.value || publishing.value) return

  if (aiBusy.value) {
    adminAlert.warning('AI 正在写文章，等它写完再保存吧')
    return
  }
  if (generatingExcerpt.value) {
    adminAlert.warning('摘要还在生成中，稍等一下再保存')
    return
  }
  if (coverUploading.value) {
    adminAlert.warning('封面还在上传，等它传完再保存')
    return
  }

  const title = article.title.trim()
  const content = article.content.trim()

  if (!title) return adminAlert.warning('先给文章起个标题')
  if (!content) return adminAlert.warning('正文还是空的，写点内容再保存')
  if (article.category_id === null) return adminAlert.warning('请选择文章分类')

  publishing.value = publish
  savingDraft.value = !publish

  try {
    const slug = article.slug.trim() || `post-${Date.now().toString(36)}`
    const payload = {
      title,
      slug,
      excerpt: article.excerpt.trim() || buildExcerpt(content),
      content,
      cover_url: article.cover_url.trim() || null,
      category_id: article.category_id,
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
      // 编辑隐藏文章时保持隐藏，别因为保存又把它放回前台
      is_visible: article.is_visible,
    }

    let postId = article.id

    if (postId) {
      // 已经在编辑某篇草稿：更新
      const { error } = await supabase.from('posts').update(payload).eq('id', postId)
      if (error) throw error
    } else {
      // 新文章：插入并拿回 id
      const { data, error } = await supabase.from('posts').insert(payload).select('id').single()
      if (error) throw error
      postId = data?.id ?? null
      if (!postId) throw new Error('保存成功但没有拿到文章 id')
      article.id = postId
    }

    // 先把「已有标签 + 手写新标签」统一解析成 tags 表里的 id
    const tagIds = await resolveTagIds()
    article.slug = slug

    // 同步标签：先清空旧的，再写入当前选择的标签
    const { error: clearTagError } = await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', postId)
    if (clearTagError) throw clearTagError

    if (tagIds.length) {
      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))
      if (tagError) throw tagError
    }

    adminAlert.success(publish ? '文章已发布，可以继续写下一篇了' : '已存入草稿箱，编辑区已清空')
    resetEditor()
    if (!publish) void fetchDrafts()
  } catch (error) {
    console.error('[articleEdit] 保存失败', error)
    const code = (error as { code?: string } | null)?.code
    adminAlert.error(
      code === '23505'
        ? 'Slug 已经被占用了，换一个再试试'
        : error instanceof Error
          ? error.message
          : '保存失败，请稍后重试',
    )
  } finally {
    publishing.value = false
    savingDraft.value = false
  }
}

/** 保存成功后清空编辑器，避免一不留神把同一篇文章再发一遍 */
function resetEditor() {
  article.id = null
  article.title = ''
  article.slug = ''
  article.excerpt = ''
  article.cover_url = ''
  article.category_id = null
  article.content = ''
  article.is_visible = true

  selectedTags.value = []
  // 聊天记录和 AI 写作状态也一起清掉，下一篇从头开始
  aiMessages.value = []
  aiStreamMode.value = null
  aiMode.value = false
  editorEpoch.value += 1

  // 清掉地址栏里的 ?id=，刷新页面时不会又把刚保存的文章载回来
  if (route.query.id) void router.replace({ path: '/admin/articleedit' })
}

/**
 * 把标签选择框里的值统一换成 tags 表里的 id。
 * 数字是已有标签；字符串是用户手写的新标签，需要先插进 tags 表。
 */
async function resolveTagIds() {
  const ids: number[] = []
  const newNames: string[] = []
  const seen = new Set<string>()

  for (const value of selectedTags.value) {
    if (typeof value === 'number') {
      ids.push(value)
      continue
    }

    const name = value.trim()
    if (!name) continue

    // 手写的名字可能和已有标签重名（大小写不同也算），能对上就直接用已有 id
    const existing = tags.value.find((tag) => tag.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      ids.push(existing.id)
      continue
    }

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    newNames.push(name)
  }

  if (newNames.length) {
    // 同名标签直接跳过，避免撞上 tags.name 的唯一约束
    const { error: upsertError } = await supabase
      .from('tags')
      .upsert(
        newNames.map((name) => ({ name })),
        { onConflict: 'name', ignoreDuplicates: true },
      )
    if (upsertError) throw upsertError

    const { data: created, error: selectError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', newNames)
    if (selectError) throw selectError

    for (const tag of created ?? []) {
      ids.push(tag.id)
      // 放进本地列表，下次选标签时可以直接搜到
      if (!tags.value.some((item) => item.id === tag.id)) tags.value.push(tag)
    }
  }

  return [...new Set(ids)]
}

/** 摘要留空时，从 markdown 正文里截一段纯文本 */
function buildExcerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

/** 打开草稿箱时顺便刷新列表 */
function openDrafts() {
  draftVisible.value = true
  void fetchDrafts()
}

async function fetchDrafts() {
  draftLoading.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, excerpt, updated_at')
      .eq('is_published', false)
      .order('updated_at', { ascending: false })
      .limit(50)
    if (error) throw error
    drafts.value = data ?? []
  } catch (error) {
    console.error('[articleEdit] 草稿箱加载失败', error)
    adminAlert.error('草稿箱加载失败')
  } finally {
    draftLoading.value = false
  }
}

/** 从草稿箱载入一篇草稿到编辑器 */
async function loadDraft(id: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, content, cover_url, category_id, is_visible, post_tags(tag_id)',
      )
      .eq('id', id)
      .single()
    if (error) throw error

    article.id = data.id
    article.title = data.title ?? ''
    article.slug = data.slug ?? ''
    article.excerpt = data.excerpt ?? ''
    article.cover_url = data.cover_url ?? ''
    article.category_id = data.category_id ?? null
    article.content = data.content ?? ''
    article.is_visible = data.is_visible ?? true

    const tagRows = (data.post_tags ?? []) as { tag_id: number }[]
    selectedTags.value = tagRows.map((item) => item.tag_id)

    draftVisible.value = false
    aiMode.value = false
    adminAlert.success('草稿已载入编辑器')
  } catch (error) {
    console.error('[articleEdit] 载入草稿失败', error)
    adminAlert.error('载入草稿失败，请稍后重试')
  }
}

/** 从文章管理点「编辑」进来时，按 id 把整篇文章载入编辑器 */
async function loadPost(id: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, content, cover_url, category_id, is_visible, post_tags(tag_id)',
      )
      .eq('id', id)
      .single()
    if (error) throw error

    article.id = data.id
    article.title = data.title ?? ''
    article.slug = data.slug ?? ''
    article.excerpt = data.excerpt ?? ''
    article.cover_url = data.cover_url ?? ''
    article.category_id = data.category_id ?? null
    article.content = data.content ?? ''
    article.is_visible = data.is_visible ?? true

    const tagRows = (data.post_tags ?? []) as { tag_id: number }[]
    selectedTags.value = tagRows.map((item) => item.tag_id)

    // 编辑模式从手动写作开始，聊天记录不跨文章复用
    aiMode.value = false
    aiMessages.value = []
    aiStreamMode.value = null
  } catch (error) {
    console.error('[articleEdit] 文章加载失败', error)
    adminAlert.error('文章加载失败，已返回文章管理')
    goBack()
  }
}

function goBack() {
  router.push('/admin/manage/articles')
}

// ---------------- AI 写作 ----------------

function toggleAiMode() {
  if (aiBusy.value) {
    adminAlert.warning('等 AI 写完再切换模式')
    return
  }
  aiMode.value = !aiMode.value
}

function pushMessage(message: Omit<AiChatMessage, 'id' | 'time'>) {
  aiMessages.value.push({
    ...message,
    id: ++messageId,
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  })
}

/** 把「当前文章 + 用户要求」拼成发给 DeepSeek 的消息 */
function buildAiMessages(mode: 'modify' | 'rewrite', instruction: string): DeepSeekMessage[] {
  const system =
    mode === 'rewrite'
      ? '你是一位中文技术博客写作助手。请根据用户要求重写整篇文章：可以调整结构、语气和表达，但保留原文的核心事实。只输出完整的 Markdown 正文，不要输出解释、前言，也不要用代码围栏包裹整篇文章。'
      : '你是一位中文技术博客写作助手。请在保留原文结构、事实和语气的前提下，根据用户要求修改文章。只输出修改后的完整 Markdown 正文，不要输出解释、前言，也不要用代码围栏包裹整篇文章。'

  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `文章标题：${article.title || '（未命名）'}\n\n当前正文：\n\n${article.content || '（空）'}\n\n用户要求：${instruction}`,
    },
  ]
}

async function handleAiSend(payload: { mode: 'modify' | 'rewrite'; text: string }) {
  if (aiBusy.value) return
  if (generatingExcerpt.value) {
    adminAlert.warning('正在生成摘要，等它完成再继续')
    return
  }

  if (payload.mode === 'modify' && !article.content.trim()) {
    adminAlert.warning('先写一点正文，AI 才知道从哪里改起')
    return
  }

  // 重写会先清空编辑区，所以要在清空前把原内容和消息拼好
  const originalContent = article.content
  const messages = buildAiMessages(payload.mode, payload.text)

  pushMessage({ role: 'user', mode: payload.mode, content: payload.text })

  aiBusy.value = true
  aiStreamMode.value = payload.mode
  aiController = new AbortController()

  let buffer = ''
  if (payload.mode === 'rewrite') article.content = ''

  try {
    await streamDeepSeek({
      messages,
      signal: aiController.signal,
      onDelta(delta) {
        buffer += delta
        // 边收边写，预览区就会跟着一个字一个字地更新
        article.content = stripLeadingFence(buffer)
      },
    })

    if (!buffer.trim()) throw new Error('AI 没有返回内容，请再试一次')

    article.content = normalizeAiMarkdown(buffer)
    pushMessage({
      role: 'assistant',
      mode: payload.mode,
      content:
        payload.mode === 'rewrite'
          ? '已按新思路重写全文，左侧预览区可以直接查看。'
          : '已按你的要求完成修改，左侧预览区可以直接查看。',
    })
  } catch (error) {
    const aborted = (error as { name?: string } | null)?.name === 'AbortError'

    if (aborted) {
      // 手动停止：保留已经流式写出来的部分
      article.content = buffer ? normalizeAiMarkdown(buffer) : originalContent
      pushMessage({
        role: 'assistant',
        mode: payload.mode,
        content: '已停止生成，保留了已经写出来的部分。',
      })
    } else {
      console.error('[articleEdit] AI 生成失败', error)
      article.content = originalContent
      pushMessage({
        role: 'assistant',
        mode: payload.mode,
        content: `生成失败：${error instanceof Error ? error.message : '请稍后重试'}`,
      })
      adminAlert.error('AI 生成失败，详情可以看聊天区')
    }
  } finally {
    aiBusy.value = false
    aiStreamMode.value = null
    aiController = null
  }
}

function stopAi() {
  aiController?.abort()
}

/**
 * 用 AI 根据正文生成一段摘要。
 * 边生成边写进摘要输入框，生成失败会把原来的摘要还原。
 */
async function generateExcerpt() {
  if (generatingExcerpt.value) return
  if (aiBusy.value) {
    adminAlert.warning('AI 正在改写正文，等它完成再生成摘要')
    return
  }

  const content = article.content.trim()
  if (!content) {
    adminAlert.warning('正文还是空的，先写点内容再生成摘要')
    return
  }

  const original = article.excerpt
  generatingExcerpt.value = true
  excerptController = new AbortController()

  let buffer = ''

  try {
    await streamDeepSeek({
      messages: [
        {
          role: 'system',
          content:
            '你是一位中文技术博客编辑。请为下面的文章写一段 80~120 字的中文摘要，概括核心内容，语气自然。只输出摘要正文，不要标题、引号、Markdown 或解释。',
        },
        {
          role: 'user',
          content: `标题：${article.title.trim() || '（未命名）'}\n\n正文：\n\n${content.slice(0, 6000)}`,
        },
      ],
      signal: excerptController.signal,
      onDelta(delta) {
        buffer += delta
        article.excerpt = normalizeExcerpt(buffer)
      },
    })

    if (!buffer.trim()) throw new Error('AI 没有返回摘要，请再试一次')

    article.excerpt = normalizeExcerpt(buffer)
    adminAlert.success('摘要已生成')
  } catch (error) {
    const aborted = (error as { name?: string } | null)?.name === 'AbortError'

    if (aborted) {
      // 页面卸载时中断，已经生成的部分保留下来
      article.excerpt = buffer ? normalizeExcerpt(buffer) : original
    } else {
      console.error('[articleEdit] 摘要生成失败', error)
      article.excerpt = original
      adminAlert.error(error instanceof Error ? error.message : '摘要生成失败，请稍后重试')
    }
  } finally {
    generatingExcerpt.value = false
    excerptController = null
  }
}

/** 摘要只要纯文本：去掉围栏、Markdown 符号和首尾引号，压成一行 */
function normalizeExcerpt(raw: string) {
  return stripLeadingFence(raw)
    .replace(/```[a-zA-Z]*/g, '')
    .replace(/[#*_`>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["“「『]|["”」』]$/g, '')
    .slice(0, 200)
}

/** 流式输出时先把开头的 ```markdown 去掉，避免预览区出现围栏符号 */
function stripLeadingFence(text: string) {
  return text.replace(/^```[a-zA-Z]*\s*\n?/, '')
}

/** 生成结束后再统一去掉整篇文章外层的代码围栏 */
function normalizeAiMarkdown(raw: string) {
  let text = raw.trim()
  const fence = /^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```\s*$/.exec(text)
  if (fence?.[1]) text = fence[1].trim()
  return text
}
</script>

<style scoped>
/* 手动写作 / AI 写作切换动画 */
.article-mode-enter-active,
.article-mode-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.article-mode-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.995);
}

.article-mode-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.995);
}

@media (prefers-reduced-motion: reduce) {
  .article-mode-enter-active,
  .article-mode-leave-active {
    transition: none;
  }
}
</style>
