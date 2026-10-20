/** 首页文章列表项 */
export interface Article {
  textId: string
  coverSrc: string
  title: string
  content: string
  time: string
  comment: number
  eyes: number
  tags: string[]
}

/** 文章详情页数据 */
export interface ArticleDetail {
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
