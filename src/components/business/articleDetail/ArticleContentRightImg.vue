<template>
  <aside
    class="group w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white/85 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/85"
  >
    <!-- 封面 + 文章标题 -->
    <div class="relative h-[170px] overflow-hidden">
      <img
        :src="virtureData.coverUrl || fallbackCover"
        :alt="virtureData.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="handleCoverError"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/25 to-transparent"
        aria-hidden="true"
      ></div>

      <span
        class="absolute left-3 top-3 rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 font-[huoxie] text-[11px] tracking-[1px] text-white backdrop-blur-sm"
      >
        {{ virtureData.category }}
      </span>

      <div class="absolute inset-x-0 bottom-0 p-4">
        <h3 class="line-clamp-2 font-[huoxie] text-[17px] leading-snug text-white text-center">
          {{ virtureData.title }}
        </h3>
      </div>
    </div>

    <!-- 作者与文章信息 -->
    <div class="p-4">
      <div class="flex items-center gap-2.5">
        <img
          src="@/assets/images/mycover.jpg"
          alt="作者头像"
          class="h-7 w-7 rounded-full object-cover ring-2 ring-white/70 dark:ring-gray-700"
        />
        <div class="min-w-0">
          <p class="truncate font-[huoxie] text-[16px] text-gray-900 dark:text-gray-300">
            雨落千山
          </p>
          <p class="text-[11px] text-gray-600 dark:text-gray-500">前端开发者</p>
        </div>
        <span class="ml-auto shrink-0 text-[11px] text-gray-600 dark:text-gray-500">
          {{ virtureData.publishTime }}
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ArticleDetailProps } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

defineProps<ArticleDetailProps>()

function handleCoverError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}
</script>

<style scoped></style>
