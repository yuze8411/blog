<template>
  <div
    class="relative min-h-screen overflow-x-hidden bg-white text-zinc-700 transition-colors duration-500 dark:bg-[#0b0c0e] dark:text-zinc-300"
  >
    <!-- ========== 背景：铺满页面的淡色光晕 + 若隐若现的网格 + 随机滑过的留言 ========== -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div class="wall-glow-base"></div>

      <div class="wall-glow wall-glow-a"></div>
      <div class="wall-glow wall-glow-b"></div>
      <div class="wall-glow wall-glow-c"></div>
      <div class="wall-glow wall-glow-d"></div>
      <div class="wall-glow wall-glow-e"></div>
      <div class="wall-glow wall-glow-f"></div>
      <div class="wall-glow wall-glow-g"></div>

      <div class="wall-bg-grid"></div>

      <!-- 滑动的留言，透明度和速度都很低，只当背景 -->
      <MessageWallFloating />
    </div>

    <TopNavigation variant="light" />

    <main class="relative z-10">
      <MessageWallContent
        v-model:filter="filter"
        :messages="messages"
        :total="total"
        :all-total="allTotal"
        :loading="loading"
        :loaded="loaded"
        :loading-more="loadingMore"
        :error="error"
        :owner="isBlogger"
        :owner-name="ownerName"
        :owner-avatar="ownerAvatar"
        @refresh="loadFirstPage"
        @load-more="loadMore"
        @submit="handleSubmit"
      />
    </main>

    <SiteFooter
      class="message-wall-footer relative z-10 border-[#e9ebee]/80 bg-white/50 backdrop-blur-sm dark:border-white/[0.06] dark:bg-transparent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { AdminUser } from '@/api/auth'
import { getSessionUser, isOwner } from '@/api/auth'
import {
  createMessage,
  fetchMessages,
  messageErrorMessage,
  type MessageFilter,
  type PublicMessageRow,
} from '@/api/messages'
import type { MessageFormPayload } from '@/types/message'
import ownerFallbackAvatar from '@/assets/images/mycover.jpg'
import TopNavigation from '@/components/common/TopNavigation.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import MessageWallContent from '@/components/business/messageWall/MessageWallContent.vue'
import MessageWallFloating from '@/components/business/messageWall/MessageWallFloating.vue'

const messages = ref<PublicMessageRow[]>([])
const total = ref(0)
const allTotal = ref(0)
const filter = ref<MessageFilter>('all')
const page = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const loaded = ref(false)
const error = ref('')

// 当前登录的博主；只有 owner 才能用博主身份留言
const viewer = ref<AdminUser | null>(null)
const identityReady = ref(false)
let identityPromise: Promise<void> | null = null
let requestId = 0

const isBlogger = computed(() => isOwner(viewer.value))

// 博主没在账号元数据里设置昵称时退回邮箱前缀，公开页面换成固定署名
const ownerName = computed(() => {
  const name = viewer.value?.name.trim() ?? ''
  const emailPrefix = viewer.value?.email.split('@')[0] ?? ''
  return name && name !== emailPrefix ? name : '雨落千山'
})

const ownerAvatar = computed(() => viewer.value?.avatarUrl || ownerFallbackAvatar)

// 本地兜底头像不能写进数据库，只有远程 http(s) 地址才保存
const ownerAvatarForSave = computed(() => {
  const url = viewer.value?.avatarUrl ?? ''
  return /^https?:\/\//i.test(url) ? url : null
})

/** 等本地会话读完再提交，避免博主刚进页面时被当成游客 */
function ensureIdentity(): Promise<void> {
  if (identityReady.value) return Promise.resolve()
  if (!identityPromise) {
    identityPromise = (async () => {
      try {
        viewer.value = await getSessionUser()
      } catch (err) {
        console.warn('[message-wall] 读取登录状态失败', err)
      } finally {
        identityReady.value = true
      }
    })()
  }
  return identityPromise
}

/** 数据库要求昵称 1-30 字，账号昵称也可能超长，这里统一收一下 */
function safeNickname(value: string) {
  return value.trim().slice(0, 30) || '访客'
}

/** 首次加载 / 切换筛选 / 手动刷新：从第一页重新拉 */
async function loadFirstPage() {
  const current = ++requestId
  loading.value = true
  loadingMore.value = false
  error.value = ''

  // 重新拉取时先回到骨架屏，避免旧筛选的留言短暂留在新筛选下
  messages.value = []
  loaded.value = false

  try {
    const result = await fetchMessages({ filter: filter.value, page: 1 })
    if (current !== requestId) return

    messages.value = result.list
    total.value = result.total
    page.value = 1
    loaded.value = true

    // 顶部总数始终代表整面墙，只在「全部」筛选时更新
    if (filter.value === 'all') allTotal.value = result.total
  } catch (err) {
    if (current !== requestId) return
    console.error('[message-wall] 加载留言失败', err)
    error.value = '网络好像打了个盹，稍后再刷新看看'
  } finally {
    if (current === requestId) loading.value = false
  }
}

/** 加载下一页：追加到现有留言后面，并按 id 去重 */
async function loadMore() {
  if (loading.value || loadingMore.value || messages.value.length >= total.value) return

  const current = requestId
  const nextPage = page.value + 1
  loadingMore.value = true
  error.value = ''

  try {
    const result = await fetchMessages({ filter: filter.value, page: nextPage })
    if (current !== requestId) return

    const seen = new Set(messages.value.map((item) => item.id))
    messages.value.push(...result.list.filter((item) => !seen.has(item.id)))
    total.value = result.total
    page.value = nextPage
  } catch (err) {
    if (current !== requestId) return
    console.error('[message-wall] 加载更多留言失败', err)
    error.value = '更多的留言没搬过来，点刷新再试试'
  } finally {
    if (current === requestId) loadingMore.value = false
  }
}

async function handleSubmit(
  payload: MessageFormPayload,
  done: (ok: boolean, message?: string) => void,
) {
  const content = payload.content.trim()
  if (!content) {
    done(false, '先写点内容吧')
    return
  }

  await ensureIdentity()
  const blogger = isBlogger.value

  try {
    await createMessage({
      nickname: safeNickname(blogger ? ownerName.value : payload.nickname),
      content,
      // 博主使用账号头像；游客使用表单根据 QQ 邮箱换算出的头像
      avatarUrl: blogger ? ownerAvatarForSave.value : (payload.avatarUrl ?? null),
      websiteUrl: blogger ? null : payload.websiteUrl || null,
    })

    // 博主和游客的留言都会先进入审核队列，公开视图不会立刻出现它
    done(
      true,
      blogger ? '留言已投递，审核通过后就会展示在墙上～' : '留言已收到，审核通过后就会出现在墙上～',
    )
  } catch (err) {
    console.error('[message-wall] 发表留言失败', err)
    done(false, messageErrorMessage(err))
  }
}

// 切换「全部 / 博主 / 访客」时重新从第一页拉取，筛选才能真正生效
watch(filter, () => {
  void loadFirstPage()
})

onMounted(() => {
  void ensureIdentity()
  void loadFirstPage()
})
</script>

<style scoped>
/* ---------- 背景网格：若隐若现，慢慢平移 ---------- */
.wall-bg-grid {
  position: absolute;
  inset: -60px;
  background-image:
    linear-gradient(rgba(100, 110, 120, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 110, 120, 0.055) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 32%, #000 0%, rgba(0, 0, 0, 0.55) 48%, transparent 78%);
  opacity: 0.85;
  animation: wall-grid-drift 38s linear infinite;
}

@keyframes wall-grid-drift {
  from {
    background-position:
      0 0,
      0 0;
  }
  to {
    background-position:
      42px 84px,
      42px 84px;
  }
}

/* ---------- 移动的彩色光晕：淡紫、薄荷、灰蓝、鼠尾草，慢慢漂移 ---------- */
.wall-glow {
  --glow-rgb: 205, 195, 238;
  --glow-a: 0.55;

  position: absolute;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(var(--glow-rgb), var(--glow-a)) 0%,
    rgba(var(--glow-rgb), calc(var(--glow-a) * 0.58)) 28%,
    rgba(var(--glow-rgb), calc(var(--glow-a) * 0.2)) 52%,
    transparent 72%
  );
  will-change: transform;
}

/* 先铺一层覆盖整页的淡色底光，避免边缘亮、中间空 */
.wall-glow-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 55% at 12% 8%, rgba(205, 198, 238, 0.26), transparent 70%),
    radial-gradient(ellipse 55% 50% at 88% 14%, rgba(188, 228, 218, 0.22), transparent 70%),
    radial-gradient(ellipse 62% 58% at 8% 82%, rgba(196, 210, 238, 0.22), transparent 72%),
    radial-gradient(ellipse 60% 55% at 92% 80%, rgba(222, 206, 240, 0.22), transparent 72%),
    radial-gradient(ellipse 50% 50% at 50% 46%, rgba(197, 226, 205, 0.16), transparent 74%);
}

.wall-glow-a {
  --glow-rgb: 202, 192, 236;
  --glow-a: 0.34;

  top: -14%;
  left: -8%;
  width: 600px;
  height: 600px;
  animation: wall-glow-drift-a 42s ease-in-out infinite alternate;
}

.wall-glow-b {
  --glow-rgb: 184, 224, 212;
  --glow-a: 0.32;

  top: -16%;
  right: -10%;
  width: 620px;
  height: 620px;
  animation: wall-glow-drift-b 48s ease-in-out infinite alternate;
}

.wall-glow-c {
  --glow-rgb: 188, 202, 234;
  --glow-a: 0.28;

  top: 22%;
  left: 2%;
  width: 560px;
  height: 560px;
  animation: wall-glow-drift-a 38s ease-in-out infinite alternate-reverse;
}

.wall-glow-d {
  --glow-rgb: 220, 202, 238;
  --glow-a: 0.32;

  top: 26%;
  right: -6%;
  width: 600px;
  height: 600px;
  animation: wall-glow-drift-b 52s ease-in-out infinite alternate-reverse;
}

.wall-glow-e {
  --glow-rgb: 192, 222, 198;
  --glow-a: 0.26;

  bottom: -18%;
  left: -6%;
  width: 600px;
  height: 600px;
  animation: wall-glow-drift-c 44s ease-in-out infinite alternate;
}

.wall-glow-f {
  --glow-rgb: 176, 218, 222;
  --glow-a: 0.28;

  right: -8%;
  bottom: -16%;
  width: 620px;
  height: 620px;
  animation: wall-glow-drift-c 50s ease-in-out infinite alternate-reverse;
}

/* 中间再补一团最淡的冷色，把整页的留白也填上 */
.wall-glow-g {
  --glow-rgb: 208, 206, 232;
  --glow-a: 0.2;

  top: 46%;
  left: 34%;
  width: 520px;
  height: 520px;
  animation: wall-glow-drift-b 58s ease-in-out infinite alternate;
}

@keyframes wall-glow-drift-a {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(112px, 76px, 0) scale(1.12);
  }
  100% {
    transform: translate3d(-42px, 28px, 0) scale(0.97);
  }
}

@keyframes wall-glow-drift-b {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-122px, -66px, 0) scale(1.13);
  }
  100% {
    transform: translate3d(48px, -24px, 0) scale(1.02);
  }
}

@keyframes wall-glow-drift-c {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(76px, -104px, 0) scale(1.09);
  }
  100% {
    transform: translate3d(-64px, 44px, 0) scale(1.03);
  }
}

/* ---------- 深色模式 ---------- */
html.dark .wall-bg-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  opacity: 0.7;
}

html.dark .wall-glow-base {
  background:
    radial-gradient(ellipse 60% 55% at 12% 8%, rgba(122, 106, 168, 0.12), transparent 70%),
    radial-gradient(ellipse 55% 50% at 88% 14%, rgba(74, 128, 112, 0.1), transparent 70%),
    radial-gradient(ellipse 62% 58% at 8% 82%, rgba(88, 108, 158, 0.1), transparent 72%),
    radial-gradient(ellipse 60% 55% at 92% 80%, rgba(136, 108, 162, 0.1), transparent 72%),
    radial-gradient(ellipse 50% 50% at 50% 46%, rgba(86, 122, 94, 0.08), transparent 74%);
}

html.dark .wall-glow-a {
  --glow-rgb: 122, 106, 168;
  --glow-a: 0.18;
}

html.dark .wall-glow-b {
  --glow-rgb: 74, 128, 112;
  --glow-a: 0.15;
}

html.dark .wall-glow-c {
  --glow-rgb: 88, 108, 158;
  --glow-a: 0.15;
}

html.dark .wall-glow-d {
  --glow-rgb: 136, 108, 162;
  --glow-a: 0.15;
}

html.dark .wall-glow-e {
  --glow-rgb: 86, 122, 94;
  --glow-a: 0.13;
}

html.dark .wall-glow-f {
  --glow-rgb: 76, 118, 122;
  --glow-a: 0.13;
}

html.dark .wall-glow-g {
  --glow-rgb: 118, 112, 148;
  --glow-a: 0.12;
}

/* 页脚悬停改成中性深灰，和整页的白灰保持一致 */
.message-wall-footer :deep(a:hover),
.message-wall-footer :deep(button:hover) {
  color: #3f3f46;
}

html.dark .message-wall-footer :deep(a:hover),
html.dark .message-wall-footer :deep(button:hover) {
  color: #e4e4e7;
}

@media (prefers-reduced-motion: reduce) {
  .wall-bg-grid,
  .wall-glow {
    animation: none;
  }
}
</style>
