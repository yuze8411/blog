<template>
  <div
    class="relative min-h-screen overflow-x-hidden bg-white text-slate-700 transition-colors duration-500 dark:bg-[#070c17] dark:text-slate-300"
  >
    <!-- ========== 页面背景：白底 + 几团很淡的蓝色光晕，别抢内容的颜色 ========== -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(219,234,254,0.42),transparent_56%)] dark:bg-[radial-gradient(circle_at_50%_-12%,rgba(37,99,235,0.14),transparent_56%)]"
      />
      <div
        class="absolute -left-40 top-20 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.16),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(56,189,248,0.08),transparent_68%)]"
      />
      <div
        class="absolute -right-44 top-[36%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.14),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]"
      />
      <div
        class="absolute bottom-[-12%] left-1/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(191,219,254,0.12),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_70%)]"
      />
    </div>

    <TopNavigation variant="light" />

    <main class="relative z-10">
      <StatsContent />
    </main>

    <SiteFooter
      class="relative z-10 border-slate-200/70 bg-white/50 backdrop-blur-sm dark:border-white/[0.06] dark:bg-transparent"
    />
  </div>
</template>

<script setup lang="ts">
import TopNavigation from '@/components/common/TopNavigation.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import StatsContent from '@/components/business/Stats/StatsContent.vue'
</script>
