<template>
  <article
    class="article-row group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-[0_16px_36px_-30px_rgba(47,74,119,0.4)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_44px_-26px_rgba(37,99,235,0.32)] dark:border-gray-800 dark:bg-gray-900/80 dark:hover:border-sky-500/40 dark:hover:shadow-[0_26px_50px_-28px_rgba(0,0,0,0.85)] sm:flex-row sm:items-stretch sm:gap-5 sm:p-4"
  >
    <!-- 封面 -->
    <div
      class="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-gray-800 sm:aspect-auto sm:h-[132px] sm:w-[200px]"
    >
      <img
        :src="article.coverSrc"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      <span
        class="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2.5 py-1 font-[huoxie] text-[11px] leading-none text-sky-700 backdrop-blur dark:bg-gray-950/75 dark:text-sky-300"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- 标题与信息 -->
    <div class="flex min-w-0 flex-1 flex-col px-1 pb-1 pt-0.5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400 dark:text-gray-500">
        <span class="font-[huoxie] text-sky-600/90 dark:text-sky-400/90">#{{ tag }}</span>
        <span class="inline-flex items-center gap-1">
          <IconFont name="rili" class="text-[13px] text-sky-500/70 dark:text-sky-400/60" />
          {{ date }}
        </span>
      </div>

      <h3
        class="mt-2 line-clamp-2 font-[huoxie] text-[19px] leading-snug text-[#223a5e] transition-colors duration-300 group-hover:text-sky-600 dark:text-gray-100 dark:group-hover:text-sky-300 sm:text-[20px]"
      >
        {{ article.title }}
      </h3>

      <p class="mt-1.5 line-clamp-1 text-[13px] leading-relaxed text-slate-400 dark:text-gray-500">
        {{ article.content }}
      </p>

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
        <div class="flex items-center gap-4 text-[13px] text-slate-400 dark:text-gray-500">
          <span class="inline-flex items-center gap-1">
            <IconFont name="eye" class="text-[14px] text-sky-500/70 dark:text-sky-400/60" />
            {{ article.eyes }}
          </span>
          <span class="inline-flex items-center gap-1">
            <IconFont name="pinglun" class="text-[14px] text-sky-500/70 dark:text-sky-400/60" />
            {{ article.comment }}
          </span>
        </div>

        <span
          aria-hidden="true"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-[13px] text-sky-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-500/10 dark:text-sky-300"
        >
          →
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '@/types/article'

const props = defineProps<{
  article: Article
  tag: string
}>()

const date = computed(() => props.article.time.split(' ')[0] ?? props.article.time)
</script>

<style scoped>
/* 悬停时左侧浮现的一条渐变装饰线 */
.article-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14%;
  bottom: 14%;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #38bdf8, #2563eb, #14b8a6);
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.article-row:hover::before {
  transform: scaleY(1);
}

@media (prefers-reduced-motion: reduce) {
  .article-row,
  .article-row img {
    transition: none;
  }

  .article-row:hover {
    transform: none;
  }

  .article-row::before {
    display: none;
  }
}
</style>
