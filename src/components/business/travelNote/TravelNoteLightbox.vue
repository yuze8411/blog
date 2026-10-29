<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="currentImage"
        class="fixed inset-0 z-[200] flex flex-col bg-[#050a12]/95 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="查看大图"
        @click.self="close"
      >
        <!-- 背景柔光 -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            class="absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[140px]"
          ></div>
          <div
            class="absolute bottom-0 right-1/4 h-[380px] w-[420px] rounded-full bg-indigo-500/10 blur-[150px]"
          ></div>
        </div>

        <!-- 顶部：切换 + 计数 + 关闭 -->
        <header class="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
          <div class="flex items-center gap-2">
            <button
              v-if="total > 1"
              type="button"
              class="lightbox-nav"
              aria-label="上一张"
              @click="step(-1)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>

            <span
              class="min-w-[74px] text-center font-[huoxie] text-[12px] tracking-[0.22em] text-white/50 tabular-nums"
            >
              {{ pad(indexNumber) }} / {{ pad(total) }}
            </span>

            <button
              v-if="total > 1"
              type="button"
              class="lightbox-nav"
              aria-label="下一张"
              @click="step(1)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            ref="closeButton"
            type="button"
            class="lightbox-nav"
            aria-label="关闭大图"
            @click="close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              class="h-4 w-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <!-- 大图 + 信息 -->
        <div
          class="lightbox-stage relative z-10 flex min-h-0 flex-1 flex-col items-center px-4 pb-4 sm:px-10 sm:pb-6"
          @click.self="close"
        >
          <div class="flex min-h-0 w-full flex-1 items-center justify-center">
            <img
              :src="currentImage.img_url"
              :alt="currentImage.img_introduction"
              draggable="false"
              class="max-h-full max-w-full rounded-2xl object-contain shadow-[0_40px_90px_-35px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
              @error="handleImageError"
            />
          </div>

          <div
            class="mt-4 w-full max-w-[820px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.95)] backdrop-blur-lg"
          >
            <p class="font-[huoxie] text-[16px] leading-7 text-white/90 sm:text-[17px]">
              {{ currentImage.img_introduction }}
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span
                v-for="tag of currentImage.img_tags"
                :key="tag"
                class="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/65"
              >
                #{{ tag }}
              </span>

              <span
                class="ml-auto flex items-center gap-1.5 text-[12px] text-white/45 tabular-nums"
              >
                <IconFont name="shijian" class="text-[12px]" />
                {{ currentImage.img_time }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TravelImage } from '@/types/travel'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

const props = defineProps<{
  images: TravelImage[]
  /** null 表示不展示 */
  index: number | null
}>()

const emit = defineEmits<{
  'update:index': [index: number | null]
  close: []
}>()

const closeButton = ref<HTMLButtonElement | null>(null)

const currentImage = computed(() => {
  if (props.index === null) return null
  return props.images[props.index] ?? null
})

const total = computed(() => props.images.length)
const indexNumber = computed(() => (props.index ?? 0) + 1)

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function close() {
  emit('update:index', null)
  emit('close')
}

function step(delta: number) {
  if (props.index === null || total.value === 0) return
  emit('update:index', (props.index + delta + total.value) % total.value)
}

// 打开时锁定页面滚动，关闭后恢复
let bodyLocked = false
let previousOverflow = ''

function lockBody() {
  if (bodyLocked || typeof document === 'undefined') return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  bodyLocked = true
}

function unlockBody() {
  if (!bodyLocked || typeof document === 'undefined') return
  document.body.style.overflow = previousOverflow
  bodyLocked = false
}

function preloadNeighbors(current: number) {
  if (total.value <= 1) return

  for (const delta of [-1, 1]) {
    const target = props.images[(current + delta + total.value) % total.value]
    if (!target) continue

    const img = new Image()
    img.src = target.img_url
  }
}

watch(
  () => props.index,
  (value, oldValue) => {
    if (value === null) {
      unlockBody()
      return
    }

    lockBody()
    preloadNeighbors(value)

    // 只在刚打开时把焦点交给关闭按钮，切换上一张/下一张时不打断操作
    if (oldValue === null || oldValue === undefined) {
      void nextTick(() => closeButton.value?.focus())
    }
  },
  { immediate: true },
)

function onKeydown(event: KeyboardEvent) {
  if (props.index === null) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback === '1') return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  unlockBody()
})
</script>

<style scoped>
.lightbox-nav {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.lightbox-nav:hover {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  transform: translateY(-1px);
}

.lightbox-nav:active {
  transform: translateY(0) scale(0.96);
}

.lightbox-nav:focus-visible {
  outline: 2px solid rgba(142, 203, 255, 0.85);
  outline-offset: 2px;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.24s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-stage,
.lightbox-leave-active .lightbox-stage {
  transition:
    transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.24s ease;
}

.lightbox-enter-from .lightbox-stage,
.lightbox-leave-to .lightbox-stage {
  opacity: 0;
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .lightbox-enter-active,
  .lightbox-leave-active,
  .lightbox-enter-active .lightbox-stage,
  .lightbox-leave-active .lightbox-stage {
    transition: none;
  }
}
</style>
