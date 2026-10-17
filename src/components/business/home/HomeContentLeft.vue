<template>
  <div class="w-full md:w-[90%] lg:w-[67%] xl:w-[72%] mx-auto transition-width">
    <HomeContentLeftBanner></HomeContentLeftBanner>
    <HomeContentLeftBox
      v-for="(item, index) of articleData"
      :article="item"
      :index="index"
    ></HomeContentLeftBox>
    <HomeContentLeftPages :total="articleData.length"></HomeContentLeftPages>
  </div>
</template>

<script setup lang="ts">
// 这里是首页左侧内容的组件
interface ArticleProps {
  textId: string
  coverSrc: string
  title: string
  content: string
  time: string
  comment: number
  eyes: number
  tags: string[]
}

let articleData: ArticleProps[] = [
  {
    textId: '1',
    coverSrc: '/src/assets/images/demoTextImages/demo2.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
  {
    textId: '2',
    coverSrc: '/src/assets/images/demoTextImages/demo3.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
  {
    textId: '3',
    coverSrc: '/src/assets/images/demoTextImages/demo4.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
]
</script>

<style scoped></style>
