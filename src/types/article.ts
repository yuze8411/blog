/** 首页文章列表项 */
export interface Article {
  textId: string
  /** 文章 slug，跳详情页时优先用它 */
  slug?: string
  coverSrc: string
  title: string
  content: string
  time: string
  comment: number
  eyes: number
  tags: string[]
  category?: string
}

/** 文章详情页数据 */
export interface ArticleDetail {
  id: string
  /** 详情页头图和右栏卡片的封面，没有时组件内部会用默认图兜底 */
  coverUrl?: string
  author: string
  category: string
  wordsNumber: number
  publishTime: string
  tags: string[]
  title: string
  /** 文章摘要，详情页标题上方的摘要卡片使用 */
  excerpt?: string
  commentNum: number
  content: string
}

/** 文章详情页系列组件的通用 props */
export interface ArticleDetailProps {
  virtureData: ArticleDetail
}

/** 从 markdown 标题解析出的目录项 */
export interface TocItem {
  /** 标题级别，如 2 表示 h2 */
  level: number
  title: string
  /** 对应标题元素的 id，用于点击跳转 */
  id: string
}
