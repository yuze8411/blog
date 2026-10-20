<template>
  <div class="absolute w-full left-0 top-[45%] -translate-y-[50%] flex flex-col items-center">
    <h2
      class="text-[35px] font-[huoxie] text-white max-w-[70%] overflow-hidden text-ellipsis text-nowrap [text-shadow:0_5px_10px_rgba(0,0,0,1)]"
      :title="virtureData.title"
    >
      ：{{ virtureData.title }}
    </h2>
    <div class="mt-4 flex gap-4">
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="zuozhe" class="relative top-1"></IconFont>{{ virtureData.author }}
      </div>
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="xiangzi" class="relative top-1"></IconFont>{{ virtureData.category }}
      </div>
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="chengguozishu" class="relative top-1"></IconFont
        >{{ virtureData.wordsNumber }}字
      </div>
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="shijian" class="relative top-1"></IconFont>{{ virtureData.publishTime }}
      </div>
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="shequpinglun" class="relative top-1"></IconFont>{{ virtureData.commentNum }}
      </div>
      <div class="flex gap-2 text-[17px] text-white font-[huoxie]">
        <IconFont name="biaoqian1" class="relative top-1"></IconFont>
        <div class="flex gap-1">
          <span class="" v-for="(item, index) of virtureData.tags" :key="index">#{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { onMounted } from 'vue'
import type { ArticleDetailProps } from '@/types'
let mdit = new MarkdownIt()
const props = defineProps<ArticleDetailProps>()
onMounted(() => {
  console.log(mdit.render(props.virtureData.content))
})
</script>
<style scoped></style>
