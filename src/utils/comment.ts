import ownerFallbackAvatar from '@/assets/images/mycover.jpg'
import type { PublicCommentRow } from '@/api/comments'
import type { CommentReply, CommentThread } from '@/types'
import { formatDate } from './date'

/**
 * 评论区的小工具：邮箱 / QQ 头像 / 友链校验，以及把平铺的评论行整理成两级结构。
 * 这些规则和数据库里的 check 约束保持一致，尽量在提交前就拦住，
 * 避免用户填完一大段内容才被数据库打回来。
 */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const QQ_EMAIL_RE = /^([1-9]\d{4,10})@(?:qq|vip\.qq)\.com$/i
const QQ_DOMAIN_RE = /^(?:qq|vip\.qq)\.com$/i
const QQ_NUMBER_RE = /^[1-9]\d{4,10}$/

export interface EmailCheck {
  ok: boolean
  /** 出错时给用户看的中文提示；通过时为空 */
  message: string
  /** 识别出的 QQ 号，用来换算 QQ 头像 */
  qq?: string
}

/**
 * 校验评论邮箱。
 * 普通邮箱只做常规格式检查；@qq.com / @vip.qq.com 则要求 @ 前必须是 5-11 位数字，
 * 避免把 “abc@qq.com” 这种填错的情况当成 QQ 邮箱，最后头像加载不出来。
 */
export function validateCommentEmail(email: string): EmailCheck {
  const value = email.trim()
  if (!value) return { ok: false, message: '填一下邮箱吧，只用来显示头像' }

  if (!EMAIL_RE.test(value)) {
    return { ok: false, message: '邮箱格式不太对，检查一下 @ 和域名' }
  }

  const at = value.lastIndexOf('@')
  const local = value.slice(0, at)
  const domain = value.slice(at + 1).toLowerCase()

  if (QQ_DOMAIN_RE.test(domain)) {
    if (!QQ_NUMBER_RE.test(local)) {
      return { ok: false, message: 'QQ 邮箱的 @ 前要填 5-11 位数字的 QQ 号' }
    }
    return { ok: true, message: '', qq: local }
  }

  return { ok: true, message: '' }
}

/** 从邮箱里取出 QQ 号；不是合法 QQ 邮箱时返回 null */
export function extractQqNumber(email: string | null | undefined): string | null {
  if (!email) return null
  const match = QQ_EMAIL_RE.exec(email.trim())
  return match?.[1] ?? null
}

/** QQ 头像地址：nk 传 QQ 号，s=100 取 100px，评论头像 40px 足够清晰 */
export function qqAvatarUrl(qq: string): string {
  return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`
}

/** 有合法 QQ 邮箱就用 QQ 头像，否则返回 undefined，由 CommentAvatar 用昵称首字兜底 */
export function avatarFromEmail(email: string | null | undefined): string | undefined {
  const qq = extractQqNumber(email)
  return qq ? qqAvatarUrl(qq) : undefined
}

export interface WebsiteCheck {
  ok: boolean
  /** 归一化后的地址，空字符串表示没填 */
  url: string
  message: string
}

/**
 * 校验并归一化友链。
 * 用户经常只填 example.com，这里自动补 https://；
 * 但 javascript: 这类协议直接拒绝，数据库的 http(s) 约束也不会被绕过。
 */
export function normalizeWebsite(value: string): WebsiteCheck {
  const raw = value.trim()
  if (!raw) return { ok: true, url: '', message: '' }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw) && !/^https?:\/\//i.test(raw)) {
    return { ok: false, url: '', message: '只支持 http:// 或 https:// 链接' }
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    const url = new URL(withProtocol)
    if (!url.hostname.includes('.')) {
      return { ok: false, url: '', message: '链接域名看起来不太对' }
    }
    return { ok: true, url: url.toString(), message: '' }
  } catch {
    return { ok: false, url: '', message: '链接格式不太对，检查一下' }
  }
}

/** 博主没有设置远程头像时，评论区统一用站内这张图兜底 */
export function commentAvatarUrl(row: PublicCommentRow): string | undefined {
  if (row.avatar_url) return row.avatar_url
  return row.is_owner ? ownerFallbackAvatar : undefined
}

function toThread(row: PublicCommentRow): CommentThread {
  return {
    id: row.id,
    uname: row.nickname,
    ulink: row.website_url ?? undefined,
    avatar: commentAvatarUrl(row),
    time: formatDate(row.created_at),
    content: row.content,
    isAuthor: row.is_owner,
    replies: [],
  }
}

function toReply(row: PublicCommentRow): CommentReply {
  return {
    id: row.id,
    uname: row.nickname,
    ulink: row.website_url ?? undefined,
    avatar: commentAvatarUrl(row),
    time: formatDate(row.created_at),
    content: row.content,
    replyTo: row.reply_to_nickname ?? undefined,
    isAuthor: row.is_owner,
  }
}

/**
 * 平铺评论 → 一级评论（replies 里放二级回复）。
 * 一级评论按时间倒序（新的在上面），二级回复按时间正序（对话顺序），
 * 和评论区原来的展示习惯保持一致。
 */
export function buildCommentThreads(rows: PublicCommentRow[]): CommentThread[] {
  const ordered = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const threads: CommentThread[] = []
  const byId = new Map<string, CommentThread>()

  for (const row of ordered) {
    if (row.root_id) continue
    const thread = toThread(row)
    byId.set(row.id, thread)
    threads.push(thread)
  }

  for (const row of ordered) {
    if (!row.root_id) continue
    const thread = byId.get(row.root_id)
    if (thread) thread.replies.push(toReply(row))
  }

  return threads.reverse()
}
