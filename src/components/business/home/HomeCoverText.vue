<template>
  <div class="absolute w-full left-0 top-[45%] -translate-y-[50%] flex justify-center">
    <span class="text-white text-[25px] [text-shadow:0_2px_15px_rgba(255,255,255,0.7)]">
      {{ text }}
      <span class="animate-pulse">|</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
const text = ref('')
const textData = [
  '浮生若梦人间寄，得失循环莫悲喜。',
  '赞美帝皇！人类帝国万岁！',
  '遇事不决可问春风，春风不语，即随本心。',
  '咕咕嘎嘎，比比拉布，八格牙楼！',
]

let i = 0 // 当前句子下标
let j = 0 // 当前文字下标
let timer: number | null = null
const speed = 200 // 打字间隔 ms
const waitAfterDone = 3000 // 打完停留时长 ms

function drawText() {
  const currentStr = textData[i]
  if (!currentStr) return

  text.value += currentStr.charAt(j)
  j++

  if (j >= currentStr.length) {
    timer = window.setTimeout(() => {
      i = (i + 1) % textData.length
      j = 0
      text.value = ''
      drawText()
    }, waitAfterDone)
    return
  }

  timer = window.setTimeout(drawText, speed)
}

onMounted(() => {
  drawText()
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
