<template>
  <div class="relative mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
    <!-- 页头标题 -->
    <header class="tags-hero pb-5 pt-28 text-center sm:pt-32">
      <h1 class="tags-title font-[huoxie]">标签墙</h1>
    </header>

    <!-- 标签墙 -->
    <section class="relative mb-24">
      <div
        class="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-[#dcc8a8]/70 pb-4 dark:border-[#4a3826]/70"
      >
        <p class="font-[huoxie] text-[12px] tracking-[0.34em] text-[#a16207] dark:text-[#d9b48a]">
          ALL TAGS
        </p>
        <p class="font-[huoxie] text-[14px] text-[#8a6a45] dark:text-[#b99a7a]">
          共 {{ tagWall.length }} 个 · 按热度排列
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <span
          v-for="(tag, index) in tagWall"
          :key="tag.name"
          :aria-label="`${tag.name}，${tag.count} 篇文章`"
          class="tag-chip cursor-pointer"
          :class="[`tone-${index % 12}`, sizeClass(tag.count)]"
          :style="{ animationDelay: `${index * 40}ms` }"
          @click="toTagArticles(tag.name)"
        >
          <span class="tag-hash" aria-hidden="true">#</span>
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">{{ tag.count }}</span>
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { tagWall } from '@/data/tags'
import { useRouter } from 'vue-router'
const router = useRouter()
// 按热度给标签分三档字号，让墙面有轻重层次
function sizeClass(count: number) {
  if (count >= 15) return 'tag-lg'
  if (count >= 8) return 'tag-md'
  return 'tag-sm'
}
function toTagArticles(tagName: string): void {
  router.push(`/tags/${tagName}`)
}
</script>

<style scoped>
/* ---------------- 页头 ---------------- */
.tags-hero {
  isolation: isolate;
}

.tags-title {
  position: relative;
  display: inline-block;
  font-size: clamp(44px, 7vw, 86px);
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 1.1;
  background-image: linear-gradient(
    110deg,
    #2563eb 0%,
    #6366f1 18%,
    #a855f7 36%,
    #ec4899 54%,
    #f59e0b 72%,
    #10b981 88%,
    #2563eb 100%
  );
  background-size: 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 14px 26px rgba(99, 102, 241, 0.16));
  animation: title-shimmer 12s ease-in-out infinite;
}

@keyframes title-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.hero-divider .line {
  width: clamp(64px, 12vw, 150px);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(180, 138, 88, 0.6));
}

.hero-divider .line:last-child {
  background: linear-gradient(90deg, rgba(180, 138, 88, 0.6), transparent);
}

.hero-divider .dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: rgba(234, 88, 12, 0.7);
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.12);
}

/* ---------------- 标签 ---------------- */
.tag-chip {
  --tag-tilt: -6deg;

  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--tag-line);
  border-radius: 999px;
  background-color: var(--tag-bg);
  background-image: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.5) 0%,
    var(--tag-bg) 40%,
    var(--tag-bg-2) 100%
  );
  color: var(--tag-fg);
  font-family: 'huoxie', serif;
  line-height: 1;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    0 10px 20px -18px rgba(30, 41, 59, 0.35);
  animation: tag-enter 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.tag-chip:nth-child(even) {
  --tag-tilt: 6deg;
}

.tag-chip:hover {
  transform: translateY(-3px) scale(1.04);
  border-color: currentColor;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 18px 30px -18px rgba(30, 41, 59, 0.45);
}

/* 逐个弹出：带一点回弹和左右倾斜，结束时不保留 transform，避免影响 hover */
@keyframes tag-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.72) rotate(var(--tag-tilt));
  }
  55% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.tag-hash {
  font-size: 0.82em;
  opacity: 0.55;
}

.tag-count {
  margin-left: 5px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  font-family: 'huoxie', serif;
  font-size: 11px;
  line-height: 1;
  opacity: 0.8;
}

.tag-sm {
  padding: 8px 14px;
  font-size: 15px;
}

.tag-md {
  padding: 10px 18px;
  font-size: 17px;
}

.tag-lg {
  padding: 12px 22px;
  font-size: 20px;
}

@media (max-width: 640px) {
  .tag-sm {
    font-size: 13px;
  }

  .tag-md {
    font-size: 14px;
  }

  .tag-lg {
    font-size: 16px;
  }
}

/* 十二组柔和彩色，按色相环顺序排列，相邻标签颜色过渡更自然 */
.tone-0 {
  --tag-bg: hsl(340 58% 91%);
  --tag-bg-2: hsl(346 56% 88%);
  --tag-fg: hsl(340 40% 36%);
  --tag-line: hsl(340 45% 84%);
}

.tone-1 {
  --tag-bg: hsl(8 58% 90%);
  --tag-bg-2: hsl(16 56% 87%);
  --tag-fg: hsl(8 42% 36%);
  --tag-line: hsl(8 46% 83%);
}

.tone-2 {
  --tag-bg: hsl(26 60% 89%);
  --tag-bg-2: hsl(32 58% 86%);
  --tag-fg: hsl(24 44% 34%);
  --tag-line: hsl(24 48% 82%);
}

.tone-3 {
  --tag-bg: hsl(44 62% 87%);
  --tag-bg-2: hsl(50 58% 84%);
  --tag-fg: hsl(42 46% 32%);
  --tag-line: hsl(42 50% 80%);
}

.tone-4 {
  --tag-bg: hsl(80 45% 87%);
  --tag-bg-2: hsl(88 42% 84%);
  --tag-fg: hsl(78 36% 31%);
  --tag-line: hsl(78 40% 79%);
}

.tone-5 {
  --tag-bg: hsl(150 42% 87%);
  --tag-bg-2: hsl(158 40% 84%);
  --tag-fg: hsl(152 38% 30%);
  --tag-line: hsl(150 38% 79%);
}

.tone-6 {
  --tag-bg: hsl(176 42% 86%);
  --tag-bg-2: hsl(184 40% 83%);
  --tag-fg: hsl(178 40% 29%);
  --tag-line: hsl(176 38% 78%);
}

.tone-7 {
  --tag-bg: hsl(202 55% 88%);
  --tag-bg-2: hsl(210 52% 85%);
  --tag-fg: hsl(204 44% 33%);
  --tag-line: hsl(202 48% 81%);
}

.tone-8 {
  --tag-bg: hsl(226 50% 89%);
  --tag-bg-2: hsl(234 48% 86%);
  --tag-fg: hsl(228 38% 38%);
  --tag-line: hsl(226 44% 83%);
}

.tone-9 {
  --tag-bg: hsl(256 48% 90%);
  --tag-bg-2: hsl(264 46% 87%);
  --tag-fg: hsl(258 36% 40%);
  --tag-line: hsl(256 42% 84%);
}

.tone-10 {
  --tag-bg: hsl(288 46% 90%);
  --tag-bg-2: hsl(296 44% 87%);
  --tag-fg: hsl(290 36% 38%);
  --tag-line: hsl(288 40% 84%);
}

.tone-11 {
  --tag-bg: hsl(318 50% 90%);
  --tag-bg-2: hsl(326 48% 87%);
  --tag-fg: hsl(320 38% 37%);
  --tag-line: hsl(318 42% 84%);
}

/* ---------------- 暗色 ---------------- */
.dark .hero-divider .line {
  background: linear-gradient(90deg, transparent, rgba(190, 150, 100, 0.35));
}

.dark .hero-divider .line:last-child {
  background: linear-gradient(90deg, rgba(190, 150, 100, 0.35), transparent);
}

.dark .tags-title {
  background-image: linear-gradient(
    110deg,
    #93c5fd 0%,
    #a5b4fc 18%,
    #d8b4fe 36%,
    #f9a8d4 54%,
    #fcd34d 72%,
    #6ee7b7 88%,
    #93c5fd 100%
  );
  filter: drop-shadow(0 14px 30px rgba(129, 140, 248, 0.26));
}

.dark .tag-chip {
  background-image: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.07) 0%,
    var(--tag-bg) 40%,
    var(--tag-bg-2) 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 22px -18px rgba(0, 0, 0, 0.8);
}

.dark .tag-chip:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 18px 30px -18px rgba(0, 0, 0, 0.9);
}

.dark .tag-count {
  background: rgba(255, 255, 255, 0.1);
}

.dark .tone-0 {
  --tag-bg: hsl(340 45% 42% / 0.2);
  --tag-bg-2: hsl(346 45% 42% / 0.28);
  --tag-fg: hsl(340 72% 84%);
  --tag-line: hsl(340 48% 62% / 0.32);
}

.dark .tone-1 {
  --tag-bg: hsl(8 45% 42% / 0.2);
  --tag-bg-2: hsl(14 45% 42% / 0.28);
  --tag-fg: hsl(8 72% 84%);
  --tag-line: hsl(8 48% 62% / 0.32);
}

.dark .tone-2 {
  --tag-bg: hsl(26 45% 42% / 0.2);
  --tag-bg-2: hsl(32 45% 42% / 0.28);
  --tag-fg: hsl(26 72% 84%);
  --tag-line: hsl(26 48% 62% / 0.32);
}

.dark .tone-3 {
  --tag-bg: hsl(44 45% 42% / 0.2);
  --tag-bg-2: hsl(50 45% 42% / 0.28);
  --tag-fg: hsl(44 72% 84%);
  --tag-line: hsl(44 48% 62% / 0.32);
}

.dark .tone-4 {
  --tag-bg: hsl(80 40% 38% / 0.2);
  --tag-bg-2: hsl(88 40% 38% / 0.28);
  --tag-fg: hsl(80 58% 82%);
  --tag-line: hsl(80 42% 58% / 0.32);
}

.dark .tone-5 {
  --tag-bg: hsl(150 40% 38% / 0.2);
  --tag-bg-2: hsl(158 40% 38% / 0.28);
  --tag-fg: hsl(150 58% 82%);
  --tag-line: hsl(150 42% 58% / 0.32);
}

.dark .tone-6 {
  --tag-bg: hsl(176 40% 37% / 0.2);
  --tag-bg-2: hsl(184 40% 37% / 0.28);
  --tag-fg: hsl(176 58% 82%);
  --tag-line: hsl(176 42% 57% / 0.32);
}

.dark .tone-7 {
  --tag-bg: hsl(202 45% 40% / 0.2);
  --tag-bg-2: hsl(210 45% 40% / 0.28);
  --tag-fg: hsl(202 72% 84%);
  --tag-line: hsl(202 48% 60% / 0.32);
}

.dark .tone-8 {
  --tag-bg: hsl(226 42% 42% / 0.2);
  --tag-bg-2: hsl(234 42% 42% / 0.28);
  --tag-fg: hsl(226 70% 85%);
  --tag-line: hsl(226 45% 62% / 0.32);
}

.dark .tone-9 {
  --tag-bg: hsl(256 40% 42% / 0.2);
  --tag-bg-2: hsl(264 40% 42% / 0.28);
  --tag-fg: hsl(256 70% 85%);
  --tag-line: hsl(256 44% 62% / 0.32);
}

.dark .tone-10 {
  --tag-bg: hsl(288 40% 42% / 0.2);
  --tag-bg-2: hsl(296 40% 42% / 0.28);
  --tag-fg: hsl(288 68% 85%);
  --tag-line: hsl(288 44% 62% / 0.32);
}

.dark .tone-11 {
  --tag-bg: hsl(318 42% 42% / 0.2);
  --tag-bg-2: hsl(326 42% 42% / 0.28);
  --tag-fg: hsl(318 68% 85%);
  --tag-line: hsl(318 45% 62% / 0.32);
}

@media (prefers-reduced-motion: reduce) {
  .tags-title,
  .tag-chip {
    animation: none;
  }
}
</style>
