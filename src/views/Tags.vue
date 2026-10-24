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

    <!-- 背景里持续飘过的半透明标签 -->
    <div class="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <TagsFloating />
    </div>

    <!-- 铺满整页的枫叶粒子 -->
    <div class="pointer-events-none fixed inset-0 z-[2]" aria-hidden="true">
      <HomeLeafParticles />
    </div>

    <TopNavigation variant="light" />

    <main class="relative z-10">
      <TagsContent />
    </main>

    <div class="relative z-10">
      <SiteFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeLeafParticles from '@/components/business/home/HomeLeafParticles.vue'
import TagsFloating from '@/components/business/tags/TagsFloating.vue'
</script>

<style scoped></style>
