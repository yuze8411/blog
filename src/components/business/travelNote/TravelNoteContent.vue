<template>
  <div class="mx-auto w-[92%] max-w-[1360px] pb-16 pt-8 sm:w-[88%] sm:pt-10">
    <!-- 标题和介绍已经放进上方的封面，这里直接从标签筛选开始 -->
    <nav class="border-b border-slate-200/70 dark:border-slate-800/80" aria-label="照片标签筛选">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
        <span
          class="inline-flex items-center gap-1.5 pb-4 pt-2 text-[12px] tracking-[0.18em] text-slate-400 dark:text-slate-500"
        >
          <IconFont name="biaoqian1" class="text-[14px]" />
          筛选
        </span>
        <span class="mb-4 h-4 w-px bg-slate-200 dark:bg-slate-700"></span>

        <button
          v-for="tag of filterTags"
          :key="tag.name"
          type="button"
          :aria-pressed="tag.name === activeTag"
          class="group relative inline-flex items-baseline gap-2 rounded-md px-2 pb-4 pt-2 font-[huoxie] text-[15px] transition-colors duration-300 sm:text-[16px]"
          :class="
            tag.name === activeTag
              ? 'text-gray-900 dark:text-slate-100'
              : 'text-slate-500 hover:bg-slate-100/70 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-sky-300'
          "
          @click="selectTag(tag.name)"
        >
          <span>{{ tag.name }}</span>
          <span
            class="text-[11px] tabular-nums transition-colors duration-300 sm:text-[12px]"
            :class="
              tag.name === activeTag
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-400/80 group-hover:text-sky-500/80 dark:text-slate-500 dark:group-hover:text-sky-400/80'
            "
          >
            {{ tag.count }}
          </span>
          <span
            class="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-sky-500 transition-opacity duration-300 dark:bg-sky-400"
            :class="tag.name === activeTag ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'"
          ></span>
        </button>

        <span
          class="ml-auto hidden pb-4 pt-2 text-[11px] tracking-[0.14em] text-slate-400 dark:text-slate-500 sm:inline"
        >
          共 {{ totalCount }} 张
        </span>
      </div>
    </nav>

    <section
      v-if="visibleImages.length"
      class="mt-7 grid items-start gap-5 lg:gap-6"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }"
      aria-label="旅游照片"
    >
      <div
        v-for="(column, columnIndex) of imageColumns"
        :key="columnIndex"
        class="flex min-w-0 flex-col gap-5 lg:gap-6"
      >
        <div
          v-for="entry of column"
          :key="entry.item.img_id"
          v-reveal="Math.min(entry.index % PAGE_SIZE, 5) * 70"
          class="min-w-0"
        >
          <article
            role="button"
            tabindex="0"
            :aria-label="`查看大图：${entry.item.img_introduction}`"
            class="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-slate-200/80 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/80 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_26px_48px_-26px_rgba(56,110,170,0.55)] hover:ring-sky-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f8fc] dark:bg-slate-800 dark:ring-slate-700/70 dark:hover:ring-sky-700/60 dark:focus-visible:ring-offset-[#050a12]"
            @click="openLightbox(entry.index)"
            @keydown.enter.prevent="openLightbox(entry.index)"
            @keydown.space.prevent="openLightbox(entry.index)"
          >
            <img
              :src="entry.item.img_url"
              :alt="entry.item.img_introduction"
              :loading="entry.index < 3 ? 'eager' : 'lazy'"
              decoding="async"
              class="block h-auto min-h-[120px] w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
              @error="handleImageError"
            />

            <!-- 悬停时才浮出的介绍、标签和拍摄时间 -->
            <div
              class="pointer-events-none absolute inset-0 flex translate-y-3 flex-col justify-end bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
            >
              <p class="line-clamp-2 font-[huoxie] text-[16px] leading-6 text-white drop-shadow-sm">
                {{ entry.item.img_introduction }}
              </p>

              <div v-if="entry.item.img_tags.length" class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="tag of entry.item.img_tags"
                  :key="tag"
                  class="rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/85 backdrop-blur-sm"
                >
                  #{{ tag }}
                </span>
              </div>

              <div class="mt-2.5 flex items-center gap-1.5 text-[12px] text-white/70">
                <IconFont name="shijian" class="text-[12px]" />
                <span class="tabular-nums">{{ entry.item.img_time }}</span>

                <span
                  class="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/75"
                >
                  查看大图
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3 w-3"
                  >
                    <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- 悬停时右上角的小序号 -->
            <span
              class="pointer-events-none absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-[11px] tabular-nums text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {{ String(entry.index + 1).padStart(2, '0') }}
            </span>
          </article>
        </div>

        <!-- 加载中的骨架屏 -->
        <div
          v-if="loading"
          class="animate-pulse rounded-2xl bg-slate-200/80 ring-1 ring-slate-200/60 dark:bg-slate-800/70 dark:ring-slate-700/50"
          :style="{ height: `${180 + columnIndex * 40}px` }"
          aria-hidden="true"
        ></div>
      </div>
    </section>

    <!-- 首次加载：先铺一层骨架屏，避免空状态一闪而过 -->
    <section
      v-else-if="initialLoading"
      class="mt-7 grid items-start gap-5 lg:gap-6"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }"
      aria-label="照片加载中"
      aria-busy="true"
    >
      <div
        v-for="columnIndex of columnCount"
        :key="columnIndex"
        class="flex min-w-0 flex-col gap-5 lg:gap-6"
      >
        <div
          v-for="rowIndex of 2"
          :key="rowIndex"
          class="animate-pulse rounded-2xl bg-slate-200/80 ring-1 ring-slate-200/60 dark:bg-slate-800/70 dark:ring-slate-700/50"
          :style="{ height: `${200 + ((columnIndex + rowIndex) % 3) * 40}px` }"
          aria-hidden="true"
        ></div>
      </div>
    </section>

    <!-- 加载失败 -->
    <div
      v-else-if="error"
      class="mt-16 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 py-20 text-center dark:border-slate-800"
    >
      <IconFont name="tupian" class="text-[38px] text-slate-300 dark:text-slate-600" />
      <p class="font-[huoxie] text-[16px] text-slate-400 dark:text-slate-500">{{ error }}</p>
      <button
        type="button"
        class="mt-1 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[13px] text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
        @click="emit('retry')"
      >
        重新加载
      </button>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="mt-16 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 py-20 text-center dark:border-slate-800"
    >
      <IconFont name="tupian" class="text-[38px] text-slate-300 dark:text-slate-600" />
      <p class="font-[huoxie] text-[16px] text-slate-400 dark:text-slate-500">
        {{ travelImages.length ? '这个标签下还没有照片' : '游记里还没有照片' }}
      </p>
    </div>

    <!-- 滚动加载哨兵 -->
    <div
      v-if="!error"
      ref="sentinel"
      class="mt-9 flex min-h-[70px] flex-col items-center justify-center gap-2"
    >
      <template v-if="loading">
        <span class="travel-loader" aria-hidden="true"></span>
        <p class="font-[huoxie] text-[12px] tracking-[0.15em] text-slate-400 dark:text-slate-500">
          正在加载更多照片…
        </p>
      </template>
      <p
        v-else-if="hasMore"
        class="font-[huoxie] text-[12px] tracking-[0.15em] text-slate-400 dark:text-slate-500"
      >
        继续向下滑动，加载更多
      </p>
      <p
        v-else-if="visibleImages.length"
        class="flex items-center gap-3 font-[huoxie] text-[12px] tracking-[0.15em] text-slate-400 dark:text-slate-500"
      >
        <span class="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
        已经看到最后一张啦
        <span class="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
      </p>
    </div>

    <!-- 点击图片后的放大预览 -->
    <TravelNoteLightbox v-model:index="lightboxIndex" :images="filteredImages" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { vReveal } from '@/directives/reveal'
import type { TravelImage } from '@/types/travel'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'
import TravelNoteLightbox from './TravelNoteLightbox.vue'

const props = withDefaults(
  defineProps<{
    travelImages: TravelImage[]
    /** 每次加载的照片数量 */
    pageSize?: number
    /** 首次请求数据中 */
    initialLoading?: boolean
    /** 首次请求失败时的提示文字，空字符串表示没有错误 */
    error?: string
  }>(),
  { pageSize: 9, initialLoading: false, error: '' },
)

const emit = defineEmits<{
  /** 加载失败后点「重新加载」 */
  retry: []
}>()

const ALL_TAG = '全部'
const PAGE_SIZE = props.pageSize

const activeTag = ref(ALL_TAG)
const visibleCount = ref(PAGE_SIZE)
const loading = ref(false)
const sentinel = ref<HTMLElement | null>(null)
const lightboxIndex = ref<number | null>(null)

// 总的图片数量，后续请求获取
const totalCount = computed(() => props.travelImages.length)

/** 全部 + 从照片里统计出来的标签，按数量倒序 */
const filterTags = computed(() => {
  const counter = new Map<string, number>()
  for (const item of props.travelImages) {
    for (const tag of item.img_tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }

  const tags = [...counter.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .map(([name, count]) => ({ name, count }))

  return [{ name: ALL_TAG, count: totalCount.value }, ...tags]
})

const filteredImages = computed(() =>
  activeTag.value === ALL_TAG
    ? props.travelImages
    : props.travelImages.filter((item) => item.img_tags.includes(activeTag.value)),
)

const visibleImages = computed(() => filteredImages.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredImages.value.length)

/** 列数：桌面三列，平板两列，手机一列 */
const columnCount = ref(3)

/** 按顺序轮流放进每一列，保证三列宽度相同、列内高度自然错落 */
const imageColumns = computed(() => {
  const columns: { item: TravelImage; index: number }[][] = Array.from(
    { length: columnCount.value },
    () => [],
  )

  visibleImages.value.forEach((item, index) => {
    const column = columns[index % columnCount.value]
    if (column) column.push({ item, index })
  })
  // 二维数组，一维个数为列数，二维为数据
  return columns
})

function syncColumnCount() {
  const width = window.innerWidth
  columnCount.value = width >= 1024 ? 3 : width >= 640 ? 2 : 1
}

let observer: IntersectionObserver | null = null
let loadTimer: number | null = null

function clearLoadTimer() {
  if (loadTimer !== null) {
    window.clearTimeout(loadTimer)
    loadTimer = null
  }
}

/** 重新观察哨兵：列表刚好铺满屏幕时继续自动补一页 */
function reobserve() {
  const el = sentinel.value
  if (!el || !observer) return
  observer.unobserve(el)
  observer.observe(el)
}

function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true

  // 目前照片由父组件一次性传入，这里用短暂延迟模拟“请求下一页”。
  // 接入接口后把定时器换成 await fetchTravelImages(page) 再追加数据即可。
  loadTimer = window.setTimeout(() => {
    loadTimer = null
    // 加载更多
    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filteredImages.value.length)
    loading.value = false
    void nextTick(reobserve)
  }, 280)
}

function selectTag(tag: string) {
  if (tag === activeTag.value) return

  clearLoadTimer()
  loading.value = false
  activeTag.value = tag
  visibleCount.value = PAGE_SIZE
  void nextTick(reobserve)
}

function openLightbox(index: number) {
  lightboxIndex.value = index
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback === '1') return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}

onMounted(() => {
  syncColumnCount()
  window.addEventListener('resize', syncColumnCount, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore()
    },
    { rootMargin: '0px 0px 260px 0px' },
  )

  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => {
  clearLoadTimer()
  window.removeEventListener('resize', syncColumnCount)
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.travel-loader {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(63, 116, 173, 0.18);
  border-top-color: #3f74ad;
  border-radius: 999px;
  animation: travel-spin 0.75s linear infinite;
}

.dark .travel-loader {
  border-color: rgba(142, 203, 255, 0.16);
  border-top-color: #8ecbff;
}

@keyframes travel-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .travel-loader {
    animation-duration: 2s;
  }
}
</style>
