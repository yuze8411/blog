<template>
  <nav
    class="fixed top-0 left-0 w-full h-16 bg-white/90 backdrop-blur-[5px] z-[100] dark:bg-gray-900/90 dark:shadow-gray-950 transition-colors duration-300"
    @mouseleave="openMenu = ''"
  >
    <div class="relative h-full flex items-center justify-center">
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
            <span>首页</span>
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
              <IconFont name="fenlei" />
            </span>
            <span>分类</span>
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
              <IconFont name="shiguangdiantai" />
            </span>
            <span>时光</span>
          </RouterLink>
        </li>

        <!-- 一级：游记（无下拉） -->
        <li class="group relative h-full" @mouseenter="openMenu = ''">
          <RouterLink
            to="/travel"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'travel', path: '/travel' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont :class="isDark ? 'text-white' : ''" name="youji" />
            </span>
            <span>游记</span>
          </RouterLink>
        </li>

        <!-- 一级：探索（有下拉） -->
        <li class="group relative h-full" @mouseenter="openMenu = 'explore'">
          <RouterLink
            to="/explore"
            class="h-full flex items-center gap-2 px-5 text-[17px] font-medium text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors"
            :class="isActive({ name: 'explore', path: '/explore' })"
          >
            <span class="text-[20px] leading-none">
              <IconFont name="a-232_linggan" />
            </span>
            <span>探索</span>
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
      <div class="absolute right-[300px] top-1/2 -translate-y-1/2">
        <button
          type="button"
          class="relative group/theme w-[60px] h-8 rounded-full transition-colors duration-300 bg-orange-200 dark:bg-sky-500 cursor-pointer"
          :title="isDark ? '切换到浅色' : '切换到深色'"
          aria-label="切换主题"
          @click="toggleTheme"
        >
          <!-- 滑动圆点 + 太阳/月亮图标 -->
          <span
            class="absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[16px] transition-all duration-300"
            :class="isDark ? 'translate-x-7' : 'translate-x-0'"
          >
            <IconFont v-if="!isDark" name="taiyang" class="text-[22px]" />
            <IconFont v-if="isDark" name="yueliang" class="text-[20px]" />
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
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
</style>
