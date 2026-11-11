<template>
  <!--图片在左-->
  <div
    class="w-full h-[280px] rounded-[10px] relative overflow-hidden group mt-3 flex cursor-pointer transition-shadow duration-300 hover:shadow-[0_20px_45px_-22px_rgba(0,0,0,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#539dfd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
    v-if="index % 2 == 0"
    role="link"
    tabindex="0"
    :aria-label="`阅读文章：${article.title}`"
    title="点击阅读全文"
    @click="openArticle"
    @keydown.enter.prevent="openArticle"
    @keydown.space.prevent="openArticle"
  >
    <div
      class="w-full h-full absolute rounded-[10px] z-0"
      style="filter: blur(2.5rem) brightness(0.6)"
    >
      <img :src="article.coverSrc" :alt="article.title" @error="handleCoverError" />
    </div>
    <div class="w-[0px] lg:w-[40%] h-full relative z-1">
      <img
        :src="article.coverSrc"
        :alt="article.title"
        class="w-full h-full object-cover object-center hover:scale-105 duration-300 left_clip"
        @error="handleCoverError"
      />
    </div>
    <div class="w-[60%] h-full overflow-hidden p-5 relative z-1 px-7">
      <h2
        class="mt-2 truncate text-[27px] font-[huoxie] text-white hover:text-[#539dfd] duration-200"
      >
        {{ article.title }}
      </h2>
      <p class="line-clamp-3 font-[huoxie] mt-4 text-[18px] indent-2 text-[#cecece]">
        {{ article.content }}
      </p>
      <div v-if="article.tags.length" class="flex w-100px mt-9 gap-[6px]">
        <IconFont name="biaoqian" class="relative top-[5px]"></IconFont>
        <span
          class="font-[huoxie] text-gray-300 text-[17px]"
          v-for="item of article.tags"
          :key="item"
          >#{{ item }}</span
        >
      </div>
      <div
        class="flex gap-x-5 text-[15px] flex-wrap"
        :class="article.tags.length ? 'mt-1' : 'mt-[38px]'"
      >
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
  <!--图片在右-->
  <div
    class="w-full h-[280px] rounded-[10px] relative overflow-hidden group mt-3 flex cursor-pointer transition-shadow duration-300 hover:shadow-[0_20px_45px_-22px_rgba(0,0,0,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#539dfd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
    v-if="index % 2 == 1"
    role="link"
    tabindex="0"
    :aria-label="`阅读文章：${article.title}`"
    title="点击阅读全文"
    @click="openArticle"
    @keydown.enter.prevent="openArticle"
    @keydown.space.prevent="openArticle"
  >
    <div
      class="w-full h-full absolute rounded-[10px] z-0"
      style="filter: blur(2.5rem) brightness(0.6)"
    >
      <img :src="article.coverSrc" :alt="article.title" @error="handleCoverError" />
    </div>
    <div class="w-[60%] h-full overflow-hidden p-5 relative z-1 px-7">
      <h2
        class="mt-2 truncate text-[27px] font-[huoxie] text-white hover:text-[#539dfd] duration-200"
      >
        {{ article.title }}
      </h2>
      <p class="line-clamp-3 font-[huoxie] mt-4 text-[18px] indent-2 text-[#cecece]">
        {{ article.content }}
      </p>
      <div v-if="article.tags.length" class="flex w-100px mt-9 gap-[6px]">
        <IconFont name="biaoqian" class="relative top-[5px]"></IconFont>
        <span
          class="font-[huoxie] text-gray-300 text-[17px]"
          v-for="item of article.tags"
          :key="item"
          >#{{ item }}</span
        >
      </div>
      <div
        class="flex gap-x-5 text-[15px] flex-wrap"
        :class="article.tags.length ? 'mt-1' : 'mt-[38px]'"
      >
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
    <div class="w-[0px] lg:w-[40%] h-full relative z-1">
      <img
        :src="article.coverSrc"
        :alt="article.title"
        class="w-full h-full object-cover object-center hover:scale-105 duration-300 right_clip"
        @error="handleCoverError"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Article, ArticleCardProps } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

const props = defineProps<ArticleCardProps>()

const emit = defineEmits<{
  open: [article: Article]
}>()

/** 点击整张卡片都进入文章详情 */
function openArticle() {
  emit('open', props.article)
}

// 封面地址失效时换成本地默认图，并打上标记避免死循环
function handleCoverError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = fallbackCover
}
</script>
<style scoped>
.left_clip {
  clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
}

.right_clip {
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
}
</style>
