/**
 * 写文章页面里几个组件共用的类型。
 * 字段严格照着 sql.text 里的 posts / categories / tags 表来。
 */

/** 文章表单：对应 posts 表里后台需要编辑的字段 */
export interface ArticleForm {
  id: string | null
  title: string
  slug: string
  excerpt: string
  cover_url: string
  category_id: number | null
  content: string
  /** 已发布文章是否在前台展示；编辑隐藏文章时要原样保留 */
  is_visible: boolean
}

export interface CategoryOption {
  id: number
  name: string
}

export interface TagOption {
  id: number
  name: string
}

/** AI 聊天消息 */
export interface AiChatMessage {
  id: number
  role: 'user' | 'assistant'
  /** 用户消息标记是「修改」还是「重写」，AI 回复沿用同一个模式 */
  mode?: 'modify' | 'rewrite'
  content: string
  time: string
}

/** 草稿箱列表项 */
export interface DraftItem {
  id: string
  title: string | null
  excerpt: string | null
  updated_at: string
}
