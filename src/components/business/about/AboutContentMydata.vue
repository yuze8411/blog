<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-950">
    <div class="absolute inset-0 overflow-hidden">
      <video autoplay muted loop playsinline class="h-full w-full object-cover">
        <source src="@/assets/images/星空_3.mp4" type="video/mp4" />
      </video>
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/35 to-slate-950/80"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(2,6,23,0.42)_100%)]"
      />
    </div>

    <div
      class="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center gap-12 px-5 py-24 pr-16 sm:px-8 sm:pr-20 md:flex-row md:gap-14 lg:gap-20 lg:pl-12 lg:pr-24"
    >
      <div class="about-avatar group relative shrink-0 items-start mt-[10%]">
        <div
          class="relative rounded-full bg-[conic-gradient(from_140deg,rgba(56,189,248,0.95),rgba(168,85,247,0.9),rgba(244,114,182,0.85),rgba(56,189,248,0.95))] p-1 shadow-[0_28px_70px_-24px_rgba(56,189,248,0.7)]"
        >
          <div
            class="relative h-[200px] w-[200px] overflow-hidden rounded-full bg-slate-900 sm:h-[230px] sm:w-[230px] lg:h-[260px] lg:w-[260px]"
          >
            <img
              src="@/assets/images/mycover.jpg"
              alt="雨落千山的头像"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <span
              class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25"
            />
          </div>
        </div>
      </div>

      <section
        class="about-copy relative flex w-full max-w-[820px] flex-col rounded-[34px] bg-transparent p-7 text-white transition-colors duration-500 dark:border-white/10 sm:p-10 lg:p-12"
      >
        <div class="relative flex flex-1 flex-col gap-10">
          <div>
            <p
              class="inline-flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.32em] text-sky-200 dark:text-sky-300"
            >
              <span
                class="h-px w-7 bg-gradient-to-r from-sky-300 to-transparent dark:from-sky-300"
              />
              关于我
            </p>

            <div
              class="mt-6 text-[38px] font-bold leading-[1.16] tracking-tight text-white sm:text-[48px] lg:text-[90px]"
            >
              你好，我是
              <p
                class="bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent mt-4"
              >
                雨落千山
              </p>
            </div>
          </div>

          <div>
            <p
              class="text-[17px] font-medium leading-8 text-slate-200 dark:text-slate-300 sm:text-[18px]"
            >
              前端开发 · 长期写作者 · 偶尔折腾一些没用但好玩的东西
            </p>

            <p
              class="mt-4 max-w-[700px] text-[16px] leading-8 text-slate-200/90 dark:text-slate-300 sm:text-[17px] sm:leading-9"
            >
              24年开始接触编程，从最初的懵懵懂懂，到现在的清楚的知道学习什么，该用学到的东西做什么，一路走来，平凡又精彩，未来可期
            </p>
          </div>

          <!-- 兴趣标签改成小卡片：图标、名称、一句很短的注脚 -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              class="group/tag flex min-h-[116px] flex-col justify-between rounded-2xl border border-sky-300/30 bg-sky-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/55 hover:bg-sky-400/20 dark:border-sky-400/20 dark:bg-sky-400/10 dark:hover:bg-sky-400/15"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/25 bg-sky-400/15 text-sky-100 transition-transform duration-300 group-hover/tag:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  class="h-[18px] w-[18px]"
                >
                  <path
                    d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span>
                <span class="block text-[14px] font-semibold text-sky-50">前端开发</span>
                <span class="mt-1 block text-[11.5px] text-sky-100/65">界面与交互</span>
              </span>
            </div>

            <div
              class="group/tag flex min-h-[116px] flex-col justify-between rounded-2xl border border-violet-300/30 bg-violet-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/55 hover:bg-violet-400/20 dark:border-violet-400/20 dark:bg-violet-400/10 dark:hover:bg-violet-400/15"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-violet-300/25 bg-violet-400/15 text-violet-100 transition-transform duration-300 group-hover/tag:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  class="h-[18px] w-[18px]"
                >
                  <path d="m3 19 6-10 4 6 2-3 6 7H3Z" stroke-linejoin="round" />
                  <path d="m7.8 11.5 1.2 1 1.2-1" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span>
                <span class="block text-[14px] font-semibold text-violet-50">爬山</span>
                <span class="mt-1 block text-[11.5px] text-violet-100/65">山野与呼吸</span>
              </span>
            </div>

            <div
              class="group/tag flex min-h-[116px] flex-col justify-between rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/55 hover:bg-fuchsia-400/20 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10 dark:hover:bg-fuchsia-400/15"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-fuchsia-300/25 bg-fuchsia-400/15 text-fuchsia-100 transition-transform duration-300 group-hover/tag:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  class="h-[18px] w-[18px]"
                >
                  <path
                    d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z"
                    stroke-linejoin="round"
                  />
                  <path d="M5 18a2 2 0 0 1 2-2h11M9 8h5" stroke-linecap="round" />
                </svg>
              </span>
              <span>
                <span class="block text-[14px] font-semibold text-fuchsia-50">独立博客</span>
                <span class="mt-1 block text-[11.5px] text-fuchsia-100/65">记录与表达</span>
              </span>
            </div>

            <div
              class="group/tag flex min-h-[116px] flex-col justify-between rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/55 hover:bg-amber-400/20 dark:border-amber-400/20 dark:bg-amber-400/10 dark:hover:bg-amber-400/15"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-amber-300/25 bg-amber-400/15 text-amber-100 transition-transform duration-300 group-hover/tag:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  class="h-[18px] w-[18px]"
                >
                  <path d="M4 8h3l1.5-2h7L17 8h3v10H4V8Z" stroke-linejoin="round" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </span>
              <span>
                <span class="block text-[14px] font-semibold text-amber-50">摄影</span>
                <span class="mt-1 block text-[11.5px] text-amber-100/65">光影与瞬间</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
// 第一页数据
</script>

<style scoped>
/* ---------------- 头像 ---------------- */
.about-avatar {
  animation: avatar-float 7s ease-in-out infinite;
}

.avatar-halo {
  position: absolute;
  inset: -22px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.35),
    rgba(56, 189, 248, 0.12) 45%,
    transparent 70%
  );
  filter: blur(18px);
  animation: halo-pulse 6s ease-in-out infinite;
}

/* 透明卡片上的字直接压在星空上，给一层很淡的文字阴影保证可读性 */
.about-copy {
  text-shadow: 0 1px 18px rgba(2, 6, 23, 0.55);
}

@keyframes avatar-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes halo-pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-avatar,
  .avatar-halo {
    animation: none;
  }
}
</style>
