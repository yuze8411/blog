<template>
  <nav
    class="nav-root fixed top-0 left-0 w-full z-[100]"
    :class="[
      isAutoHidden ? 'nav-root--auto h-4' : 'h-16',
      { 'is-warm': isWarm, 'is-plain': isPlain },
    ]"
    @mouseleave="openMenu = ''"
  >
    <!-- 默认收起时，顶部留一小条触发区，鼠标移上来导航就会滑出 -->
    <span v-if="isAutoHidden" class="nav-reveal-hint" aria-hidden="true"></span>

    <div
      class="nav-bar absolute inset-x-0 top-0 h-16 backdrop-blur-[6px] transition-all duration-300"
      :class="navClass"
    >
      <div class="relative h-full flex items-center justify-center">
        <!-- <div class="absolute top-1/2 -translate-y-1/2 left-[450px] hidden 2x5l:block">
        <span
          class="inline-block text-[24px] leading-none font-[xuanzong] tracking-[6px] bg-clip-text text-transparent transition-all duration-300"
          :class="brandClass"
          >雨落千山</span
        >
      </div> -->
        <ul class="flex items-center gap-5 h-full">
          <!-- 一级：首页（无下拉） -->
          <li class="group relative h-full" @mouseenter="openMenu = ''">
            <RouterLink
              to="/"
              class="h-full flex items-center gap-2 px-5 text-[17px] font-medium transition-colors"
              :class="isActive({ name: 'home', path: '/' })"
            >
              <span class="text-[20px] leading-none">
                <IconFont name="shouye" />
              </span>
              <span class="font-[huoxie] text-[21px]" :class="labelClass">首页</span>
            </RouterLink>
          </li>

          <!-- 一级：分类（有下拉） -->
          <li class="group relative h-full" @mouseenter="openMenu = 'category'">
            <RouterLink
              to="/category?classify=0"
              class="h-full flex items-center gap-2 px-5 text-[17px] font-medium transition-colors"
              :class="isActive({ name: 'category', path: '/category' })"
            >
              <span class="text-[20px] leading-none">
                <IconFont name="fenlei1" class="text-[25px]" />
              </span>
              <span class="font-[huoxie] text-[21px]" :class="labelClass">分类</span>
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
                      to="/category?classify=0"
                      class="mr-1 flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span class="text-[18px] leading-none">
                        <IconFont name="kaifazhe" />
                      </span>
                      <span class="text-nowrap">开发笔记</span>
                    </RouterLink>
                    <RouterLink
                      to="/category?classify=1"
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
                      to="/category?classify=2"
                      class="mr-1 flex items-center gap-2 px-3 py-2 pr-5 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span class="text-[18px] leading-none">
                        <IconFont name="tucao" />
                      </span>
                      <span class="text-nowrap">我的吐槽</span>
                    </RouterLink>
                    <RouterLink
                      to="/category?classify=3"
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
              to="/milestone"
              target="_blank"
              class="h-full flex items-center gap-2 px-5 text-[17px] font-medium transition-colors"
              :class="isActive({ name: 'time', path: '/time' })"
            >
              <span class="text-[20px] leading-none">
                <IconFont name="-shijian" />
              </span>
              <span class="font-[huoxie] text-[21px]" :class="labelClass">时光</span>
            </RouterLink>
          </li>

          <!-- 一级：游记（无下拉） -->
          <li class="group relative h-full hidden ssm:block" @mouseenter="openMenu = ''">
            <RouterLink
              to="/travel"
              class="h-full flex items-center gap-2 px-5 text-[17px] font-medium transition-colors"
              :class="isActive({ name: 'travel', path: '/travel' })"
            >
              <span class="text-[20px] leading-none">
                <IconFont name="diqiu" class="text-[23px]" />
              </span>
              <span class="font-[huoxie] text-[21px]" :class="labelClass">游记</span>
            </RouterLink>
          </li>

          <!-- 一级：探索（有下拉） -->
          <li class="group relative h-full hidden sm:block" @mouseenter="openMenu = 'explore'">
            <RouterLink
              to="/explore"
              class="h-full flex items-center gap-2 px-5 text-[17px] font-medium transition-colors"
              :class="isActive({ name: 'explore', path: '/explore' })"
            >
              <span class="text-[20px] leading-none">
                <IconFont name="a-232_linggan" class="text-[25px]" />
              </span>
              <span class="font-[huoxie] text-[21px]" :class="labelClass">探索</span>
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
                      <IconFont name="tongjiguanli" />
                    </span>
                    <span class="text-nowrap">统计</span>
                  </RouterLink>
                  <RouterLink
                    to="/tags"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="biaoqian1" />
                    </span>
                    <span class="text-nowrap">标签墙</span>
                  </RouterLink>
                  <RouterLink
                    to="/about"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-gray-600 hover:text-sky-500 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span class="text-[18px] leading-none">
                      <IconFont name="jumao" />
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
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
// IconFont 由 unplugin-vue-components 自动注册为全局组件，无需手动导入

const props = withDefaults(
  defineProps<{
    /** light：浅色页面（如标签墙）使用浅色底 + 深色字；warm：暖色页面使用米白底 + 陶土色；plain：纯白页面使用白底 + 中性灰 */
    variant?: 'default' | 'light' | 'warm' | 'plain'
    /** visible：正常展示；hidden：默认收起，鼠标移到页面顶部或键盘聚焦时滑出 */
    visibility?: 'visible' | 'hidden'
  }>(),
  { variant: 'default', visibility: 'visible' },
)

const isLight = computed(() => props.variant === 'light')
const isWarm = computed(() => props.variant === 'warm')
const isPlain = computed(() => props.variant === 'plain')
const isAutoHidden = computed(() => props.visibility === 'hidden')

const openMenu = ref('')
const route = useRoute()

const activePath = computed(() => route.fullPath)

function isActive(item: { name: string; path: string }) {
  // 精确匹配一级路径；子项路径带上自身 name 高亮
  const active =
    item.name === 'home' ? activePath.value === item.path : activePath.value.startsWith(item.path)

  // 滚动后导航变浅：普通项转黑字，激活项用更深的强调色保证对比度
  if (active) {
    if (isPlain.value) return 'text-zinc-900 dark:text-zinc-100'
    if (isWarm.value) return 'text-[#9a5f57] dark:text-[#e8b4ac]'
    if (isLight.value) return 'text-sky-700 dark:text-sky-400'
    return scrolled.value ? 'text-sky-600 dark:text-sky-400' : 'text-sky-200'
  }
  if (isPlain.value) {
    return 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
  }
  if (isWarm.value) {
    return 'text-stone-600 hover:text-[#a6665e] dark:text-stone-300 dark:hover:text-[#e8b4ac]'
  }
  if (isLight.value) {
    return 'text-slate-700 hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400'
  }
  return scrolled.value
    ? 'text-gray-900 hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400'
    : 'text-white/90 hover:text-sky-200 dark:text-gray-300 dark:hover:text-sky-400'
}

// 路由变化时收起二级导航
watch(activePath, () => {
  openMenu.value = ''
})

// ---------- 滚动后加深导航栏背景并加阴影 ----------
const scrolled = ref(false)

// 滚动后文字/品牌字转深色，未滚动时保持白色；浅色 / 暖色主题下始终使用深色字
const labelClass = computed(() => {
  if (isPlain.value) {
    return 'text-zinc-800 hover:text-zinc-950 dark:text-zinc-100 dark:hover:text-white'
  }
  if (isWarm.value) {
    return 'text-stone-800 hover:text-[#a6665e] dark:text-stone-100 dark:hover:text-[#e8b4ac]'
  }
  if (isLight.value) {
    return 'text-slate-800 hover:text-sky-600 dark:text-gray-100 dark:hover:text-sky-400'
  }
  return scrolled.value
    ? 'text-gray-900 hover:text-sky-600 dark:text-gray-100 dark:hover:text-sky-400'
    : 'text-white hover:text-sky-200 dark:text-gray-300 dark:hover:text-sky-400'
})

// 导航栏底色：浅色页面用与标签页一致的淡靛蓝；暖色页面用米白，深色页面沿用原样式
const navClass = computed(() => {
  if (isPlain.value) {
    return scrolled.value
      ? 'bg-white/95 shadow-[0_6px_24px_rgba(63,63,70,0.1)] dark:bg-[#0b0c0e]/95 dark:shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
      : 'bg-white/80 shadow-none dark:bg-[#0b0c0e]/55'
  }
  if (isWarm.value) {
    return scrolled.value
      ? 'bg-[#fdfcfa]/95 shadow-[0_6px_24px_rgba(95,82,72,0.12)] dark:bg-[#0b0c0e]/95 dark:shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
      : 'bg-[#fdfcfa]/80 shadow-none dark:bg-[#0b0c0e]/55'
  }
  if (isLight.value) {
    return scrolled.value
      ? 'bg-[#eef2ff]/95 shadow-[0_6px_24px_rgba(148,163,184,0.18)] dark:bg-gray-900/95 dark:shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
      : 'bg-[#eef2ff]/80 shadow-none dark:bg-gray-900/50'
  }
  return scrolled.value
    ? 'bg-[#ffffff80] shadow-[0_6px_24px_rgba(255,255,255,0.6)] dark:bg-gray-900/95 dark:shadow-[0_6px_24px_rgba(0,0,0,0.5)]'
    : 'bg-[rgba(47,74,119,0.45)] shadow-none dark:bg-gray-900/50'
})

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
/* ---------- 纯白页面：下拉菜单和主题开关都使用中性灰 ---------- */
.nav-root.is-plain .absolute > div {
  border-color: #e9ebee;
  background-color: rgba(255, 255, 255, 0.96);
}

.nav-root.is-plain .absolute a {
  color: #71717a;
}

.nav-root.is-plain .absolute a:hover {
  background-color: #f4f4f5;
  color: #18181b;
}

:global(html.dark) .nav-root.is-plain .absolute > div {
  border-color: #2b2d30;
  background-color: rgba(18, 18, 20, 0.97);
}

:global(html.dark) .nav-root.is-plain .absolute a {
  color: #a1a1aa;
}

:global(html.dark) .nav-root.is-plain .absolute a:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: #fafafa;
}

.nav-root.is-plain .slider {
  background-color: #d4d4d8;
}

.nav-root.is-plain #input:focus + .slider {
  box-shadow: 0 0 1px #a1a1aa;
}

/* ---------- 暖色页面：下拉菜单的 hover 也换成陶土色，不出现蓝色 ---------- */
.nav-root.is-warm .absolute > div {
  border-color: #ece7e1;
  background-color: rgba(255, 255, 255, 0.96);
}

.nav-root.is-warm .absolute a {
  color: #7a6c63;
}

.nav-root.is-warm .absolute a:hover {
  background-color: #faf3ee;
  color: #a6665e;
}

:global(html.dark) .nav-root.is-warm .absolute > div {
  border-color: #34302d;
  background-color: rgba(18, 18, 20, 0.97);
}

:global(html.dark) .nav-root.is-warm .absolute a {
  color: #b8b0a9;
}

:global(html.dark) .nav-root.is-warm .absolute a:hover {
  background-color: rgba(120, 80, 70, 0.2);
  color: #e8b4ac;
}

/* 暖色页面上的主题开关也收成陶土色，避免蓝色跳出来 */
.nav-root.is-warm .slider {
  background-color: #c48a7e;
}

.nav-root.is-warm #input:focus + .slider {
  box-shadow: 0 0 1px #c48a7e;
}

/* ---------- About 页：默认收起的导航 ---------- */
/* 收起状态：整条导航向上滑出画面，只留下顶部一条很窄的触发区 */
.nav-root--auto .nav-bar {
  opacity: 0;
  transform: translateY(-100%);
}

/* 鼠标移到页面顶部，或者键盘 Tab 进导航时，导航重新滑下来 */
.nav-root--auto:hover .nav-bar,
.nav-root--auto:focus-within .nav-bar {
  opacity: 1;
  transform: translateY(0);
}

/* 顶部中央的一小段微光，提示这里可以唤出导航 */
.nav-reveal-hint {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 36px;
  height: 3px;
  border-radius: 999px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(186, 230, 253, 0.55), transparent);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  transform: translateX(-50%);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.nav-root--auto:hover .nav-reveal-hint,
.nav-root--auto:focus-within .nav-reveal-hint {
  opacity: 0;
  transform: translate(-50%, -4px);
}

@media (prefers-reduced-motion: reduce) {
  .nav-root--auto .nav-bar,
  .nav-reveal-hint {
    transition: none;
  }
}

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
