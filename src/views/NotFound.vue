<template>
  <div class="min-h-screen flex flex-col bg-[rgb(250,250,250)] dark:bg-gray-950">
    <main
      class="relative flex-1 pt-16 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-[rgb(250,250,250)] dark:from-gray-950 dark:via-gray-950 dark:to-gray-950"
    >
      <!-- 背景：月光 / 薄雾 -->
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          class="absolute -top-20 right-[8%] w-[280px] h-[280px] rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl"
        ></div>
        <div
          class="absolute top-1/3 -left-24 w-[320px] h-[320px] rounded-full bg-[#8ecbff]/20 dark:bg-sky-400/5 blur-3xl animate-mist"
        ></div>
        <div
          class="absolute bottom-24 right-[15%] w-[360px] h-[200px] rounded-full bg-white/70 dark:bg-gray-800/30 blur-3xl animate-mist-slow"
        ></div>
      </div>

      <!-- 背景：雨丝 -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span
          v-for="(drop, i) in drops"
          :key="i"
          class="rain-drop"
          :style="{
            left: drop.left + '%',
            height: drop.height + 'px',
            opacity: drop.opacity,
            animationDelay: drop.delay + 's',
            animationDuration: drop.duration + 's',
          }"
        ></span>
      </div>

      <!-- 正文 -->
      <section
        class="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-0 sm:pt-20 sm:pb-0"
      >
        <div class="relative">
          <!-- 背后的淡影 -->
          <span
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-[xuanzong] text-[180px] sm:text-[260px] leading-none text-sky-100/70 dark:text-gray-800/60 blur-[2px]"
            aria-hidden="true"
          >
            404
          </span>

          <h1
            class="relative font-[xuanzong] text-[120px] sm:text-[180px] leading-none tracking-[0.08em] bg-gradient-to-b from-[#2f4a77] via-[#4976b3] to-[#8ecbff] bg-clip-text text-transparent drop-shadow-[0_6px_24px_rgba(120,170,230,0.28)] dark:from-white dark:via-sky-200 dark:to-sky-500"
          >
            404
          </h1>
        </div>

        <p
          class="mt-4 font-[huoxie] text-[20px] sm:text-[23px] tracking-[0.25em] text-[#2f4a77] dark:text-sky-200"
        >
          山雨迷途 · 此路未通
        </p>

        <p
          class="mt-4 max-w-[520px] font-[huoxie] text-[16px] sm:text-[18px] leading-8 text-gray-700 dark:text-gray-400"
        >
          你踏上的这条山径，暂未落在「雨落千山」的卷册里。
          <br class="hidden sm:block" />
          或许是墨迹被雨打湿，或许是链接走岔了路。
        </p>

        <code
          class="mt-5 max-w-[80vw] truncate rounded-full border border-gray-200/80 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 px-4 py-1.5 text-[13px] text-gray-400 dark:text-gray-500 backdrop-blur"
        >
          {{ route.fullPath }}
        </code>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 rounded-full bg-[#2f4a77] px-7 py-2.5 font-[huoxie] text-[18px] text-white shadow-lg shadow-[#2f4a77]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3d5f96] hover:shadow-xl dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <IconFont name="shouye" class="text-[18px]" />
            回到首页
          </RouterLink>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 px-7 py-2.5 font-[huoxie] text-[18px] text-[#2f4a77] dark:text-gray-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-50 dark:hover:bg-gray-800"
            @click="goBack"
          >
            <span class="text-[18px] leading-none">←</span>
            返回上一页
          </button>
        </div>

        <p class="mt-10 font-[huoxie] text-[14px] text-gray-600 dark:text-gray-600">
          雨会停，路会通，去首页听听山风吧。
        </p>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 雨丝参数固定生成，避免每次渲染跳动
const drops = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  height: 36 + ((i * 17) % 34),
  opacity: 0.12 + ((i * 7) % 26) / 100,
  delay: -((i * 13) % 60) / 10,
  duration: 2.2 + ((i * 11) % 18) / 10,
}))

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.rain-drop {
  position: absolute;
  top: -12vh;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(to bottom, transparent, rgba(0, 128, 255, 0.75));
  animation-name: rain-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  transform: rotate(8deg);
}

@keyframes rain-fall {
  from {
    transform: translate3d(0, -12vh, 0) rotate(8deg);
  }
  to {
    transform: translate3d(-60px, 120vh, 0) rotate(8deg);
  }
}

.animate-mist {
  animation: mist-float 14s ease-in-out infinite;
}

.animate-mist-slow {
  animation: mist-float 22s ease-in-out infinite reverse;
}

@keyframes mist-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(30px, -18px, 0) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rain-drop,
  .animate-mist,
  .animate-mist-slow {
    animation: none;
  }
  .rain-drop {
    display: none;
  }
}
</style>
