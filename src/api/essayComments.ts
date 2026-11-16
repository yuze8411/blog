import { supabase } from '@/api/supabase'
import type { EssayComment } from '@/types'

/**
 * 随笔评论接口。
 * 随笔评论和文章评论是两张完全独立的表：
 * - 读取走 essay_comments_public 视图，不把 user_id 带到前台；
 * - 游客评论先进入待审核，审核通过后才展示；博主评论直接展示。
 */

interface RawEssayCommentRow {
  id: string
  essay_id: string
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  created_at: string
  is_owner: boolean
}

const ESSAY_COMMENT_FIELDS =
  'id, essay_id, nickname, avatar_url, website_url, content, created_at, is_owner'

/** 某篇随笔下的全部评论，按时间正序，读起来更自然 */
export async function fetchEssayComments(essayId: string): Promise<EssayComment[]> {
  const { data, error } = await supabase
    .from('essay_comments_public')
    .select(ESSAY_COMMENT_FIELDS)
    .eq('essay_id', essayId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return ((data ?? []) as RawEssayCommentRow[]).map((row) => ({
    id: row.id,
    essayId: row.essay_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    websiteUrl: row.website_url,
    content: row.content,
    createdAt: row.created_at,
    isOwner: row.is_owner,
  }))
}

export interface CreateEssayCommentInput {
  essayId: string
  nickname: string
  content: string
  /** QQ 邮箱会换算成 QQ 头像地址 */
  avatarUrl?: string | null
  websiteUrl?: string | null
}

/**
 * 根据当前会话判断是不是博主。
 * 随笔评论是公开写入，普通访客不能伪造 user_id；
 * 博主评论带上自己的 uid，前台就能显示“博主”标签。
 */
async function resolveEssayCommentAuthor() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const user = data.session?.user
  if (user && user.app_metadata?.role === 'owner') {
    return { userId: user.id as string, isOwner: true }
  }
  return { userId: null, isOwner: false }
}

/** 发表随笔评论：游客进入待审核，博主评论直接通过 */
export async function createEssayComment(
  input: CreateEssayCommentInput,
): Promise<'approved' | 'pending'> {
  const content = input.content.trim()
  if (!content) throw new Error('评论内容不能为空')

  const author = await resolveEssayCommentAuthor()
  const nickname = input.nickname.trim() || (author.isOwner ? '雨落千山' : '')
  if (!nickname) throw new Error('昵称不能为空')

  const status = author.isOwner ? 'approved' : 'pending'

  const { error } = await supabase.from('essay_comments').insert({
    essay_id: input.essayId,
    nickname,
    avatar_url: input.avatarUrl ?? null,
    website_url: input.websiteUrl || null,
    content,
    status,
    ...(author.userId ? { user_id: author.userId } : {}),
  })

  if (error) throw error
  return status
}

/** 随笔评论的错误提示 */
export function essayCommentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    if (import.meta.env.DEV) {
      return '评论被数据库拦截了：请确认 Supabase 已执行 sql.text 第 13、14 段随笔评论策略。'
    }
    return '评论没有发出去，刷新页面后再试试。'
  }
  if (text.includes('violates check constraint')) {
    return '昵称、头像或评论内容的长度不符合要求，检查一下再发。'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试。'
  }
  if (message.startsWith('昵称') || message.startsWith('评论内容')) return message

  return '评论发送失败了，稍后再试。'
}
