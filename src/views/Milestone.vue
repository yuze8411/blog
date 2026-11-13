<template>
  <div class="relative min-h-screen overflow-x-hidden bg-[#080b12] text-slate-200">
    <!-- ========== 背景：深墨色底 + 几团暖金光晕，给金色粒子一个落脚的地方 ========== -->
    <div class="pointer-events-none fixed inset-0 z-0">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(190,140,50,0.15),transparent_60%)]"
      />
      <div
        class="absolute -left-40 top-24 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(245,185,66,0.10),transparent_68%)] blur-2xl"
      />
      <div
        class="absolute -right-32 top-1/3 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(80,110,180,0.10),transparent_68%)] blur-2xl"
      />
      <div
        class="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(245,185,66,0.06),transparent_70%)] blur-2xl"
      />
      <!-- 很淡的圆点纸纹，近看才有，不会干扰阅读 -->
      <div
        class="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,220,140,0.16)_1px,transparent_1px)] [background-size:26px_26px]"
      />
    </div>

    <!-- 金色粒子铺在最上层背景里，内容仍然在它上面 -->
    <MilestoneGoldParticles class="pointer-events-none fixed inset-0 z-[1]" />

    <!-- 没有顶部导航了，只留一个回首页的小胶囊 -->
    <RouterLink
      to="/"
      class="group fixed left-5 top-5 z-[60] inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-slate-900/65 py-2 pl-3 pr-4 font-[huoxie] text-[12px] tracking-[0.08em] text-slate-300 shadow-[0_16px_36px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900/85 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b12] sm:left-8 sm:top-7"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
      >
        <path d="M19 12H5m5 5-5-5 5-5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      首页
    </RouterLink>

    <main class="relative z-10">
      <MilestoneContent
        :articles="milestones"
        :loading="loading"
        :error="loadError"
        @retry="loadMilestones"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchMilestones } from '@/api/milestones'
import MilestoneContent from '@/components/business/milestone/MilestoneContent.vue'
import MilestoneGoldParticles from '@/components/business/milestone/MilestoneGoldParticles.vue'
import type { MilestoneArticle } from '@/types'

/* ---------------- 主题 ----------------
 * 这个页面只做暗色版本，所以进来就给 <html> 挂上 dark，
 * 让滚动条、原生控件也跟着变暗；离开时如果原本不是暗色再摘掉，
 * 不会把全站主题改坏。
 */
const hadDarkClass = document.documentElement.classList.contains('dark')
document.documentElement.classList.add('dark')

onBeforeUnmount(() => {
  if (!hadDarkClass) document.documentElement.classList.remove('dark')
})

/* ---------------- 文章节点 ----------------
 * 后台只决定「哪些文章出现在时光轴」，
 * 前台按文章发布时间从早到晚自动排列，所以这里不需要再排序。
 */
const milestones = ref<MilestoneArticle[]>([])
const loading = ref(true)
const loadError = ref('')

let requestId = 0

function errorMessage(error: unknown) {
  const text = error instanceof Error ? error.message : ''

  if (/could not find the table|does not exist|schema cache/i.test(text)) {
    return '时光轴的数据表还没有准备好，请先在 Supabase 执行 sql.text 里的第 12 段 SQL。'
  }
  if (/failed to fetch|network|timeout/i.test(text)) {
    return '时光线暂时没有连上，检查一下网络，再试一次吧。'
  }

  return '时光轴没有加载出来，稍后再试试。'
}

async function loadMilestones() {
  const current = ++requestId
  loading.value = true
  loadError.value = ''

  try {
    const rows = await fetchMilestones()
    if (current !== requestId) return
    milestones.value = rows
  } catch (error) {
    if (current !== requestId) return
    console.error('[milestone] 获取时光轴文章失败', error)
    loadError.value = errorMessage(error)
  } finally {
    if (current === requestId) loading.value = false
  }
}

onMounted(() => {
  void loadMilestones()
})
</script>
