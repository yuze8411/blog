<template>
  <nav
    class="fixed top-0 left-0 w-full h-16 z-[100] backdrop-blur-[6px] transition-all duration-300"
    :class="
      scrolled
        ? 'bg-[rgba(47,74,119,0.94)] shadow-[0_6px_24px_rgba(15,35,65,0.28)] dark:bg-gray-900/95 dark:shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
        : 'bg-[rgba(47,74,119,0.45)] shadow-none dark:bg-gray-900/50'
    "
    @mouseleave="openMenu = ''"
  >
    <div class="relative h-full flex items-center justify-center">
      <div class="absolute top-1/2 -translate-y-1/2 left-[450px] hidden 2x5l:block">
        <span
          class="inline-block text-[24px] leading-none font-[xuanzong] tracking-[6px] bg-gradient-to-r from-white via-[#d6ecff] to-[#8ecbff] bg-clip-text text-transparent drop-shadow-[0_1px_5px_rgba(120,200,255,0.35)]"
          >雨落千山</span
        >
      </div>
      <ul class="flex items-center gap-5 h-full">
        <!-- 一级：首页（无下拉） -->
        <li class="group relative h-full" @mouseenter="openMenu = ''">
          <RouterLink
            to="/"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'home', path: '/' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="shouye" />
            </span>
            <span class="text-white hover:text-sky-200 font-[huoxie] text-[21px]">首页</span>
          </RouterLink>
        </li>

        <!-- 一级：分类（有下拉） -->
        <li class="group relative h-full" @mouseenter="openMenu = 'category'">
          <RouterLink
            to="/category"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'category', path: '/category' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="fenlei1" class="text-[25px]" />
            </span>
            <span class="text-white hover:text-sky-200 font-[huoxie] text-[21px]">分类</span>
          </RouterLink>

          <!-- 二级导航：分类 -->
          <transition name="sub-fade">
            <div
              v-show="openMenu === 'category'"
              class="absolute left-1/2 top-full -translate-x-1/2 pt-2"
            >
              <div
                class="p-2 rounded-xl bg-white/80 dark:bg-gray-900/95 backdrop-blur-md border border-gray-100 dark:border-gray-700 px-3 py-2 shadow-lg shadow-gray-200/60 dark:shadow-gray-950"
              >
                <div class="flex gap-1">
                  <RouterLink
                    to="/category/dev"
                    class="mr-1 flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="kaifazhe" />
                    </span>
                    <span class="text-nowrap">开发笔记</span>
                  </RouterLink>
                  <RouterLink
                    to="/category/life"
                    class="flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="shenghuo" />
                    </span>
                    <span class="text-nowrap">生活记录</span>
                  </RouterLink>
                </div>
                <div class="flex gap-1 mt-[6px]">
                  <RouterLink
                    to="/category/rant"
                    class="mr-1 flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="tucao" />
                    </span>
                    <span class="text-nowrap">我的吐槽</span>
                  </RouterLink>
                  <RouterLink
                    to="/category/tech"
                    class="flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="keji1" />
                    </span>
                    <span class="text-nowrap">科技产品</span>
                  </RouterLink>
                </div>
              </div>
            </div>
          </transition>
        </li>

        <!-- 一级：时光（无下拉） -->
        <li class="group relative h-full" @mouseenter="openMenu = ''">
          <RouterLink
            to="/time"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'time', path: '/time' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="-shijian" />
            </span>
            <span class="text-white hover:text-sky-200 font-[huoxie] text-[21px]">时光</span>
          </RouterLink>
        </li>

        <!-- 一级：游记（无下拉） -->
        <li class="group relative h-full hidden ssm:block" @mouseenter="openMenu = ''">
          <RouterLink
            to="/travel"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'travel', path: '/travel' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="diqiu" class="text-[23px]" />
            </span>
            <span class="text-white hover:text-sky-200 font-[huoxie] text-[21px]">游记</span>
          </RouterLink>
        </li>

        <!-- 一级：探索（有下拉） -->
        <li class="group relative h-full hidden sm:block" @mouseenter="openMenu = 'explore'">
          <RouterLink
            to="/explore"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'explore', path: '/explore' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="a-232_linggan" class="text-[25px]" />
            </span>
            <span class="text-white hover:text-sky-200 font-[huoxie] text-[21px]">探索</span>
          </RouterLink>

          <!-- 二级导航：探索 -->
          <transition name="sub-fade">
            <div
              v-show="openMenu === 'explore'"
              class="absolute left-1/2 top-full -translate-x-1/2 pt-2"
            >
              <div
                class="flex gap-1 rounded-xl bg-white/80 dark:bg-gray-900/95 backdrop-blur-md border border-gray-100 dark:border-gray-700 px-3 py-2 shadow-lg shadow-gray-200/60 dark:shadow-gray-950"
              >
                <RouterLink
                  to="/stats"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <span class="text-[18px] leading-none">
                    <IconFont name="tongji" />
                  </span>
                  <span class="text-nowrap">统计</span>
                </RouterLink>
                <RouterLink
                  to="/tags"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <span class="text-[18px] leading-none">
                    <IconFont name="biaoqian" />
                  </span>
                  <span class="text-nowrap">标签墙</span>
                </RouterLink>
                <RouterLink
                  to="/about"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <span class="text-[18px] leading-none">
                    <IconFont name="guanyu" />
                  </span>
                  <span class="text-nowrap">关于我</span>
                </RouterLink>
                <RouterLink
                  to="/message"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <span class="text-[18px] leading-none">
                    <IconFont name="liuyan" />
                  </span>
                  <span class="text-nowrap">留言墙</span>
                </RouterLink>
              </div>
            </div>
          </transition>
        </li>
      </ul>

      <!-- 右侧：浅黑主题切换 -->
      <div class="absolute right-[300px] top-1/2 -translate-y-1/2 hidden xl:block">
        <label class="switch">
          <input id="input" type="checkbox" :checked="isDark" @change="toggleTheme" />
          <div class="slider round">
            <div class="sun-moon">
              <svg id="moon-dot-1" class="moon-dot" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="moon-dot-2" class="moon-dot" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="moon-dot-3" class="moon-dot" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="light-ray-1" class="light-ray" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="light-ray-2" class="light-ray" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="light-ray-3" class="light-ray" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>

              <svg id="cloud-1" class="cloud-dark" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="cloud-2" class="cloud-dark" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="cloud-3" class="cloud-dark" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="cloud-4" class="cloud-light" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="cloud-5" class="cloud-light" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
              <svg id="cloud-6" class="cloud-light" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50"></circle>
              </svg>
            </div>
            <div class="stars">
              <svg id="star-1" class="star" viewBox="0 0 20 20">
                <path
                  d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
                ></path>
              </svg>
              <svg id="star-2" class="star" viewBox="0 0 20 20">
                <path
                  d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
                ></path>
              </svg>
              <svg id="star-3" class="star" viewBox="0 0 20 20">
                <path
                  d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
                ></path>
              </svg>
              <svg id="star-4" class="star" viewBox="0 0 20 20">
                <path
                  d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
                ></path>
              </svg>
            </div>
          </div>
        </label>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
// IconFont 由 unplugin-vue-components 自动注册为全局组件，无需手动导入

const openMenu = ref('')
const route = useRoute()

const activePath = computed(() => route.fullPath)

function isActive(item: { name: string; path: string }) {
  // 精确匹配一级路径；子项路径带上自身 name 高亮
  return {
    'text-sky-500 dark:text-sky-400':
      item.name === 'home'
        ? activePath.value === item.path
        : activePath.value.startsWith(item.path),
  }
}

// 路由变化时收起二级导航
watch(activePath, () => {
  openMenu.value = ''
})

// ---------- 滚动后加深导航栏背景并加阴影 ----------
const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ---------- 浅黑主题切换 ----------

const isDark = ref(false)

function applyTheme(val: boolean) {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
  isDark.value = val
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    applyTheme(true)
  } else {
    applyTheme(false)
  }
})
</script>

<style scoped>
/* 二级导航淡入淡出 */
.sub-fade-enter-active,
.sub-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.sub-fade-enter-from,
.sub-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
/* From Uiverse.io by RiccardoRapelli */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch #input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2196f3;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  z-index: 0;
  overflow: hidden;
}

.sun-moon {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: yellow;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

#input:checked + .slider {
  background-color: black;
}

#input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

#input:checked + .slider .sun-moon {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
  background-color: white;
  -webkit-animation: rotate-center 0.6s ease-in-out both;
  animation: rotate-center 0.6s ease-in-out both;
}

.moon-dot {
  opacity: 0;
  transition: 0.4s;
  fill: gray;
}

#input:checked + .slider .sun-moon .moon-dot {
  opacity: 1;
}

.slider.round {
  border-radius: 34px;
}

.slider.round .sun-moon {
  border-radius: 50%;
}

#moon-dot-1 {
  left: 10px;
  top: 3px;
  position: absolute;
  width: 6px;
  height: 6px;
  z-index: 4;
}

#moon-dot-2 {
  left: 2px;
  top: 10px;
  position: absolute;
  width: 10px;
  height: 10px;
  z-index: 4;
}

#moon-dot-3 {
  left: 16px;
  top: 18px;
  position: absolute;
  width: 3px;
  height: 3px;
  z-index: 4;
}

#light-ray-1 {
  left: -8px;
  top: -8px;
  position: absolute;
  width: 43px;
  height: 43px;
  z-index: -1;
  fill: white;
  opacity: 10%;
}

#light-ray-2 {
  left: -50%;
  top: -50%;
  position: absolute;
  width: 55px;
  height: 55px;
  z-index: -1;
  fill: white;
  opacity: 10%;
}

#light-ray-3 {
  left: -18px;
  top: -18px;
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: -1;
  fill: white;
  opacity: 10%;
}

.cloud-light {
  position: absolute;
  fill: #eee;
  animation-name: cloud-move;
  animation-duration: 6s;
  animation-iteration-count: infinite;
}

.cloud-dark {
  position: absolute;
  fill: #ccc;
  animation-name: cloud-move;
  animation-duration: 6s;
  animation-iteration-count: infinite;
  animation-delay: 1s;
}

#cloud-1 {
  left: 30px;
  top: 15px;
  width: 40px;
}

#cloud-2 {
  left: 44px;
  top: 10px;
  width: 20px;
}

#cloud-3 {
  left: 18px;
  top: 24px;
  width: 30px;
}

#cloud-4 {
  left: 36px;
  top: 18px;
  width: 40px;
}

#cloud-5 {
  left: 48px;
  top: 14px;
  width: 20px;
}

#cloud-6 {
  left: 22px;
  top: 26px;
  width: 30px;
}

@keyframes cloud-move {
  0% {
    transform: translateX(0px);
  }

  40% {
    transform: translateX(4px);
  }

  80% {
    transform: translateX(-4px);
  }

  100% {
    transform: translateX(0px);
  }
}

.stars {
  transform: translateY(-32px);
  opacity: 0;
  transition: 0.4s;
}

.star {
  fill: white;
  position: absolute;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  animation-name: star-twinkle;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

#input:checked + .slider .stars {
  -webkit-transform: translateY(0);
  -ms-transform: translateY(0);
  transform: translateY(0);
  opacity: 1;
}

#star-1 {
  width: 20px;
  top: 2px;
  left: 3px;
  animation-delay: 0.3s;
}

#star-2 {
  width: 6px;
  top: 16px;
  left: 3px;
}

#star-3 {
  width: 12px;
  top: 20px;
  left: 10px;
  animation-delay: 0.6s;
}

#star-4 {
  width: 18px;
  top: 0px;
  left: 18px;
  animation-delay: 1.3s;
}

@keyframes star-twinkle {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.2);
  }

  80% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1);
  }
}
</style>
