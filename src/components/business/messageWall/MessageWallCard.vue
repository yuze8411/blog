<template>
  <article class="wall-card" :class="{ 'is-owner': message.is_owner }" :style="cardStyle">
    <!-- 顶部的小圆点 + 淡渐变，像一张钉在墙上的便签 -->
    <span class="wall-card-pin" aria-hidden="true"></span>
    <span class="wall-card-wash" aria-hidden="true"></span>
    <span class="wall-card-quote" aria-hidden="true">”</span>

    <header class="relative flex items-start gap-3">
      <div class="wall-card-avatar relative shrink-0">
        <CommentAvatar :name="message.nickname" :src="avatarUrl" :size="44" tone="cool" />
        <span v-if="message.is_owner" class="wall-card-owner-dot" aria-hidden="true"></span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            class="truncate font-[huoxie] text-[15.5px] font-medium tracking-[0.03em] text-zinc-800 dark:text-zinc-100"
          >
            {{ message.nickname }}
          </span>
          <span v-if="message.is_owner" class="wall-card-owner-badge">博主</span>
          <span v-else class="wall-card-guest-badge">访客</span>
        </div>

        <a
          v-if="message.website_url"
          :href="message.website_url"
          target="_blank"
          rel="noopener noreferrer"
          class="wall-card-link"
          :title="message.website_url"
          @click.stop
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7.2" />
            <path
              d="M2.8 10h14.4M10 2.8c2.1 2 3.1 4.5 3.1 7.2s-1 5.2-3.1 7.2C7.9 15.2 6.9 12.7 6.9 10s1-5.2 3.1-7.2Z"
            />
          </svg>
          <span class="truncate">{{ websiteHost }}</span>
        </a>
        <span v-else class="wall-card-role">路过的旅人</span>
      </div>

      <time class="wall-card-time shrink-0" :datetime="message.created_at" :title="fullTime">
        {{ timeAgo }}
      </time>
    </header>

    <div class="relative mt-4">
      <p class="wall-card-text" :class="{ 'is-collapsed': !expanded }">{{ message.content }}</p>
      <button
        v-if="canExpand"
        type="button"
        class="wall-card-expand"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开全文' }}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          :class="{ 'is-open': expanded }"
        >
          <path d="m4 6 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <footer class="wall-card-footer">
      <span class="wall-card-rule" aria-hidden="true"></span>
      <span class="wall-card-no">{{ message.id.slice(0, 4).toUpperCase() }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CommentAvatar from '@/components/common/comment/CommentAvatar.vue'
import ownerFallbackAvatar from '@/assets/images/mycover.jpg'
import type { PublicMessageRow } from '@/api/messages'
import { formatDate } from '@/utils/date'

const props = withDefaults(
  defineProps<{
    message: PublicMessageRow
    /** 控制入场动画的先后顺序和卡片微微倾斜的角度 */
    index?: number
  }>(),
  { index: 0 },
)

const expanded = ref(false)

const avatarUrl = computed(() => {
  if (props.message.avatar_url) return props.message.avatar_url
  return props.message.is_owner ? ownerFallbackAvatar : undefined
})

const websiteHost = computed(() => {
  const raw = props.message.website_url
  if (!raw) return ''
  try {
    return new URL(raw).hostname.replace(/^www\./i, '')
  } catch {
    return raw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  }
})

const canExpand = computed(() => props.message.content.length > 110)

const fullTime = computed(() => formatDate(props.message.created_at))

// 墙上留言按时间倒序展示，这里用「刚刚 / 几小时前」让留言看起来更鲜活
const timeAgo = computed(() => {
  const date = new Date(props.message.created_at)
  if (Number.isNaN(date.getTime())) return ''

  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return formatDate(props.message.created_at, false)
})

const cardStyle = computed(() => {
  // 角度控制在 ±0.4 度，看起来像手贴上去的卡片，但不会歪得影响阅读
  const tilt = ((props.index % 5) - 2) * 0.16
  return {
    animationDelay: `${Math.min(props.index, 12) * 45}ms`,
    '--wall-tilt': `${tilt}deg`,
  }
})
</script>

<style scoped>
.wall-card {
  position: relative;
  display: block;
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 1rem;
  padding: 1.15rem 1.2rem 1rem;
  border: 1px solid #e2e4e9;
  border-radius: 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(202, 190, 228, 0.07), transparent 46%),
    linear-gradient(180deg, #fff 0%, #fdfdfe 100%);
  box-shadow:
    0 24px 46px -30px rgba(39, 39, 42, 0.26),
    0 2px 6px -2px rgba(39, 39, 42, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
  transform: rotate(var(--wall-tilt, 0deg));
  transform-origin: 50% 0;
  /* 用 backwards 而不是 both：入场结束后把 transform 交还给 :hover，卡片才能正常抬起 */
  animation: wall-card-in 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
  transition:
    transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.wall-card:hover {
  border-color: #cfd2d8;
  box-shadow:
    0 32px 60px -30px rgba(39, 39, 42, 0.34),
    0 3px 9px -3px rgba(39, 39, 42, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
  transform: translateY(-5px) rotate(0deg);
}

.wall-card.is-owner {
  border-color: #e2dcf0;
  background:
    radial-gradient(circle at 100% 0%, rgba(190, 175, 225, 0.12), transparent 48%),
    linear-gradient(180deg, #fefdff 0%, #fbfaff 100%);
  box-shadow:
    0 24px 46px -30px rgba(90, 73, 130, 0.24),
    0 2px 6px -2px rgba(39, 39, 42, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
}

.wall-card.is-owner:hover {
  border-color: #cec3e3;
  box-shadow:
    0 32px 60px -30px rgba(90, 73, 130, 0.3),
    0 3px 9px -3px rgba(39, 39, 42, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
}

@keyframes wall-card-in {
  from {
    opacity: 0;
    transform: translateY(16px) rotate(var(--wall-tilt, 0deg)) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(var(--wall-tilt, 0deg)) scale(1);
  }
}

.wall-card-pin {
  position: absolute;
  top: 0;
  left: 50%;
  width: 34px;
  height: 2px;
  border-radius: 0 0 999px 999px;
  background: linear-gradient(90deg, transparent, rgba(138, 124, 171, 0.34), transparent);
  transform: translateX(-50%);
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.wall-card:hover .wall-card-pin {
  width: 48px;
}

.wall-card.is-owner .wall-card-pin {
  background: linear-gradient(90deg, transparent, rgba(138, 124, 171, 0.54), transparent);
}

.wall-card-wash {
  position: absolute;
  top: -52px;
  right: -36px;
  width: 116px;
  height: 116px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(206, 214, 224, 0.38), transparent 68%);
  pointer-events: none;
}

.wall-card.is-owner .wall-card-wash {
  background: radial-gradient(circle, rgba(202, 190, 228, 0.46), transparent 68%);
}

.wall-card-avatar {
  border-radius: 999px;
  box-shadow: 0 0 0 3px #f6f7f9;
}

.wall-card.is-owner .wall-card-avatar {
  box-shadow: 0 0 0 3px #f3effa;
}

.wall-card-quote {
  position: absolute;
  right: 10px;
  bottom: -16px;
  color: rgba(113, 113, 122, 0.06);
  font-family: Georgia, serif;
  font-size: 86px;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.wall-card-owner-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #8a7cab;
}

.wall-card-owner-badge,
.wall-card-guest-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: 'huoxie', sans-serif;
  font-size: 10px;
  letter-spacing: 0.05em;
  line-height: 18px;
}

.wall-card-owner-badge {
  background: #f2eefb;
  color: #5f5478;
  box-shadow: inset 0 0 0 1px rgba(138, 124, 171, 0.14);
}

.wall-card-guest-badge {
  background: #f7f7f8;
  color: #8e8e96;
  box-shadow: inset 0 0 0 1px rgba(39, 39, 42, 0.04);
}

.wall-card-link {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  color: #77708c;
  font-size: 11px;
  line-height: 1.5;
  transition: color 0.2s ease;
}

.wall-card-link svg {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.wall-card-link:hover {
  color: #4f4767;
}

.wall-card-role {
  display: block;
  margin-top: 2px;
  color: #96969e;
  font-size: 11px;
}

.wall-card-time {
  margin-top: 1px;
  color: #9a9aa2;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.wall-card-text {
  position: relative;
  z-index: 1;
  font-family: 'huoxie', sans-serif;
  font-size: 15px;
  line-height: 1.88;
  color: #3a3a40;
  letter-spacing: 0.01em;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.wall-card-text.is-collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
}

.wall-card-expand {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 6px;
  color: #7d7397;
  font-family: 'huoxie', sans-serif;
  font-size: 12px;
  transition: color 0.2s ease;
}

.wall-card-expand svg {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.wall-card-expand svg.is-open {
  transform: rotate(180deg);
}

.wall-card-expand:hover {
  color: #4f4767;
}

.wall-card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}

.wall-card-rule {
  height: 1px;
  flex: 1;
  background: linear-gradient(
    90deg,
    rgba(138, 124, 171, 0.16),
    rgba(232, 234, 237, 0.7),
    transparent
  );
}

.wall-card-no {
  color: #c0c2c8;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.18em;
}

html.dark .wall-card {
  border-color: rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at 100% 0%, rgba(190, 175, 225, 0.07), transparent 46%),
    linear-gradient(180deg, rgba(22, 22, 25, 0.97), rgba(18, 18, 20, 0.96));
  box-shadow:
    0 24px 46px -30px rgba(0, 0, 0, 0.95),
    0 2px 6px -2px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

html.dark .wall-card:hover {
  border-color: rgba(255, 255, 255, 0.17);
}

html.dark .wall-card.is-owner {
  border-color: rgba(190, 175, 225, 0.2);
  background:
    radial-gradient(circle at 100% 0%, rgba(190, 175, 225, 0.12), transparent 48%),
    linear-gradient(180deg, rgba(30, 28, 36, 0.97), rgba(20, 20, 22, 0.96));
}

html.dark .wall-card.is-owner:hover {
  border-color: rgba(190, 175, 225, 0.3);
}

html.dark .wall-card-avatar {
  box-shadow: 0 0 0 3px #1c1d20;
}

html.dark .wall-card.is-owner .wall-card-avatar {
  box-shadow: 0 0 0 3px #272431;
}

html.dark .wall-card-owner-dot {
  border-color: #141416;
}

html.dark .wall-card-owner-badge {
  background: rgba(190, 175, 225, 0.14);
  color: #d8d0ea;
  box-shadow: inset 0 0 0 1px rgba(190, 175, 225, 0.16);
}

html.dark .wall-card-guest-badge {
  background: rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

html.dark .wall-card-link {
  color: #a99fc2;
}

html.dark .wall-card-link:hover {
  color: #ddd6ec;
}

html.dark .wall-card-role,
html.dark .wall-card-time,
html.dark .wall-card-no {
  color: #71717a;
}

html.dark .wall-card-text {
  color: #d6d6da;
}

html.dark .wall-card-expand {
  color: #a99fc2;
}

html.dark .wall-card-expand:hover {
  color: #ddd6ec;
}

html.dark .wall-card-rule {
  background: linear-gradient(
    90deg,
    rgba(190, 175, 225, 0.12),
    rgba(255, 255, 255, 0.07),
    transparent
  );
}

@media (max-width: 639px) {
  .wall-card {
    margin-bottom: 0.8rem;
    padding: 0.95rem 1rem 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wall-card {
    animation: none;
    transition: none;
  }
  .wall-card:hover {
    transform: rotate(var(--wall-tilt, 0deg));
  }
}
</style>
