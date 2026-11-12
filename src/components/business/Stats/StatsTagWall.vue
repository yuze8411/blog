<template>
  <section
    class="group/card relative flex h-full max-h-[540px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-colors duration-500 hover:border-teal-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-400/25 sm:p-6 lg:max-h-none"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="inline-flex items-center gap-2 font-[huoxie] text-[11px] tracking-[0.3em] text-teal-600/80 dark:text-teal-300/70">
          <span class="h-px w-5 bg-gradient-to-r from-transparent to-teal-400/80" />
          TAG WALL
        </p>
        <h2 class="mt-2 font-[huoxie] text-[24px] tracking-[0.04em] text-slate-800 dark:text-white">
          标签墙
        </h2>
        <p class="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
          <template v-if="loading">正在整理标签…</template>
          <template v-else-if="error">标签暂时加载不出来</template>
          <template v-else>{{ tags.length }} 个标签，按出现次数由多到少</template>
        </p>
      </div>

      <!-- 搜索框：标签多的时候，比一行行找要快 -->
      <label class="relative mt-1 block w-[150px] shrink-0 sm:w-[170px]">
        <span class="sr-only">搜索标签</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        >
          <circle cx="11" cy="11" r="6.3" />
          <path d="m16 16 4 4" stroke-linecap="round" />
        </svg>
        <input
          v-model="keyword"
          type="search"
          placeholder="找标签…"
          class="h-9 w-full rounded-full border border-slate-200/90 bg-slate-50/70 pl-9 pr-3 text-[12.5px] text-slate-600 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-200/60 disabled:cursor-default disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400/40 dark:focus:bg-white/[0.08] dark:focus:ring-teal-400/15"
          :disabled="loading || !!error"
        />
      </label>
    </div>

    <!-- 标签区域固定高度：卡片不会因为标签数量变来变去，右侧可滚动 -->
    <div class="stats-tag-scroll mt-4 min-h-0 flex-1 overflow-y-auto pr-1.5">
      <!-- 加载中：一排宽窄不一的胶囊占位 -->
      <div
        v-if="loading"
        class="flex flex-wrap content-start gap-2.5"
        aria-busy="true"
        aria-label="标签加载中"
      >
        <span
          v-for="n in 16"
          :key="n"
          class="tag-wall-skeleton"
          :style="{ width: skeletonWidth(n) }"
          aria-hidden="true"
        ></span>
      </div>

      <TransitionGroup
        v-else-if="filteredTags.length"
        tag="div"
        name="tag-pop"
        class="flex flex-wrap content-start gap-2.5"
      >
        <RouterLink
          v-for="(tag, index) in filteredTags"
          :key="tag.id"
          :to="{ name: 'tagArticle', params: { tag: tag.name } }"
          class="tag-chip inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 font-[huoxie] text-[12.5px] tracking-[0.02em] shadow-[0_6px_16px_-14px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-[#0d1424]"
          :class="TONES[index % TONES.length]"
          :style="{ animationDelay: `${Math.min(index, 30) * 14}ms` }"
        >
          <span class="opacity-60">#</span>
          <span class="max-w-[150px] truncate">{{ tag.name }}</span>
          <span class="ml-0.5 text-[10.5px] opacity-75">{{ tag.post_count ?? 0 }}</span>
        </RouterLink>
      </TransitionGroup>

      <!-- 加载失败 -->
      <div
        v-else-if="error"
        class="flex h-full min-h-[180px] flex-col items-center justify-center text-center"
      >
        <p class="text-[13px] text-slate-400 dark:text-slate-500">{{ error }}</p>
        <button
          type="button"
          class="mt-3 rounded-full border border-slate-200 px-3.5 py-1.5 text-[12px] text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          @click="emit('retry')"
        >
          重新加载
        </button>
      </div>

      <!-- 一个标签都没有 -->
      <div
        v-else-if="!tags.length"
        class="flex h-full min-h-[180px] flex-col items-center justify-center text-center"
      >
        <p class="font-[huoxie] text-[20px] text-slate-400 dark:text-slate-500">还没有标签</p>
        <p class="mt-2 text-[12.5px] text-slate-400 dark:text-slate-500">
          文章加上标签后，这里会自动长出一面墙。
        </p>
      </div>

      <!-- 搜索没有匹配 -->
      <div
        v-else
        class="flex h-full min-h-[180px] flex-col items-center justify-center text-center"
      >
        <span
          class="grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-sky-300 dark:bg-white/5 dark:text-slate-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            class="h-5 w-5"
          >
            <circle cx="11" cy="11" r="6.3" />
            <path d="m16 16 4 4" stroke-linecap="round" />
          </svg>
        </span>
        <p class="mt-3 text-[13px] text-slate-400 dark:text-slate-500">没有找到「{{ keyword }}」</p>
        <button
          type="button"
          class="mt-3 rounded-full border border-slate-200 px-3.5 py-1.5 text-[12px] text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          @click="keyword = ''"
        >
          清空搜索
        </button>
      </div>
    </div>

    <p
      class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] text-slate-400 dark:border-white/[0.06] dark:text-slate-500"
    >
      <span>点一下，看看这个标签下的文章</span>
      <span class="font-[huoxie] tracking-[0.1em]">
        {{ filteredTags.length }} / {{ tags.length }}
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { PublicTag } from '@/api/posts'

const props = withDefaults(
  defineProps<{
    tags: PublicTag[]
    /** 首次加载中 */
    loading?: boolean
    /** 首次加载失败或刷新失败时的提示 */
    error?: string
  }>(),
  { loading: false, error: '' },
)

const emit = defineEmits<{
  retry: []
}>()

const keyword = ref('')

const filteredTags = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return props.tags
  return props.tags.filter((tag) => tag.name.toLowerCase().includes(query))
})

// 占位胶囊宽度错开，加载完不会整面墙一起跳
const SKELETON_WIDTHS = [58, 74, 66, 90, 82, 60, 96, 70, 78, 88, 62, 84, 72, 100, 68, 76]
function skeletonWidth(index: number) {
  return `${SKELETON_WIDTHS[(index - 1) % SKELETON_WIDTHS.length] ?? 72}px`
}

/**
 * 十二套低饱和的浅色底：保留色相，但把饱和度收下来。
 * 浅色模式用 200 的底色配 800 的字，暗色模式用 10% 的透明色底配 200 的字，
 * 整面墙有颜色，但不会变成一排发光的霓虹按钮。
 */
const TONES = [
  'border-sky-300/70 bg-sky-200/65 text-sky-800 hover:border-sky-300 hover:bg-sky-200/90 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-200 dark:hover:bg-sky-400/15',
  'border-blue-300/70 bg-blue-200/65 text-blue-800 hover:border-blue-300 hover:bg-blue-200/90 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-200 dark:hover:bg-blue-400/15',
  'border-indigo-300/70 bg-indigo-200/65 text-indigo-800 hover:border-indigo-300 hover:bg-indigo-200/90 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-200 dark:hover:bg-indigo-400/15',
  'border-violet-300/70 bg-violet-200/65 text-violet-800 hover:border-violet-300 hover:bg-violet-200/90 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200 dark:hover:bg-violet-400/15',
  'border-fuchsia-300/70 bg-fuchsia-200/65 text-fuchsia-800 hover:border-fuchsia-300 hover:bg-fuchsia-200/90 dark:border-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-400/15',
  'border-rose-300/70 bg-rose-200/65 text-rose-800 hover:border-rose-300 hover:bg-rose-200/90 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200 dark:hover:bg-rose-400/15',
  'border-orange-300/70 bg-orange-200/65 text-orange-800 hover:border-orange-300 hover:bg-orange-200/90 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-200 dark:hover:bg-orange-400/15',
  'border-amber-300/70 bg-amber-200/65 text-amber-800 hover:border-amber-300 hover:bg-amber-200/90 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200 dark:hover:bg-amber-400/15',
  'border-emerald-300/70 bg-emerald-200/65 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-200/90 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/15',
  'border-teal-300/70 bg-teal-200/65 text-teal-800 hover:border-teal-300 hover:bg-teal-200/90 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-200 dark:hover:bg-teal-400/15',
  'border-cyan-300/70 bg-cyan-200/65 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-200/90 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/15',
  'border-lime-300/70 bg-lime-200/65 text-lime-800 hover:border-lime-300 hover:bg-lime-200/90 dark:border-lime-400/25 dark:bg-lime-400/10 dark:text-lime-200 dark:hover:bg-lime-400/15',
]
</script>

<style scoped>
.stats-tag-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(13, 148, 136, 0.35) transparent;
}

.stats-tag-scroll::-webkit-scrollbar {
  width: 5px;
}

.stats-tag-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.stats-tag-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(13, 148, 136, 0.28);
}

.stats-tag-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(13, 148, 136, 0.45);
}

/* ---------- 标签加载占位 ---------- */
.tag-wall-skeleton {
  display: inline-block;
  height: 31px;
  border-radius: 999px;
  background: linear-gradient(110deg, #edf1f6 8%, #f8fbff 18%, #edf1f6 33%);
  background-size: 220% 100%;
  animation: tag-wall-shimmer 1.6s linear infinite;
}

@keyframes tag-wall-shimmer {
  from {
    background-position: 120% 0;
  }

  to {
    background-position: -120% 0;
  }
}

:global(html.dark .tag-wall-skeleton) {
  background: linear-gradient(
    110deg,
    rgba(148, 163, 184, 0.14) 8%,
    rgba(148, 163, 184, 0.24) 18%,
    rgba(148, 163, 184, 0.14) 33%
  );
  background-size: 220% 100%;
}

@media (prefers-reduced-motion: reduce) {
  .tag-wall-skeleton {
    animation: none;
  }
}

/* 初次进入和搜索结果变化时，标签逐个弹出来 */
/* 用 backwards 而不是 both：动画结束后交还 transform，
 * 悬停上浮和 TransitionGroup 的位置过渡才不会被动画的最终帧锁死。
 */
.tag-chip {
  animation: tag-rise 0.42s cubic-bezier(0.22, 0.8, 0.3, 1) backwards;
}

@keyframes tag-rise {
  from {
    opacity: 0;
    transform: translateY(7px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 过滤时只让新出现的标签轻轻弹一下，避免整面墙都在抖 */
.tag-pop-enter-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.tag-pop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.tag-pop-enter-from,
.tag-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.tag-pop-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .tag-chip {
    animation: none;
  }

  .tag-pop-enter-active,
  .tag-pop-leave-active,
  .tag-pop-move {
    transition: none;
  }
}
</style>
