<template>
  <div class="flex h-full min-h-0 w-full flex-col gap-3 lg:flex-row lg:gap-4">
    <!-- 左侧主区域：手动写作 = 编辑 + 预览；AI 润色 = 预览 + 聊天 -->
    <section class="min-h-0 min-w-0 flex-1">
      <Transition name="article-mode" mode="out-in">
        <div
          v-if="!aiMode"
          key="manual"
          class="flex h-full min-h-0 flex-col gap-3 xl:flex-row xl:gap-4"
        >
          <ArticleEditorPanel v-model="essay.content" class="min-h-[320px] flex-1 xl:min-h-0" />
          <ArticlePreviewPanel
            :content="essay.content"
            :title="essay.title"
            class="min-h-[320px] flex-1 xl:min-h-0"
          />
        </div>

        <div v-else key="ai" class="flex h-full min-h-0 flex-col gap-3 xl:flex-row xl:gap-4">
          <ArticlePreviewPanel
            :content="essay.content"
            :title="essay.title"
            :streaming="aiBusy"
            :mode="aiStreamMode"
            class="min-h-[320px] flex-[3] xl:min-h-0"
          />
          <AiChatPanel
            :messages="aiMessages"
            :busy="aiBusy"
            :mode="aiStreamMode"
            :allow-rewrite="false"
            :suggestions="ESSAY_AI_SUGGESTIONS"
            class="min-h-[380px] flex-[2] xl:min-h-0"
            @send="handleEssayAiSend"
            @stop="stopEssayAi"
          />
        </div>
      </Transition>
    </section>

    <!-- 右侧：标题、展示状态和保存操作 -->
    <EssayEditActionPanel
      v-model:title="essay.title"
      v-model:visible="essay.is_visible"
      :is-published="essay.is_published"
      :saving="savingDraft"
      :publishing="publishing"
      :ai-mode="aiMode"
      :ai-busy="aiBusy"
      class="min-h-[480px] w-full shrink-0 lg:min-h-0 lg:w-[332px]"
      @publish="saveEssay(true)"
      @draft="saveEssay(false)"
      @open-drafts="openDrafts"
      @back="goBack"
      @toggle-ai="toggleAiMode"
    />

    <EssayDraftDrawer
      v-model="draftVisible"
      :drafts="drafts"
      :loading="draftLoading"
      @load="loadDraft"
      @refresh="fetchDrafts"
    />

    <AdminLoding overlay v-if="loadingEssay" text="加载随笔中…" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  adminEssayErrorMessage,
  fetchAdminEssay,
  fetchEssayDrafts,
  type AdminEssayDraft,
} from '@/api/adminEssays'
import { streamDeepSeek } from '@/api/deepseek'
import type { DeepSeekMessage } from '@/api/deepseek'
import { supabase } from '@/api/supabase'
import AdminLoding from '@/components/common/admin/AdminLoding.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import ArticleEditorPanel from '@/components/business/admin/articleEdit/ArticleEditorPanel.vue'
import ArticlePreviewPanel from '@/components/business/admin/articleEdit/ArticlePreviewPanel.vue'
import AiChatPanel from '@/components/business/admin/articleEdit/AiChatPanel.vue'
import type { AiChatMessage } from '@/components/business/admin/articleEdit/types'
import EssayDraftDrawer from '@/components/business/admin/essayEdit/EssayDraftDrawer.vue'
import EssayEditActionPanel from '@/components/business/admin/essayEdit/EssayEditActionPanel.vue'

const route = useRoute()
const router = useRouter()
const adminAlert = useAdminAlert()

const essay = reactive({
  id: null as string | null,
  title: '',
  content: '',
  is_published: false,
  is_visible: true,
  published_at: null as string | null,
})

const savingDraft = ref(false)
const publishing = ref(false)
const loadingEssay = ref(false)

const draftVisible = ref(false)
const draftLoading = ref(false)
const drafts = ref<AdminEssayDraft[]>([])

// AI 润色：随笔只允许“修改 / 打磨”，不提供整篇重写
const ESSAY_AI_SUGGESTIONS = [
  '优化文章结构，让段落层次更清晰',
  '润色语言，让表达更自然流畅',
  '精简冗余内容，只保留核心信息',
  '增加段落之间的过渡，让衔接更顺畅',
  '调整开头和结尾，让全文更完整',
]

const aiMode = ref(false)
const aiBusy = ref(false)
const aiStreamMode = ref<'modify' | 'rewrite' | null>(null)
const aiMessages = ref<AiChatMessage[]>([])
let aiController: AbortController | null = null
let aiMessageId = 0
let aiSession = 0

function resetAiSession() {
  aiSession += 1
  aiController?.abort()
  aiController = null
  aiBusy.value = false
  aiStreamMode.value = null
  aiMessages.value = []
  aiMode.value = false
}

function resetEssay() {
  resetAiSession()
  essay.id = null
  essay.title = ''
  essay.content = ''
  essay.is_published = false
  essay.is_visible = true
  essay.published_at = null
}

async function loadEssay(id: string) {
  resetAiSession()
  loadingEssay.value = true
  try {
    const row = await fetchAdminEssay(id)
    if (!row) {
      adminAlert.warning('这篇随笔可能已经被删除了')
      goBack()
      return
    }

    essay.id = row.id
    essay.title = row.title
    essay.content = row.content
    essay.is_published = row.is_published
    essay.is_visible = row.is_visible
    essay.published_at = row.published_at
  } catch (error) {
    console.error('[essayEdit] 加载随笔失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
    goBack()
  } finally {
    loadingEssay.value = false
  }
}

/** URL 带 ?id= 时载入对应随笔；从草稿箱载入也复用这条路径 */
watch(
  () => route.query.id,
  (id) => {
    if (typeof id === 'string' && id) {
      void loadEssay(id)
    } else {
      resetEssay()
    }
  },
  { immediate: true },
)

async function saveEssay(publish: boolean) {
  if (savingDraft.value || publishing.value) return
  if (aiBusy.value) {
    adminAlert.warning('AI 正在润色随笔，等它完成再保存吧')
    return
  }

  const title = essay.title.trim()
  const content = essay.content.trim()
  if (!title) return adminAlert.warning('先给随笔起个标题')
  if (!content) return adminAlert.warning('正文还是空的，写点内容再保存')

  publishing.value = publish
  savingDraft.value = !publish

  try {
    const payload = {
      title,
      content,
      is_published: publish,
      is_visible: essay.is_visible,
      // 更新已发布随笔时保留原发布时间，避免修改一下就把时间线顺序打乱
      published_at: publish ? (essay.published_at ?? new Date().toISOString()) : null,
    }

    if (essay.id) {
      const { error } = await supabase.from('essays').update(payload).eq('id', essay.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('essays').insert(payload)
      if (error) throw error
    }

    adminAlert.success(publish ? '随笔已发布' : '已存入随笔草稿箱')
    resetEssay()
    if (route.query.id) void router.replace({ path: '/admin/essayedit' })
    if (!publish) void fetchDrafts()
  } catch (error) {
    console.error('[essayEdit] 保存随笔失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    publishing.value = false
    savingDraft.value = false
  }
}

// ---------------- AI 润色（只修改，不重写） ----------------
function pushAiMessage(message: Omit<AiChatMessage, 'id' | 'time'>) {
  aiMessages.value.push({
    ...message,
    id: ++aiMessageId,
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  })
}

function toggleAiMode() {
  if (aiBusy.value) {
    adminAlert.warning('等 AI 润色完成再切换模式')
    return
  }
  if (!aiMode.value && !essay.content.trim()) {
    adminAlert.warning('先写一点正文，再让 AI 润色')
    return
  }
  aiMode.value = !aiMode.value
}

function buildEssayAiMessages(instruction: string): DeepSeekMessage[] {
  return [
    {
      role: 'system',
      content:
        '你是一位中文随笔写作助手。请在保留原文事实、个人语气和核心观点的前提下，根据用户要求润色随笔。只输出修改后的完整 Markdown 正文，不要输出解释、前言，也不要用代码围栏包裹整篇文章。',
    },
    {
      role: 'user',
      content: `随笔标题：${essay.title || '（未命名）'}\n\n当前正文：\n\n${essay.content}\n\n用户要求：${instruction}`,
    },
  ]
}

async function handleEssayAiSend(payload: { mode: 'modify' | 'rewrite'; text: string }) {
  if (aiBusy.value) return
  if (!essay.content.trim()) {
    adminAlert.warning('正文还是空的，先写点内容再让 AI 润色')
    return
  }

  const instruction = payload.text.trim()
  if (!instruction) return

  // 随笔页只接受“修改”，即使收到 rewrite 也按修改处理
  const mode = 'modify' as const
  const originalContent = essay.content
  const messages = buildEssayAiMessages(instruction)
  const session = ++aiSession

  pushAiMessage({ role: 'user', mode, content: instruction })

  aiBusy.value = true
  aiStreamMode.value = mode
  aiController = new AbortController()

  let buffer = ''

  try {
    await streamDeepSeek({
      messages,
      signal: aiController.signal,
      onDelta(delta) {
        if (session !== aiSession) return
        buffer += delta
        // 边收边写，预览区会持续跟着最新内容
        essay.content = stripLeadingFence(buffer)
      },
    })

    if (session !== aiSession) return
    if (!buffer.trim()) throw new Error('AI 没有返回内容，请再试一次')

    essay.content = normalizeAiMarkdown(buffer)
    pushAiMessage({
      role: 'assistant',
      mode,
      content: '已按你的要求完成润色，左侧预览区可以直接查看。',
    })
  } catch (error) {
    if (session !== aiSession) return

    const aborted = (error as { name?: string } | null)?.name === 'AbortError'
    if (aborted) {
      // 手动停止：保留已经流式写出来的部分
      essay.content = buffer ? normalizeAiMarkdown(buffer) : originalContent
      pushAiMessage({
        role: 'assistant',
        mode,
        content: '已停止生成，保留了已经润色出来的部分。',
      })
    } else {
      console.error('[essayEdit] AI 润色失败', error)
      essay.content = originalContent
      pushAiMessage({
        role: 'assistant',
        mode,
        content: `润色失败：${error instanceof Error ? error.message : '请稍后重试'}`,
      })
      adminAlert.error('AI 润色失败，详情可以看聊天区')
    }
  } finally {
    if (session === aiSession) {
      aiBusy.value = false
      aiStreamMode.value = null
      aiController = null
    }
  }
}

function stopEssayAi() {
  aiController?.abort()
}

/** 流式输出时先去掉开头的 ```markdown，避免预览区出现围栏符号 */
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

// ---------------- 草稿箱 ----------------
function openDrafts() {
  draftVisible.value = true
  void fetchDrafts()
}

async function fetchDrafts() {
  draftLoading.value = true
  try {
    drafts.value = await fetchEssayDrafts()
  } catch (error) {
    console.error('[essayEdit] 加载草稿箱失败', error)
    adminAlert.error(adminEssayErrorMessage(error))
  } finally {
    draftLoading.value = false
  }
}

function loadDraft(id: string) {
  draftVisible.value = false
  void router.replace({ path: '/admin/essayedit', query: { id } })
}

function goBack() {
  void router.push('/admin/manage/essays')
}

onMounted(() => {
  // 首次进入只加载当前文章；草稿箱等用户打开时再取，减少不必要的请求
  if (!route.query.id) resetEssay()
})

onBeforeUnmount(() => {
  resetAiSession()
})
</script>

<style scoped>
/* 手动写作 / AI 润色切换动画 */
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
