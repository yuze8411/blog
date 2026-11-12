<template>
  <article
    role="link"
    tabindex="0"
    :aria-label="`阅读文章：${article.title}`"
    class="article-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_40px_-30px_rgba(47,74,119,0.45)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_28px_50px_-26px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-sky-500/40 dark:hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] dark:focus-visible:ring-offset-gray-950"
    @click="emit('open')"
    @keydown.enter.prevent="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <!-- 封面 -->
    <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-gray-800">
      <img
        :src="article.coverSrc"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        @error="handleCoverError"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1c33]/55 via-[#0e1c33]/5 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
      ></div>
      <span class="card-shine" aria-hidden="true"></span>
    </div>

    <!-- 标题 + 文章信息 -->
    <div class="flex flex-1 flex-col px-5 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
      <h3
        class="line-clamp-2 min-h-[2.6em] font-[huoxie] text-[20px] leading-[1.3] text-[#223a5e] transition-colors duration-300 group-hover:text-sky-600 dark:text-gray-100 dark:group-hover:text-sky-300 sm:text-[21px]"
      >
        {{ article.title }}
      </h3>

      <div
        class="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-gray-800"
      >
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-400 dark:text-gray-500"
        >
          <span class="inline-flex items-center gap-1">
            <IconFont name="rili" class="text-[14px] text-sky-500/80 dark:text-sky-400/70" />
            {{ date }}
          </span>
          <span class="inline-flex items-center gap-1">
            <IconFont name="eye" class="text-[14px] text-sky-500/80 dark:text-sky-400/70" />
            {{ article.eyes }}
          </span>
          <span class="inline-flex items-center gap-1">
            <IconFont name="pinglun" class="text-[14px] text-sky-500/80 dark:text-sky-400/70" />
            {{ article.comment }}
          </span>
        </div>

        <span
          aria-hidden="true"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[13px] text-sky-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-500/10 dark:text-sky-300"
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
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

const props = defineProps<{ article: Article }>()
const emit = defineEmits<{ open: [] }>()

const date = computed(() => props.article.time.split(' ')[0] ?? props.article.time)

/** 封面地址失效时退回本地默认图 */
function handleCoverError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}
</script>

<style scoped>
/* 悬停时从封面上掠过的一道光 */
.card-shine {
  position: absolute;
  inset: -30% -60%;
  background: linear-gradient(
    105deg,
    transparent 38%,
    rgba(255, 255, 255, 0.28) 50%,
    transparent 62%
  );
  transform: translateX(-70%) rotate(2deg);
  opacity: 0;
  transition:
    transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.3s ease;
  pointer-events: none;
}

.article-card:hover .card-shine {
  transform: translateX(70%) rotate(2deg);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .article-card,
  .article-card img,
  .card-shine {
    transition: none;
  }

  .article-card:hover {
    transform: none;
  }

  .article-card:hover .card-shine {
    display: none;
  }
}
</style>
