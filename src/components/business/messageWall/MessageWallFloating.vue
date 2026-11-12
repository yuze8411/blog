<template>
  <!-- 背景里各自缓慢飘过的留言：只做气氛，不参与交互 -->
  <div class="wall-float" aria-hidden="true">
    <span
      v-for="item in items"
      :key="item.key"
      class="wall-float-pill"
      :style="{
        top: `${item.top}%`,
        fontSize: `${item.size}px`,
        opacity: item.opacity,
        animationDuration: `${item.duration}s`,
        animationDelay: `${item.delay}s`,
      }"
    >
      <span class="wall-float-dot" :class="`is-tone-${item.tone}`"></span>
      {{ item.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface FloatingMessage {
  key: string
  text: string
  top: number
  size: number
  duration: number
  delay: number
  opacity: number
  tone: number
}

// 留言内容固定，每次进入页面只重新分布它们的上下位置和出场时间
const MESSAGES: string[] = [
  '愿你今天也顺顺利利',
  '路过，留个脚印',
  '这里的风很温柔',
  '晚安，好梦',
  '要记得好好吃饭',
  '谢谢你的分享',
  '下次还来',
  '被这句话治愈了',
  '今天也要开心',
  '喜欢这里的安静',
  '生活明朗，万物可爱',
  '愿所念皆如愿',
  '慢慢走，沿途有风景',
  '写一句给未来的自己',
  '山高路远，平安就好',
  '愿所有努力都有回响',
  '有空常来坐坐',
  '平安喜乐',
]

function shuffle<T>(source: readonly T[]): T[] {
  const list = [...source]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = list[i]
    const target = list[j]
    if (current === undefined || target === undefined) continue
    list[i] = target
    list[j] = current
  }
  return list
}

// 把高度分成若干不重叠的区间，再在每个区间里随机落点：
// 位置每次都会变，但不会挤成一团
const bandOrder = shuffle(Array.from({ length: MESSAGES.length }, (_, index) => index))
const bandHeight = 100 / MESSAGES.length

const items: FloatingMessage[] = MESSAGES.map((text, index) => {
  const band = bandOrder[index] ?? index
  const duration = 58 + Math.round(Math.random() * 46)

  return {
    key: `${index}-${text}`,
    text,
    top: Number(((band + 0.12 + Math.random() * 0.72) * bandHeight).toFixed(1)),
    size: Number((11.5 + Math.random() * 1.5).toFixed(1)),
    duration,
    // 负延迟让每条留言一开场就处在不同位置，像已经在背景里飘了一会儿
    delay: -Math.round(Math.random() * duration),
    opacity: Number((0.2 + Math.random() * 0.12).toFixed(3)),
    tone: index % 3,
  }
})
</script>

<style scoped>
.wall-float {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.wall-float-pill {
  position: absolute;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border: 1px solid rgba(228, 230, 233, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  color: #a1a1aa;
  font-family: 'huoxie', sans-serif;
  line-height: 1.35;
  white-space: nowrap;
  animation-name: wall-float-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.wall-float-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #b7c1c4;
}

.wall-float-dot.is-tone-1 {
  background: #c1cbc2;
}

.wall-float-dot.is-tone-2 {
  background: #c5bbdd;
}

/* 单条留言从左侧之外飘到右侧之外，中途轻轻起伏、改变一点角度 */
@keyframes wall-float-drift {
  0% {
    transform: translate3d(-30vw, 0, 0) rotate(-2.4deg);
  }
  50% {
    transform: translate3d(48vw, -14px, 0) rotate(1.6deg);
  }
  100% {
    transform: translate3d(126vw, 0, 0) rotate(-2.4deg);
  }
}

html.dark .wall-float-pill {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.025);
  color: #8b8b94;
}

html.dark .wall-float-dot {
  background: #6b7280;
}

html.dark .wall-float-dot.is-tone-1 {
  background: #6f7f75;
}

html.dark .wall-float-dot.is-tone-2 {
  background: #7b6f94;
}

/* 手机上留一半，避免背景太满 */
@media (max-width: 639px) {
  .wall-float-pill:nth-child(2n) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wall-float {
    display: none;
  }
}
</style>
