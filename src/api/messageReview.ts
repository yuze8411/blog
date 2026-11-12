import { requestAiReview, type ReviewCommentResult } from './commentReview'

/**
 * 前端调用 AI 留言审核。
 * 和评论审核共用登录校验、token 刷新和结果解析，只是请求不同的服务端接口。
 */

export interface ReviewMessageInput {
  id: string
  nickname: string
  content: string
}

export function reviewMessages(messages: ReviewMessageInput[]): Promise<ReviewCommentResult[]> {
  // 服务端只关心 id / nickname / content，这里直接复用同一份输入结构
  return requestAiReview('/api/message-review', messages)
}
