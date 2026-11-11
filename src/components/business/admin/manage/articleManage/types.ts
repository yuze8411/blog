/**
 * 文章管理列表里的一行数据。
 * 只声明操作会用到的字段，其它字段（封面、标签、浏览量等）照常存在，不影响使用。
 */
export interface ArticleManageRow {
  id: string
  title: string
  is_published: boolean
  is_visible: boolean
}
