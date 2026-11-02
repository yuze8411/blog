<template>
  <article
    class="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_26px_50px_-30px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-sky-400/25"
  >
    <!-- 悬停时从图标方向散开的一团淡蓝色雾 -->
    <span
      class="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      :style="{ background: accent.glow }"
    />

    <div class="relative flex items-start justify-between gap-3">
      <div>
        <p
          class="font-[huoxie] text-[12px] tracking-[0.16em] text-slate-400 transition-colors duration-300 dark:text-slate-500"
        >
          {{ label }}
        </p>

        <p class="mt-3 flex items-baseline gap-1.5">
          <span
            class="font-[huoxie] text-[36px] leading-none tracking-[0.02em] text-slate-800 transition-colors duration-300 group-hover:text-slate-900 dark:text-white dark:group-hover:text-white sm:text-[40px]"
          >
            {{ formatted }}
          </span>
          <span class="text-[12px] font-medium text-slate-400 dark:text-slate-500">
            {{ unit }}
          </span>
        </p>
      </div>

      <!-- 图标：四张卡片用同一套线性图标，只换底色，保持节奏一致 -->
      <span
        class="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br text-white shadow-[0_10px_22px_-14px_rgba(37,99,235,0.7)] transition-transform duration-500 group-hover:rotate-[7deg] group-hover:scale-105"
        :class="accent.chip"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-[18px] w-[18px]">
          <template v-if="icon === 'article'">
            <path d="M7 3.8h7.2L19 8.6v11.6H7z" stroke-linejoin="round" />
            <path d="M14 3.8v5h5M10 12h6M10 15.5h6" stroke-linecap="round" />
          </template>
          <template v-else-if="icon === 'tag'">
            <path d="M4 10.2V5.4c0-.8.6-1.4 1.4-1.4h4.8c.4 0 .8.2 1 .4l8.1 8.1c.5.5.5 1.4 0 2l-4.8 4.8c-.5.5-1.4.5-2 0l-8.1-8.1a1.4 1.4 0 0 1-.4-1Z" stroke-linejoin="round" />
            <circle cx="8.4" cy="8.4" r="1.1" />
          </template>
          <template v-else-if="icon === 'comment'">
            <path d="M20 11.5c0 4.1-3.6 7.3-8 7.3-1 0-2-.2-2.9-.5L5 20l1.1-3.4a7 7 0 0 1-2.1-5.1C4 7.4 7.6 4.2 12 4.2s8 3.2 8 7.3Z" stroke-linejoin="round" />
            <path d="M8.5 11.6h.01M12 11.6h.01M15.5 11.6h.01" stroke-linecap="round" />
          </template>
          <template v-else>
            <circle cx="12" cy="12" r="8.3" />
            <path d="M12 7.3V12l3.1 1.9" stroke-linecap="round" stroke-linejoin="round" />
          </template>
        </svg>
      </span>
    </div>

    <div class="relative mt-4 flex items-center gap-2">
      <span class="h-px flex-1 bg-gradient-to-r from-slate-200/90 to-transparent dark:from-white/10" />
      <span class="text-[11.5px] text-slate-400 dark:text-slate-500">{{ hint }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type MetricIcon = 'article' | 'tag' | 'comment' | 'clock'
type MetricAccent = 'blue' | 'teal' | 'violet' | 'amber'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    unit: string
    hint: string
    icon: MetricIcon
    accent?: MetricAccent
    /** 数字滚动开始的延迟，让四张卡片错峰 */
    delay?: number
  }>(),
  { accent: 'blue', delay: 0 },
)

/** 每张卡片的图标底色和悬停光晕，都是完整的类名，Tailwind 才能扫描到 */
const ACCENTS: Record<MetricAccent, { chip: string; glow: string }> = {
  blue: {
    chip: 'from-[#2563eb] to-[#60a5fa]',
    glow: 'radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)',
  },
  teal: {
    chip: 'from-[#0d9488] to-[#5eead4]',
    glow: 'radial-gradient(circle, rgba(13,148,136,0.22), transparent 70%)',
  },
  violet: {
    chip: 'from-[#7c3aed] to-[#c4b5fd]',
    glow: 'radial-gradient(circle, rgba(124,58,237,0.20), transparent 70%)',
  },
  amber: {
    chip: 'from-[#d97706] to-[#fcd34d]',
    glow: 'radial-gradient(circle, rgba(217,119,6,0.20), transparent 70%)',
  },
}

const accent = computed(() => ACCENTS[props.accent])

/* ---------------- 数字滚动 ----------------
 * 页面一进来四个数字从 0 滚到目标值，像计数器一样。
 * 尊重 prefers-reduced-motion：系统要求减少动画时直接显示最终值。
 */
const displayed = ref(0)
let frame = 0

/** 格式化器只建一次，滚动动画每帧都复用它 */
const numberFormatter = new Intl.NumberFormat('zh-CN')
const formatted = computed(() => numberFormatter.format(displayed.value))

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayed.value = props.value
    return
  }

  const duration = 1100
  let startAt = 0

  const tick = (now: number) => {
    if (!startAt) startAt = now + props.delay
    const progress = Math.min(1, Math.max(0, (now - startAt) / duration))
    // cubic ease-out：起步快，收尾慢，最后几位数字看起来更稳
    displayed.value = Math.round(props.value * (1 - Math.pow(1 - progress, 3)))

    if (progress < 1) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>
