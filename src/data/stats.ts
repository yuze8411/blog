import { tagWall } from './tags'

/**
 * 统计页演示数据。
 * 分类数量之和就是站点文章总数；后续接 Supabase 时，这一份文件整体换掉即可，
 * 图表和卡片都只认这里导出的数据。
 */
export interface CategoryStat {
  name: string
  value: number
  /** 浅色模式的扇区颜色：四个分类各占一个色相，靠颜色区分身份 */
  lightColor: string
  /** 暗色模式单独调过的一档，不是把浅色直接反过来用 */
  darkColor: string
}

export interface MonthlyArticles {
  /** 原始年月，格式固定 YYYY-MM，折线图的 x 轴直接用它 */
  month: string
  /** 展示给用户看的年月 */
  label: string
  /** 这个月发布的文章标题，按时间从新到旧 */
  articles: string[]
}

/**
 * 按文章数从多到少排列；颜色和排序都由这里固定，图表与图例不会各说各话。
 * 蓝、橙、紫、青四个色相都跑过色觉与对比度校验，在白色和深色底上都能区分；
 * 相邻扇区刻意避开了容易混淆的蓝紫、橙黄组合。
 */
export const categoryStats: CategoryStat[] = [
  { name: '开发笔记', value: 32, lightColor: '#2a78d6', darkColor: '#3987e5' },
  { name: '生活记录', value: 27, lightColor: '#eb6834', darkColor: '#d95926' },
  { name: '科技产品', value: 21, lightColor: '#6250d6', darkColor: '#9085e9' },
  { name: '我的吐槽', value: 16, lightColor: '#1baf7a', darkColor: '#199e70' },
]

/** 近 12 个月的发布记录，月份从新到旧排列 */
export const monthlyArticles: MonthlyArticles[] = [
  {
    month: '2026-10',
    label: '2026 年 10 月',
    articles: [
      '用 ECharts 把博客数据讲成一个故事',
      '深秋，适合把房间重新布置一遍',
      'TypeScript 6 升级踩坑记录',
      '一台显示器用了三年之后',
      '评论区的第二次重构',
      '周末去了趟城郊的旧书店',
      '为什么我还在写博客',
      'Vite 8 的冷启动到底快在哪',
      '关于「长期主义」的一点怀疑',
    ],
  },
  {
    month: '2026-09',
    label: '2026 年 9 月',
    articles: [
      'Vue 3.6 的 vapor 模式初体验',
      '把状态管理收进一个 store',
      '秋天的第一杯热美式',
      '用 Canvas 写一场金色粒子雨',
      '前端面试里的那些手写题',
      '机械键盘的尽头是静电容吗',
      '九月复盘：慢下来的一周',
      '给博客加一个里程碑页面',
    ],
  },
  {
    month: '2026-08',
    label: '2026 年 8 月',
    articles: [
      'Tailwind 里我常用的十个写法',
      '一次线上白屏的排查过程',
      '凌晨四点的便利店',
      'iPad 到底能不能替代笔记本',
      '从零实现一个虚拟列表',
      '我的桌面搭建 2026',
      '别把组件写成万能组件',
    ],
  },
  {
    month: '2026-07',
    label: '2026 年 7 月',
    articles: [
      '用 IntersectionObserver 做滚动动画',
      '夏天傍晚适合散步',
      '一个程序员的充电宝选择',
      'Pinia 还是 provide/inject',
      '关于远程办公的第三年',
    ],
  },
  {
    month: '2026-06',
    label: '2026 年 6 月',
    articles: [
      '博客评论区是怎么做出来的',
      '端午回家，吃了三天粽子',
      '降噪耳机横评：通勤党怎么选',
      '用 CSS 变量做主题切换',
      '封装一个像样的请求层',
      '复盘会为什么总是变成甩锅会',
    ],
  },
  {
    month: '2026-05',
    label: '2026 年 5 月',
    articles: [
      'Vite 部署到 Vercel 的完整流程',
      '五月，适合重新开始',
      '智能家居半年使用报告',
      '前后端联调时踩过的 CORS 坑',
    ],
  },
  {
    month: '2026-04',
    label: '2026 年 4 月',
    articles: [
      '手写一个滚动高亮的文章目录',
      '去看了一场春日花展',
      '桌面小主机方案对比',
      '别再乱用 v-if 和 v-show 了',
      '一次失败的换机经历',
    ],
  },
  {
    month: '2026-03',
    label: '2026 年 3 月',
    articles: [
      '浏览器渲染原理简明笔记',
      '楼下的猫又来了',
      '充电协议的坑',
      '关于「全栈」的一点误解',
    ],
  },
  {
    month: '2026-02',
    label: '2026 年 2 月',
    articles: ['用 Supabase 搭起博客后端', '一个人也要好好过节', 'AI 硬件的一些观察'],
  },
  {
    month: '2026-01',
    label: '2026 年 1 月',
    articles: [
      '我的 2026 年前端学习计划',
      '冬夜里的一碗热汤',
      '年度数码好物清单',
      '新的一年，少说废话',
      '关于失眠的一百种理由',
    ],
  },
  {
    month: '2025-12',
    label: '2025 年 12 月',
    articles: [
      '平安夜的风有点冷',
      '双十二买了一堆没用的东西',
      '年度总结为什么这么难写',
      '老设备还能再战几年',
    ],
  },
  {
    month: '2025-11',
    label: '2025 年 11 月',
    articles: ['深秋，适合想念', '关于拖延症的一些自我观察', '一次内存泄漏的排查过程'],
  },
]

/** 页面顶部四个大数字的原始值 */
export const statsOverview = {
  /** 四个分类文章数之和 */
  articleCount: categoryStats.reduce((total, category) => total + category.value, 0),
  tagCount: tagWall.length,
  commentCount: 3286,
  /** 站点上线日期，用来算运行天数 */
  launchDate: '2023-03-18',
  /** 这份统计数据的截止日期 */
  updatedAt: '2026-10-30',
}
