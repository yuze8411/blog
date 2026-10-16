<template>
  <div
    class="w-full h-[280px] rounded-[10px] relative overflow-hidden group mt-3 flex"
    v-if="article.articleType === 1"
  >
    <div
      class="w-full h-full absolute rounded-[10px] z-0"
      style="filter: blur(2.5rem) brightness(0.6)"
    >
      <img :src="article.coverSrc" :alt="article.title" />
    </div>
    <div class="w-[0px] lg:w-[40%] h-full overflow-hidden relative z-1">
      <img
        :src="article.coverSrc"
        class="w-full h-full object-cover object-center hover:scale-105 duration-300 cursor-pointer"
      />
    </div>
    <div class="w-[60%] h-full overflow-hidden p-5 relative z-1 px-7">
      <h2
        class="mt-2 truncate text-[27px] font-[huoxie] text-white hover:text-[#539dfd] cursor-pointer duration-200"
      >
        {{ article.title }}
      </h2>
      <p class="line-clamp-3 font-[huoxie] mt-4 text-[18px] indent-2 text-[#cecece] cursor-pointer">
        {{ article.content }}
      </p>
      <div class="flex w-100px mt-9 gap-[6px]">
        <IconFont name="biaoqian" class="relative top-[5px]"></IconFont>
        <span
          class="font-[huoxie] text-gray-300 text-[17px]"
          v-for="item of article.tags"
          :key="article.textId"
          >#{{ item }}</span
        >
      </div>
      <div class="flex gap-x-5 text-[15px] flex-wrap mt-1">
        <p class="font-[huoxie] flex text-gray-300">
          <IconFont name="hezuozuozhe" class="relative top-[2px] mr-1"></IconFont> 作者：雨落千山
        </p>
        <p class="font-[huoxie] flex text-gray-300">
          <IconFont name="rili" class="relative top-[2px] mr-1"></IconFont> 时间：{{ article.time }}
        </p>
        <p class="font-[huoxie] flex text-gray-300">
          <IconFont name="pinglun" class="relative top-[3px] mr-1"></IconFont> 评论：{{
            article.comment
          }}
        </p>
        <p class="font-[huoxie] flex text-gray-300">
          <IconFont name="eye" class="relative top-[3px] mr-1"></IconFont>{{ article.eyes }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref } from 'vue'
interface Article {
  textId: string
  coverSrc: string
  title: string
  content: string
  time: string
  comment: number
  eyes: number
  tags: string[]
  articleType: number
}
interface Props {
  article: Article
}
const props = defineProps<Props>()
</script>
<style scoped></style>
