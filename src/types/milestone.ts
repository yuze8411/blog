/** 时光线上的一个文章节点 */
export interface MilestoneArticle {
  /** 文章 id，点击卡片时带进详情页 */
  id: string
  /** 日期，格式固定为 YYYY-MM-DD，时间线直接按这个顺序排列 */
  date: string
  title: string
  excerpt: string
  tags: string[]
  /** 卡片缩略图（import 之后的图片地址） */
  cover: string
  /** 预计阅读时间，例如「5 分钟」 */
  readTime: string
}
