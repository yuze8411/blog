<template>
  <div
    class="relative h-[370px] border border-gray-200/80 rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
  >
    <div class="absolute top-0 left-0 -z-1">
      <img
        src="@/assets/images/8385-mountains-55067_1920 (1).png"
        alt="背景图2"
        class="w-full h-[300px] object-cover relative z-0 rounded-[10px]"
      />
      <div
        class="w-full h-[300px] bg-gradient-to-t from-white dark:from-gray-950 to-transparent absolute bottom-0 left-0 rounded-[10px]"
      ></div>
    </div>
    <div class="absolute top-0 left-0 z-1 w-full mt-7">
      <div class="w-full flex justify-center">
        <div
          class="w-[100px] h-[100px] flex rounded-full justify-center items-center shadow-[0px_4px_10px_0px_rgba(0,0,0,.1)] dark:shadow-[0px_4px_10px_0px_rgba(0,0,0,.5)] overflow-hidden bg-sky-100/10"
        >
          <img
            src="@/assets/images/mycover.jpg"
            alt="我的头像"
            class="w-[90px] h-[90px] rounded-full hover:scale-[1.08] duration-300"
          />
        </div>
      </div>
      <p class="text-center mt-4 text-[20px] font-[huoxie] text-gray-900 dark:text-gray-100">
        雨落千山
      </p>
      <p class="text-center mt-3 text-[16px] font-[huoxie] text-gray-600 dark:text-gray-400">
        前端开发者,学习中ing~
      </p>
      <P class="text-center mt-[2px] text-[16px] font-[huoxie] text-gray-600 dark:text-gray-400"
        >浮生若梦人间寄，得失循环莫悲喜</P
      >
      <div
        class="text-center mt-[52px] text-gray-500 dark:text-gray-400 font-[huoxie] after:content-[''] after:inline-block after:w-[30%] after:h-[1px] after:bg-gray-300 dark:after:bg-gray-700 after:relative after:bottom-[5px] after:left-[25px] before:content-[''] before:inline-block before:w-[30%] before:relative before:bottom-[5px] before:right-[24px] before:h-[1px] before:bg-gray-300 dark:before:bg-gray-700"
      >
        社交账号
      </div>
      <div class="mt-2 flex justify-center gap-5">
        <a
          href="https://github.com/yuze8411"
          target="_blank"
          class="rounded-full hover:-translate-y-[2px] duration-300"
          title="github"
        >
          <IconFont name="github" class="text-[30px]"></IconFont>
        </a>
        <a
          href="https://blog.csdn.net/2403_87566238?type=blog"
          target="_blank"
          class="rounded-full hover:-translate-y-[2px] duration-300"
          title="CSDN"
        >
          <IconFont name="csdn1" class="text-[30px]"></IconFont>
        </a>
        <a
          href="https://www.yuque.com/u54109278"
          target="_blank"
          class="rounded-full hover:-translate-y-[2px] duration-300"
          title="语雀"
        >
          <IconFont name="yuque" class="text-[30px]"></IconFont>
        </a>
        <a
          href="https://space.bilibili.com/3546706316626107?spm_id_from=333.1007.0.0"
          class="rounded-full hover:-translate-y-[2px] duration-300"
          title="bilibili"
          target="_blank"
        >
          <IconFont name="bilibili" class="text-[30px]"></IconFont>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里是首页右侧信息内容的组件
</script>

<style scoped></style>
