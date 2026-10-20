import type { Article } from './article'

/** 首页文章卡片组件的 props */
export interface ArticleCardProps {
  article: Article
  index: number
}

/** 首页左栏轮播项 */
export interface CarouselItem {
  text: string
  description: string
}

/** 首页文章分页组件的 props */
export interface PaginationProps {
  total: number
  pageSize?: number
  modelValue?: number
}

/** 首页落叶粒子 */
export interface Leaf {
  x0: number
  y0: number
  cx: number // 弧线控制点
  cy: number
  x1: number
  y1: number
  t: number // 0 -> 1 的滑动进度
  speed: number // 每秒进度
  duration: number
  size: number // 初始半高（px）
  rot: number
  spin: number
  wobbleAmp: number
  wobbleFreq: number
  wobblePhase: number
}
