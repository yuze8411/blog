import { supabase } from '@/api/supabase'

/**
 * 前端调用 AI 评论审核的封装。
 * 真正的 DeepSeek 请求在服务端 api/comment-review.ts 里完成，
 * 这里只负责带上当前登录会话，服务端会校验是不是博主本人。
 */

export interface ReviewCommentInput {
  id: string
  nickname: string
  content: string
  postTitle?: string
  replyTo?: string
}

export interface ReviewCommentResult {
  id: string
  pass: boolean
  reason: string
}

interface ReviewResponse {
  results?: unknown
  msg?: string
}

function normalizeResults(input: unknown): ReviewCommentResult[] {
  if (!Array.isArray(input)) return []

  const results: ReviewCommentResult[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    if (typeof record.id !== 'string' || !record.id) continue

    results.push({
      id: record.id,
      pass: record.pass === true,
      reason:
        typeof record.reason === 'string' && record.reason.trim()
          ? record.reason.trim()
          : 'AI 没有给出明确判断，请手动确认',
    })
  }
  return results
}

function requestReview(endpoint: string, token: string, body: string) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  })
}

/**
 * 评论和留言审核共用的请求流程：
 * 带登录 token、token 过期时刷新一次、统一解析结果。
 */
export async function requestAiReview(
  endpoint: string,
  comments: ReviewCommentInput[],
): Promise<ReviewCommentResult[]> {
  const { data: sessionData } = await supabase.auth.getSession()
  let token = sessionData.session?.access_token
  if (!token) {
    throw new Error('登录状态已失效，请重新登录后再使用 AI 审核')
  }

  const body = JSON.stringify({ items: comments })
  let response = await requestReview(endpoint, token, body)

  // access token 刚好过期时服务端会返回 401。
  // 主动刷新一次会话再重试，避免让博主再点一遍。
  if (response.status === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    const nextToken = refreshed.session?.access_token
    if (nextToken && nextToken !== token) {
      token = nextToken
      response = await requestReview(endpoint, token, body)
    }
  }

  const detail = await response.text()
  let payload: ReviewResponse | null = null
  try {
    payload = JSON.parse(detail) as ReviewResponse
  } catch {
    // 不是 JSON 就保留原文作为错误信息
  }

  if (!response.ok) {
    throw new Error(payload?.msg || detail || `AI 审核服务返回异常（${response.status}）`)
  }

  const results = normalizeResults(payload?.results)
  if (!results.length) {
    throw new Error('AI 没有返回可用的审核结果，请重试')
  }

  return results
}

/** 评论审核：沿用原来的调用方式 */
export function reviewComments(comments: ReviewCommentInput[]): Promise<ReviewCommentResult[]> {
  return requestAiReview('/api/comment-review', comments)
}
