/** 前台随笔卡片 */
export interface Essay {
  id: string
  title: string
  /** Markdown 正文 */
  content: string
  publishedAt: string | null
  createdAt: string
  likeCount: number
  commentCount: number
}

/** 随笔评论（和文章评论是两套独立数据） */
export interface EssayComment {
  id: string
  essayId: string
  nickname: string
  avatarUrl: string | null
  websiteUrl: string | null
  content: string
  createdAt: string
  /** 是否博主本人发布 */
  isOwner: boolean
}
