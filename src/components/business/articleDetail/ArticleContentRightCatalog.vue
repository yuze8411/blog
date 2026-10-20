<template>
  <aside
    class="w-full rounded-xl border border-gray-200/80 bg-white/85 p-4 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/85"
  >
    <div class="flex items-center">
      <h2 class="text-[22px] tracking-[2px] text-gray-800 dark:text-gray-100 font-[huoxie]">
        目录
      </h2>

      <button
        type="button"
        class="group relative ml-auto grid h-7 w-7 place-items-center rounded-full"
        title="回到顶部"
        aria-label="回到顶部"
        @click="backToTop"
      >
        <svg class="absolute h-7 w-7 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            class="text-sky-500 transition-[stroke-dashoffset] duration-150 ease-out dark:text-sky-400"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="CIRCUMFERENCE * (1 - progress)"
          />
        </svg>
        <span
          v-if="showArrow"
          class="relative text-[12px] leading-none text-gray-400 transition-colors group-hover:text-sky-500 dark:text-gray-500 dark:group-hover:text-sky-400"
        >
          ↑
        </span>
        <span
          v-else
          class="relative text-[10px] leading-none tabular-nums text-gray-400 transition-colors group-hover:text-sky-500 dark:text-gray-500 dark:group-hover:text-sky-400"
        >
          {{ progressPercent }}
        </span>
      </button>
    </div>

    <div class="mt-3 border-t border-gray-100 dark:border-gray-800"></div>

    <nav
      v-if="toc.length"
      class="catalog-scroll mt-2 max-h-[calc(100vh-220px)] overflow-y-auto"
      aria-label="文章目录"
    >
      <a
        v-for="(item, index) in toc"
        :key="item.id + '-' + index"
        :href="'#' + item.id"
        class="block rounded py-[5px] font-[huoxie] text-[14px] leading-5 text-gray-500 transition-colors duration-200 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400"
        :style="{ paddingLeft: 4 + (item.level - minLevel) * 14 + 'px' }"
        @click.prevent="scrollTo(item.id)"
      >
        <span class="line-clamp-2">{{ item.title }}</span>
      </a>
    </nav>

    <p v-else class="mt-3 font-[huoxie] text-[13px] text-gray-400 dark:text-gray-500">
      这篇文章还没有目录，慢慢读吧。
    </p>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ArticleDetailProps, TocItem } from '@/types'
import { extractToc } from '@/utils/markdown'

const props = defineProps<ArticleDetailProps>()

const toc = computed<TocItem[]>(() => extractToc(props.virtureData.content))
const minLevel = computed(() => toc.value.reduce((min, item) => Math.min(min, item.level), 4))

const CIRCUMFERENCE = 2 * Math.PI * 15
const progress = ref(0)
const progressPercent = computed(() => Math.min(100, Math.round(progress.value * 100)))

const scrollingUp = ref(false)
let lastScrollY = 0

const showArrow = computed(() => scrollingUp.value || progressPercent.value >= 100)

function updateProgress() {
  const y = window.scrollY
  if (y !== lastScrollY) {
    scrollingUp.value = y < lastScrollY
    lastScrollY = y
  }

  const article = document.getElementById('article-content')
  if (!article) return

  const rect = article.getBoundingClientRect()
  const scrollable = rect.height - window.innerHeight
  if (scrollable <= 0) {
    progress.value = rect.top < 0 ? 1 : 0
    return
  }
  const scrolled = -rect.top
  progress.value = Math.min(1, Math.max(0, scrolled / scrollable))
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  lastScrollY = window.scrollY
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})
</script>

<style scoped>
.catalog-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

.catalog-scroll::-webkit-scrollbar {
  width: 3px;
}

.catalog-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background-color: rgba(148, 163, 184, 0.4);
}

.catalog-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
