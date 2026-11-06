<template>
  <section class="relative flex h-[100vh] w-full items-center overflow-hidden">
    <!-- 整体改成上下结构：上面讲故事，下面放整年热力图 -->
    <div
      class="relative z-10 mx-auto flex w-full max-w-[1520px] flex-col gap-10 px-5 py-10 sm:px-8 sm:pr-20 lg:gap-16 lg:py-5 lg:px-20"
    >
      <!-- 上：网站创建历程 -->
      <div class="px-20">
        <p
          class="inline-flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.32em] text-sky-200"
        >
          <span class="h-px w-7 bg-gradient-to-r from-sky-300 to-transparent" />
          关于该网站
        </p>

        <h2
          class="mt-5 text-[38px] font-bold leading-[1.16] tracking-tight text-white sm:text-[46px] xl:text-[54px] flex"
        >
          <div class="flex">
            <IconFont name="16global" class="mr-5 relative top-[6px]"></IconFont>建站历史，
          </div>

          <span
            class="bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
          >
            也是新阶段的开始
          </span>
        </h2>

        <p class="mt-5 text-[15px] leading-8 text-slate-300/85 sm:text-[16px]">
          2026 年 10 月 7
          日，我写下了这个博客的第一行代码。最初只是想练习技术，后来它慢慢变成了记录、表达和长期维护的一件事。
        </p>

        <!-- 两段建站阶段 -->
        <div class="relative mt-7 pl-7">
          <div v-for="item in timeline" :key="item.date" class="relative pb-6 last:pb-0">
            <span
              class="absolute -left-7 top-1 grid h-3 w-3 place-items-center rounded-full border border-sky-300/40 bg-slate-950/80"
              aria-hidden="true"
            >
              <span
                class="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]"
              />
            </span>

            <p class="font-mono text-[10px] tracking-[0.16em] text-sky-200/60">
              {{ item.date }}
            </p>
            <h3 class="mt-1.5 text-[16px] font-semibold text-white">
              {{ item.title }}
            </h3>
            <p class="mt-1.5 text-[13px] leading-6 text-slate-300/70">
              {{ item.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- 下：GitHub 贡献热力图，占满整行宽度，自适应缩放，不出现滚动条 -->
      <div class="w-full">
        <AboutGithubHeatmap />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AboutGithubHeatmap from './AboutGithubHeatmap.vue'

const timeline = [
  {
    date: '2026.10.07 — 2026.12.31',
    title: '把想法写进浏览器',
    text: '从零搭起页面、路由和第一篇文章，构建网站的基本功能。虽然很简陋，但能在浏览器里看到自己的想法，还是很开心的。',
  },
  {
    date: '2026.10.07 — 现在',
    title: '把网站变成自己的小天地',
    text: '补上各种乱七八糟的功能，练习性能优化，同时开始记录学习与生活，让这个网站真的变成自己的一个小天地。',
  },
]
</script>

<style scoped></style>
