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
      <MilestoneContent :articles="milestones" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import MilestoneContent from '@/components/business/milestone/MilestoneContent.vue'
import MilestoneGoldParticles from '@/components/business/milestone/MilestoneGoldParticles.vue'
import type { MilestoneArticle } from '@/types'

import demo from '@/assets/images/demoTextImages/demo.jpg'
import demo2 from '@/assets/images/demoTextImages/demo2.jpg'
import demo3 from '@/assets/images/demoTextImages/demo3.jpg'
import demo4 from '@/assets/images/demoTextImages/demo4.jpg'
import mycover from '@/assets/images/mycover.jpg'
import back from '@/assets/images/back.jpg'
import back2 from '@/assets/images/back2.jpg'
import mountain from '@/assets/images/8385-mountains-55067_1920 (1).png'

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
 * 数据先直接放在这里，后端接好之后换成接口返回即可。
 * 顺序就是时间线的顺序，从早到晚排列。
 */
const milestones: MilestoneArticle[] = [
  {
    id: 'milestone-2023-03-18',
    date: '2023-03-18',
    title: '把博客搬到自己的域名下',
    excerpt: '从一张白纸开始，域名、DNS、证书，来来回回折腾了整整一个周末。',
    tags: ['建站', '折腾'],
    cover: demo,
    readTime: '6 分钟',
  },
  {
    id: 'milestone-2023-07-02',
    date: '2023-07-02',
    title: 'Vue 3 组合式 API 入门笔记',
    excerpt: '第一次把选项式写法换成 script setup，像把抽屉里的线重新理了一遍。',
    tags: ['Vue', '前端'],
    cover: demo2,
    readTime: '9 分钟',
  },
  {
    id: 'milestone-2023-12-24',
    date: '2023-12-24',
    title: '冬夜里的第一百篇文章',
    excerpt: '窗外很冷，屏幕很亮。写完这一篇，博客刚好攒到一百篇。',
    tags: ['写作', '复盘'],
    cover: back,
    readTime: '5 分钟',
  },
  {
    id: 'milestone-2024-04-06',
    date: '2024-04-06',
    title: '用 Pinia 重构状态管理',
    excerpt: '把散落在组件里的状态收拢到 store，代码终于有了一个清楚的骨架。',
    tags: ['Vue', 'Pinia'],
    cover: demo3,
    readTime: '8 分钟',
  },
  {
    id: 'milestone-2024-09-15',
    date: '2024-09-15',
    title: '博客二期：评论区的诞生',
    excerpt: '从一条留言开始，搭起用户、评论、回复三张表，也第一次认真处理权限。',
    tags: ['Supabase', '全栈'],
    cover: mycover,
    readTime: '12 分钟',
  },
  {
    id: 'milestone-2025-01-20',
    date: '2025-01-20',
    title: '给文章页加上目录与阅读进度',
    excerpt: '长文章需要一个落脚点。目录、锚点、阅读进度条，一样都不能少。',
    tags: ['前端', '交互'],
    cover: demo4,
    readTime: '7 分钟',
  },
  {
    id: 'milestone-2025-06-08',
    date: '2025-06-08',
    title: '端午，去了一趟嵩山',
    excerpt: '山不算高，云很近。回来之后，把照片和心情一起放进了游记页。',
    tags: ['旅行', '嵩山'],
    cover: mountain,
    readTime: '10 分钟',
  },
  {
    id: 'milestone-2026-02-14',
    date: '2026-02-14',
    title: '用 Supabase 搭起博客后端',
    excerpt: '匿名访客、登录博主、行级权限——后端的第一条边界终于画清楚了。',
    tags: ['Supabase', '后端'],
    cover: back2,
    readTime: '14 分钟',
  },
  {
    id: 'milestone-2026-10-01',
    date: '2026-10-01',
    title: 'Milestone：把时间铺成一条金色的河',
    excerpt: '当文章多到记不住顺序，就想给它们做一条横着的时光线。',
    tags: ['建站', '里程碑'],
    cover: demo,
    readTime: '11 分钟',
  },
]
</script>
