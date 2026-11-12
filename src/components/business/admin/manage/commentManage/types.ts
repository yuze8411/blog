import type { AdminCommentRow, AdminCommentStatusFilter } from '@/api/adminComments'

/** 评论管理页的筛选条件；page 只给分页条用 */
export interface CommentSearchState {
  keyword: string
  status: AdminCommentStatusFilter
  year: number | null
  month: number | null
  page: number
}

/** AI 审核弹窗里的一行：AI 建议 + 博主当前选择 */
export interface AiReviewItem {
  comment: AdminCommentRow
  /** 最终是否通过，初始值来自 AI，博主可以手动改 */
  pass: boolean
  /** AI 给出的理由 */
  reason: string
  /** AI 原始建议；AI 没判断时为 undefined */
  aiPass?: boolean
}
