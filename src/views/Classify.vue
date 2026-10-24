<template>
  <TopNavigation></TopNavigation>
  <ClassifyCover :classify="String(activeIndex)" :total="articles.length"></ClassifyCover>
  <ClassifyContent
    :title="categoryName"
    :articles="articles"
    :categories="CATEGORIES"
    :active-index="activeIndex"
  ></ClassifyContent>
  <SiteFooter></SiteFooter>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Article } from '@/types/article'

const route = useRoute()

// 当前分类
const classify = computed(() => {
  const value = route.query.classify
  return (Array.isArray(value) ? value[0] : value) ?? '0'
})

const CATEGORIES = ['开发笔记', '生活记录', '我的吐槽', '科技产品']

const activeIndex = computed(() => {
  // 获取类型下标
  const index = Number(classify.value)
  return Number.isInteger(index) && index >= 0 && index < data.length ? index : 0
})

const articles = computed(() => data[activeIndex.value] ?? [])
const categoryName = computed(() => CATEGORIES[activeIndex.value] ?? '全部文章')

/* ---------------- 假数据：后续换成接口返回即可 ---------------- */

interface Draft {
  title: string
  time: string
}

const CONTENT =
  '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。'

const COVERS = [
  '/src/assets/images/demoTextImages/demo2.jpg',
  '/src/assets/images/demoTextImages/demo3.jpg',
  '/src/assets/images/demoTextImages/demo4.jpg',
  '/src/assets/images/demoTextImages/demo.jpg',
]

const TAGS = [
  ['前端', 'Vue', '工程化'],
  ['生活', '随笔', '日常'],
  ['吐槽', '职场', '碎碎念'],
  ['数码', '评测', '科技'],
]

// 开发笔记
const DEV: Draft[] = [
  { title: 'Vue 3.5 的 defineModel 到底解决了什么问题', time: '2026-10-21 22:10' },
  { title: '用 IntersectionObserver 写一个只触发一次的入场动画', time: '2026-10-18 09:32' },
  { title: '从 markdown-it 到 Shiki：博客正文渲染链路', time: '2026-10-12 20:05' },
  { title: 'Vite 8 升级踩坑记录', time: '2026-10-06 14:48' },
  { title: '手写一个滚动高亮的文章目录', time: '2026-09-28 23:17' },
  { title: 'Pinia 还是 provide/inject？小项目别想太多', time: '2026-09-22 10:26' },
  { title: 'TypeScript 里那些让我卡住的类型', time: '2026-09-15 21:40' },
  { title: '用 CSS 变量做明暗主题切换', time: '2026-09-08 16:12' },
  { title: '前端路由懒加载与首屏体积', time: '2026-08-30 19:55' },
  { title: '封装一个像样的请求层', time: '2026-08-24 11:03' },
  { title: 'Vue 组件通信的七种方式', time: '2026-08-17 22:38' },
  { title: '从零实现一个虚拟列表', time: '2026-08-09 08:51' },
  { title: 'Tailwind 里我常用的十个写法', time: '2026-07-31 20:19' },
  { title: 'Zustand 源码里学到的小技巧', time: '2026-07-22 15:44' },
  { title: '别再乱用 v-if 和 v-show 了', time: '2026-07-14 09:27' },
  { title: '用 requestAnimationFrame 做滚动节流', time: '2026-07-03 18:36' },
  { title: '前后端联调时我踩过的 CORS 坑', time: '2026-06-25 23:02' },
  { title: '博客评论区是怎么做出来的', time: '2026-06-11 13:20' },
  { title: '用 Vercel 部署一个全栈小站', time: '2026-05-30 21:15' },
  { title: 'GitHub Actions 自动构建踩坑', time: '2026-05-18 10:08' },
  { title: '从 Webpack 换到 Vite 的真实感受', time: '2026-04-27 19:33' },
  { title: '浏览器渲染原理简明笔记', time: '2026-03-19 16:57' },
  { title: '一次内存泄漏的排查过程', time: '2026-02-08 22:41' },
  { title: '我的 2026 年前端学习计划', time: '2026-01-15 09:10' },
]

// 生活记录
const LIFE: Draft[] = [
  { title: '秋天的第一杯热美式', time: '2026-10-20 07:45' },
  { title: '周末去了趟城郊的旧书店', time: '2026-10-11 18:22' },
  { title: '把阳台收拾成了一个小花园', time: '2026-09-27 21:06' },
  { title: '早起第 30 天，我放弃了', time: '2026-09-12 08:30' },
  { title: '一个人看了一场午夜电影', time: '2026-08-29 19:14' },
  { title: '雨天煮面，顺便想通了一件事', time: '2026-08-16 12:05' },
  { title: '搬家之后的第一顿饭', time: '2026-08-05 22:50' },
  { title: '骑行 40 公里，腿废了', time: '2026-07-26 09:36' },
  { title: '夏天的傍晚适合散步', time: '2026-07-12 17:41' },
  { title: '关于朋友这件事', time: '2026-06-30 23:28' },
  { title: '给自己做了一顿像样的早餐', time: '2026-06-18 10:12' },
  { title: '端午回家，吃了三天粽子', time: '2026-06-02 20:55' },
  { title: '五月，适合重新开始', time: '2026-05-20 19:03' },
  { title: '把房间彻底收拾了一遍', time: '2026-05-06 08:47' },
  { title: '雨天和旧唱片', time: '2026-04-22 21:30' },
  { title: '去看了一场春日花展', time: '2026-04-09 14:18' },
  { title: '楼下的猫又来了', time: '2026-03-25 19:52' },
  { title: '通勤路上的一点点观察', time: '2026-03-11 07:58' },
  { title: '关于失眠的一百种理由', time: '2026-02-27 22:13' },
  { title: '一个人也要好好过节', time: '2026-02-14 20:40' },
  { title: '年初立的 flag 倒了几个', time: '2026-01-30 18:06' },
  { title: '冬夜里的一碗热汤', time: '2026-01-12 09:23' },
  { title: '平安夜的风有点冷', time: '2025-12-24 21:47' },
  { title: '深秋，适合想念', time: '2025-11-18 16:39' },
]

// 我的吐槽
const TALK: Draft[] = [
  { title: '求求你别再用 alert 做提示了', time: '2026-10-19 23:12' },
  { title: '那些年我们写过的祖传代码', time: '2026-10-09 20:33' },
  { title: '需求改了第七版之后', time: '2026-09-30 21:58' },
  { title: '为什么你的代码注释比代码还难懂', time: '2026-09-21 09:47' },
  { title: '前端背锅实录', time: '2026-09-05 18:26' },
  { title: '别把组件写成万能组件', time: '2026-08-27 22:04' },
  { title: '关于内卷的一点碎碎念', time: '2026-08-14 15:39' },
  { title: '有些 bug 真的不是前端的锅', time: '2026-08-03 23:41' },
  { title: '产品经理说“很简单，就加个按钮”', time: '2026-07-24 10:15' },
  { title: '远程办公的第三年，我开始想念工位', time: '2026-07-10 19:28' },
  { title: '别再用魔法数字了', time: '2026-06-27 21:16' },
  { title: '复盘会为什么总是变成甩锅会', time: '2026-06-13 08:59' },
  { title: '加班文化真的能提高产出吗', time: '2026-05-28 20:37' },
  { title: '我的代码不需要“优化”', time: '2026-05-11 17:05' },
  { title: '文档？不存在的', time: '2026-04-26 22:22' },
  { title: '别在深夜做技术选型', time: '2026-04-13 11:34' },
  { title: '一次线上事故的复盘（不想再有一次）', time: '2026-03-29 19:49' },
  { title: '关于“全栈”的一点误解', time: '2026-03-07 21:03' },
  { title: '为什么总有人喜欢在群里发语音', time: '2026-02-22 10:27' },
  { title: '春节被亲戚问工作', time: '2026-02-03 18:11' },
  { title: '年度总结为什么这么难写', time: '2026-01-19 22:36' },
  { title: '新的一年，少说废话', time: '2026-01-05 09:55' },
  { title: '双十二买了一堆没用的东西', time: '2025-12-15 20:08' },
  { title: '关于拖延症的一些自我观察', time: '2025-11-09 17:30' },
]

// 科技产品
const TECH: Draft[] = [
  { title: '用了三个月，聊聊这台新手机', time: '2026-10-22 21:25' },
  { title: '机械键盘的尽头是静电容吗', time: '2026-10-15 09:18' },
  { title: '我的桌面搭建 2026', time: '2026-10-04 14:07' },
  { title: '降噪耳机横评：通勤党怎么选', time: '2026-09-25 20:44' },
  { title: 'iPad 到底能不能替代笔记本', time: '2026-09-17 11:36' },
  { title: '一个程序员的充电宝选择', time: '2026-09-09 19:02' },
  { title: '智能家居半年使用报告', time: '2026-08-26 22:19' },
  { title: '显示器色域参数怎么看', time: '2026-08-19 08:53' },
  { title: '电子书阅读器值不值得买', time: '2026-08-06 17:28' },
  { title: '我的 NAS 折腾记录', time: '2026-07-29 21:50' },
  { title: '无线鼠标的延迟到底有多大', time: '2026-07-17 10:11' },
  { title: '聊聊今年的国产芯片', time: '2026-07-08 23:07' },
  { title: '便携屏到底适不适合带出门', time: '2026-06-24 19:35' },
  { title: '智能手表用了一年，我摘下来了', time: '2026-06-09 08:42' },
  { title: '从 4G 到 5G，感知强吗', time: '2026-05-22 21:14' },
  { title: '一次失败的换机经历', time: '2026-05-08 16:03' },
  { title: '桌面小主机方案对比', time: '2026-04-20 20:29' },
  { title: '我为什么还在用有线网', time: '2026-04-02 13:47' },
  { title: '充电协议的坑', time: '2026-03-15 22:08' },
  { title: '无人机入门，先别急着买', time: '2026-03-02 09:31' },
  { title: '关于 AI 硬件的一些观察', time: '2026-02-11 18:44' },
  { title: '年度数码好物清单', time: '2026-01-24 21:57' },
  { title: '双十一之后钱包哭了', time: '2025-12-06 19:12' },
  { title: '老设备还能再战几年', time: '2025-10-28 10:46' },
]

// 每个分类 24 篇；id 全局唯一，时间从新到旧，分组展示时按月切分
const data: Article[][] = [DEV, LIFE, TALK, TECH].map((drafts, categoryIndex) =>
  drafts.map((draft, index) => ({
    textId: `c${categoryIndex}-${index + 1}`,
    coverSrc: COVERS[(categoryIndex * 3 + index) % COVERS.length] ?? COVERS[0] ?? '',
    title: draft.title,
    content: CONTENT,
    time: draft.time,
    comment: 60 + ((index * 37) % 900),
    eyes: 320 + ((index * 173) % 4000),
    tags: TAGS[categoryIndex] ?? [],
  })),
)
</script>

<style scoped></style>
