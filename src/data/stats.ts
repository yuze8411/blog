/**
 * 统计页的公共类型。
 * 真实数据由 Supabase 查询后在页面里整理成这些结构，图表组件只认类型，不关心数据来源。
 */

/** 分类玫瑰图的一项：名称、文章数、浅色 / 暗色两档扇区颜色 */
export interface CategoryStat {
  name: string
  value: number
  /** 浅色模式的扇区颜色 */
  lightColor: string
  /** 暗色模式单独调过的一档，不是把浅色直接反过来用 */
  darkColor: string
}

/** 月度归档里的一篇文章，点标题可以进详情页 */
export interface MonthlyArticleItem {
  id: string
  slug: string
  title: string
}

export interface MonthlyArticles {
  /** 原始年月，格式固定 YYYY-MM，折线图的 x 轴直接用它 */
  month: string
  /** 展示给用户看的年月 */
  label: string
  /** 这个月发布的文章，按时间从新到旧 */
  articles: MonthlyArticleItem[]
}
