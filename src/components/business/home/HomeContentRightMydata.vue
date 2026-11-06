<template>
  <div
    class="relative isolate h-[370px] overflow-hidden rounded-[10px] border border-gray-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:bg-gray-950 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
  >
    <!-- 背景图：用 absolute inset-0 铺满整张卡片，避免底部留白 -->
    <div class="absolute inset-0 z-0">
      <img
        src="@/assets/images/8385-mountains-55067_1920 (1).png"
        alt=""
        class="h-full w-full object-cover"
      />

      <!-- 从底部往上的白色渐变，保证文字和社交图标清晰可读 -->
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-gray-950 dark:via-gray-950/45 dark:to-transparent"
      ></div>
    </div>

    <div class="relative z-10 flex h-full flex-col items-center px-5 pt-5 pb-5">
      <!-- 头像 -->
      <div
        class="group flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/50 shadow-[0_4px_14px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
      >
        <img
          src="@/assets/images/mycover.jpg"
          alt="雨落千山的头像"
          class="h-[90px] w-[90px] rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <!-- 基本信息 -->
      <p
        class="mydata-text mt-3 text-center text-[20px] font-[huoxie] text-black dark:text-gray-100"
      >
        雨落千山
      </p>
      <p
        class="mydata-text mt-2 text-center text-[14px] font-[huoxie] text-gray-800 dark:text-gray-300"
      >
        前端开发者，学习中 ing~
      </p>
      <p
        class="mydata-text mt-1 text-center text-[13px] font-[huoxie] text-gray-700 dark:text-gray-400"
      >
        浮生若梦人间寄，得失循环莫悲喜
      </p>

      <!-- 社交账号：mt-auto 把它推到底部，避免写死 mt-[52px] 导致内容溢出卡片 -->
      <div class="mt-auto w-full">
        <div class="flex items-center gap-3 text-[12px] text-gray-500 dark:text-gray-400">
          <span
            class="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300/80 dark:to-gray-700"
          ></span>
          <span class="shrink-0 font-[huoxie] tracking-[0.28em]">社交账号</span>
          <span
            class="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300/80 dark:to-gray-700"
          ></span>
        </div>

        <div class="mt-3 flex justify-center gap-5">
          <a
            href="https://github.com/yuze8411"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            class="rounded-full text-gray-600 transition duration-300 hover:-translate-y-0.5 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:text-gray-300 dark:hover:text-sky-300"
          >
            <IconFont name="github" class="text-[28px]"></IconFont>
          </a>
          <a
            href="https://blog.csdn.net/2403_87566238?type=blog"
            target="_blank"
            rel="noreferrer"
            aria-label="CSDN"
            title="CSDN"
            class="rounded-full text-gray-600 transition duration-300 hover:-translate-y-0.5 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:text-gray-300 dark:hover:text-sky-300"
          >
            <IconFont name="csdn1" class="text-[28px]"></IconFont>
          </a>
          <a
            href="https://www.yuque.com/u54109278"
            target="_blank"
            rel="noreferrer"
            aria-label="语雀"
            title="语雀"
            class="rounded-full text-gray-600 transition duration-300 hover:-translate-y-0.5 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:text-gray-300 dark:hover:text-sky-300"
          >
            <IconFont name="yuque" class="text-[28px]"></IconFont>
          </a>
          <a
            href="https://space.bilibili.com/3546706316626107?spm_id_from=333.1007.0.0"
            target="_blank"
            rel="noreferrer"
            aria-label="哔哩哔哩"
            title="bilibili"
            class="rounded-full text-gray-600 transition duration-300 hover:-translate-y-0.5 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:text-gray-300 dark:hover:text-sky-300"
          >
            <IconFont name="bilibili" class="text-[28px]"></IconFont>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里是首页右侧信息内容的组件
</script>

<style scoped>
/* 背景图上方有蓝色滤镜和山体，加一点文字阴影让文字更清楚 */
.mydata-text {
  text-shadow: 0 1px 8px rgba(255, 255, 255, 0.65);
}

.dark .mydata-text {
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
}
</style>
