<template>
  <div class="relative min-h-screen overflow-x-hidden bg-[#f5f8fc] dark:bg-[#050a12]">
    <!-- 页面底色光晕 -->
    <div class="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div
        class="absolute -left-40 -top-24 h-[520px] w-[520px] rounded-full bg-sky-200/35 blur-[130px] dark:bg-sky-900/20"
      ></div>
      <div
        class="absolute -right-40 top-[28%] h-[480px] w-[480px] rounded-full bg-indigo-200/25 blur-[140px] dark:bg-indigo-900/15"
      ></div>
      <div
        class="absolute bottom-0 left-1/3 h-[420px] w-[520px] rounded-full bg-teal-100/30 blur-[150px] dark:bg-teal-900/10"
      ></div>
    </div>

    <!-- 封面图会盖住页面顶部，默认导航在图片上使用白色文字，和首页一致 -->
    <TopNavigation />

    <main class="relative z-10">
      <TravelNoteCover :total="travelImages.length" />
      <TravelNoteContent
        :travel-images="travelImages"
        :initial-loading="loading"
        :error="error"
        @retry="loadTravelImages"
      />
    </main>

    <div class="relative z-10">
      <SiteFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchTravelImages } from '@/api/travel'
import type { TravelImage } from '@/types/travel'
import TravelNoteCover from '@/components/business/travelNote/TravelNoteCover.vue'
import TravelNoteContent from '@/components/business/travelNote/TravelNoteContent.vue'

const travelImages = ref<TravelImage[]>([])
const loading = ref(true)
const error = ref('')

async function loadTravelImages() {
  loading.value = true
  error.value = ''

  try {
    travelImages.value = await fetchTravelImages()
  } catch (err) {
    console.error('[travel] 获取游记照片失败', err)
    error.value = '照片加载失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTravelImages()
})
</script>
