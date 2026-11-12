/** AI 审核弹窗里的一条内容：评论、留言共用 */
export interface AdminAiReviewItem {
  id: string
  nickname: string
  avatarUrl?: string | null
  content: string
  /** 昵称旁的小标签，例如「博主」「回复」 */
  badges?: string[]
  /** 补充说明，例如所属文章、回复对象 */
  meta?: string
  /** AI 原始建议；AI 没判断时为 undefined */
  aiPass?: boolean
  /** AI 给出的理由 */
  reason: string
  /** 最终是否通过，初始值来自 AI，博主可以手动改 */
  pass: boolean
}

/** 点击「应用审核结果」时提交的两组 id */
export interface AdminAiReviewDecision {
  passIds: string[]
  rejectIds: string[]
}
