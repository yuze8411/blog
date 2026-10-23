<template>
  <TopNavigation></TopNavigation>
  <ArticleData :virtureData="virtureData"></ArticleData>
  <ArticleContent :virtureData="virtureData"></ArticleContent>
  <SiteFooter></SiteFooter>
</template>

<script setup lang="ts">
import SiteFooter from '@/components/common/SiteFooter.vue'

let virtureData = {
  id: '132',
  author: '雨落千山',
  category: '开发笔记',
  wordsNumber: 1283,
  publishTime: '2026-11-2 23:54',
  tags: ['前端', 'vercel', 'vite', 'pulagin'],
  title: 'Markdown-it的基本使用，同时搭配目录插件生成目录',
  commentNum: 538,
  content: `### 方案：给标签随机分配预设颜色（固定几组配色，明暗模式兼容）
  ## 阿瓦达
  # 大王
  #### 阿瓦达
修改标签循环那一块，准备一套颜色数组，通过 \`index\` 取色，不会随机闪烁。
> 
> 我准备了 5 组浅色背景 + 深色文字、深色模式自动适配的配色，你可以自行增删。
\`\`\`vue
<template>
  <div class="w-full md:w-[90%] lg:w-[77%] xl:w-[82%] mx-auto transition-width">
    <div class="w-full">
      <div
        class="text-gray-900 dark:text-gray-200 font-[huoxie] text-[26px] max-w-full line-clamp-2"
      >
        {{ virtureData.title }}
      </div>
      <div class="flex gap-2 mt-2 mb-3" title="标签">
        <IconFont name="biaoqian1" class="text-[23px] mr-[2px] relative top-[3px]"></IconFont>
        <span
          class="font-[huoxie] text-[17px] px-1 py-[2px] rounded-[6px]"
          :class="tagColorList[index % tagColorList.length]"
          v-for="(item, index) of virtureData.tags"
          :key="index"
          >#{{ item }}</span
        >
      </div>
      <div class="-full h-[1px] bg-gray-200 dark:bg-gray-700 mt-[6px]"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface virtureDatatype {
  id: string
  author: string
  category: string
  wordsNumber: number
  publishTime: string
  tags: string[]
  title: string
  commentNum: number
  content: string
}
interface props {
  virtureData: virtureDatatype
}
const props = defineProps<props>()
// 标签样式class列表，tailwind 类名
const tagColorList = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
]
<\/script>
<style scoped><\/style>
\`\`\`
#### 关键点说明
1. \`index % tagColorList.length\`：对索引取模，循环复用配色，标签顺序固定后颜色就固定，不会切换组件乱跳。
2. 同时写了 **浅色 + dark 深色模式** 两套样式，适配你页面的暗色主题。
3. 补充了分割线 \`dark:bg-gray-700\`，暗色下分割线不会看不见。
4. 给 \`v-for\` 补上了 \`:key="index"\`，规范写法。
---
### 如果你想要【内联 style 版本】（不想用 tailwind class）
\`\`\`vue
<script setup>
const tagStyleList = [
  { bg: '#dbeafe', color: '#1d4ed8', darkBg: '#1e3a8a80', darkColor: '#93c5fd' },
  { bg: '#dcfce7', color: '#15803d', darkBg: '#14532d80', darkColor: '#86efac' },
  { bg: '#ffedd5', color: '#c2410c', darkBg: '#7c2d1280', darkColor: '#fdba74' },
]
<\/script>
<span
  class="font-[huoxie] text-[17px] px-1 py-[2px] rounded-[6px]"
  :style="isDark ? {background: tagStyleList[index%tagStyleList.length].darkBg, color: tagStyleList[index%tagStyleList.length].darkColor} : {background: tagStyleList[index%tagStyleList.length].bg, color: tagStyleList[index%tagStyleList.length].color}"
  v-for="(item, index) of virtureData.tags"
  :key="index"
>#{{ item }}</span>
\`\`\`
`,
}
</script>

<style scoped></style>
