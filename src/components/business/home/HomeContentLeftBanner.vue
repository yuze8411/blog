<template>
  <div class="w-full h-[370px] rounded-[10px] relative overflow-hidden group">
    <transition name="fade" mode="out-in">
      <img
        :key="i"
        :src="imgSrc"
        alt="Banner Image"
        class="w-full h-full object-cover rounded-[10px]"
      />
    </transition>

    <div
      class="absolute w-full h-[60%] bg-[linear-gradient(to_top,#2c333e,transparent)] z-10 bottom-0 left-0"
    ></div>

    <div class="absolute bottom-0 w-full flex flex-col justify-center z-20">
      <div class="opacity-0 flex justify-between px-5 mb-20 group-hover:opacity-100 duration-300">
        <div
          class="w-[50px] h-[50px] rounded-full bg-gray-100/60 flex justify-center items-center cursor-pointer hover:bg-gray-100"
          @click="toggleIndex(i > 0 ? i - 1 : imgStcArr.length - 1)"
        >
          <IconFont name="zuo" class="text-[40px] text-white"></IconFont>
        </div>
        <div
          class="w-[50px] h-[50px] rounded-full bg-gray-100/60 flex justify-center items-center cursor-pointer hover:bg-gray-100"
          @click="toggleIndex(i < imgStcArr.length - 1 ? i + 1 : 0)"
        >
          <IconFont name="you" class="text-[40px] text-white"></IconFont>
        </div>
      </div>
      <transition name="fade" mode="out-in">
        <p
          :key="i"
          class="text-white text-center text-[28px] text_shadow font-[huoxie] hover:text-[#d4f5ff] duration-300 cursor-pointer"
          @click="pathJump(imgStcArr[i]?.description)"
        >
          {{ imgStcArr[i]?.text }}
        </p>
      </transition>

      <div class="mt-6 mb-4 flex gap-3 justify-center">
        <div class="flex gap-3 justify-center w-[140px]">
          <span
            v-for="(item, index) in imgStcArr"
            :key="index"
            class="w-[33px] h-[6px] rounded-[20px] bg-[rgb(128,132,140)] cursor-pointer hover:w-[50px] duration-[.4s]"
            :class="
              i === index
                ? 'bg-[rgb(83,157,253)] w-[50px] hover:bg-[rgb(83,157,253)] shadow-[0_0_10px_#539dfd]'
                : 'hover:bg-white'
            "
            @click="toggleIndex(index)"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import imgCsdn from '@/assets/images/banners/mycsdn.png'
import imgGithub from '@/assets/images/banners/mygithub.png'
import imgNote from '@/assets/images/banners/mynote.png'
let router = useRouter()
let route = useRoute()
interface imgsrcItem {
  src: string
  text: string
  description: string
}
function getImgSrc(src: string) {
  let fullHref = window.location.href
  if (fullHref.startsWith('http') || fullHref.startsWith('https')) {
    return `/assets/images/banners/${src}`
  } else {
    return `/src/assets/images/banners/${src}`
  }
}
const imgStcArr: imgsrcItem[] = [
  {
    src: getImgSrc('mycsdn.png'),
    text: '这是我的CSDN博客，梦开始的地方',
    description: 'https://blog.csdn.net/2403_87566238?type=blog',
  },
  {
    src: getImgSrc('mygithub.png'),
    text: '这是我的GitHub，咕咕嘎嘎！',
    description: 'https://github.com/yuze8411',
  },
  {
    src: getImgSrc('mynote.png'),
    text: '我的语雀笔记，一步一步积累',
    description: 'https://www.yuque.com/u54109278',
  },
]
const i = ref(0)
const imgSrc = ref(imgStcArr[i.value]?.src ?? '')

watch(i, (newVal) => {
  imgSrc.value = imgStcArr[newVal]?.src ?? ''
})
let timer: number | null = null
function toggleIndex(index: number) {
  i.value = index
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    i.value = (i.value + 1) % imgStcArr.length
  }, 4000)
}
function pathJump(path: string | undefined) {
  if (path?.startsWith('http')) {
    window.open(path, '_blank')
  } else {
    router.push(path || '/')
  }
}
onMounted(() => {
  timer = window.setInterval(() => {
    i.value = (i.value + 1) % imgStcArr.length
  }, 4000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.text_shadow {
  text-shadow: 0px 4px 15px rgb(0, 0, 0);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
