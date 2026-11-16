import { supabase } from '@/api/supabase'

/**
 * 后台随笔评论管理接口。
 * 随笔评论和文章评论是两套独立数据，这里直接操作 essay_comments 表；
 * 游客评论先进入 pending，博主可在评论管理页的「随笔评论」里审核。
 */

export type AdminEssayCommentStatus = 'pending' | 'approved' | 'hidden' | 'spam'
export type AdminEssayCommentStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

export interface AdminEssayCommentRow {
  id: string
  essay_id: string
  essay_title: string
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  status: AdminEssayCommentStatus
  created_at: string
  /** 是否博主本人发布 */
  is_owner: boolean
}

export interface AdminEssayCommentQuery {
  keyword: string
  status: AdminEssayCommentStatusFilter
  year: number | null
  month: number | null
  page: number
}

export interface AdminEssayCommentListResult {
  list: AdminEssayCommentRow[]
  total: number
  pageSize: number
}

interface RawAdminEssayCommentRow {
  id: string
  essay_id: string
  user_id: string | null
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  status: string
  created_at: string
}

const PAGE_SIZE = 10
const COMMENT_FIELDS =
  'id, essay_id, user_id, nickname, avatar_url, website_url, content, status, created_at'

function normalizeStatus(value: string): AdminEssayCommentStatus {
  if (value === 'approved' || value === 'hidden' || value === 'spam') return value
  return 'pending'
}

function uniqueIds(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

/** 随笔评论列表：支持状态、关键字、年月筛选和分页 */
export async function fetchAdminEssayComments(
  params: AdminEssayCommentQuery,
): Promise<AdminEssayCommentListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('essay_comments').select(COMMENT_FIELDS, { count: 'exact' })

  if (params.status === 'rejected') {
    query = query.in('status', ['hidden', 'spam'])
  } else if (params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const keyword = safeKeyword(params.keyword)
  if (keyword) {
    query = query.or(`nickname.ilike.%${keyword}%,content.ilike.%${keyword}%`)
  }

  if (params.year !== null) {
    const start = new Date(params.year, (params.month ?? 1) - 1, 1)
    const end =
      params.month === null
        ? new Date(params.year + 1, 0, 1)
        : new Date(params.year, params.month, 1)
    query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  const rows = (data ?? []) as RawAdminEssayCommentRow[]
  if (!rows.length) return { list: [], total: count ?? 0, pageSize: PAGE_SIZE }

  // 补上所属随笔标题，方便后台知道这条评论挂在哪里
  const essayIds = uniqueIds(rows.map((row) => row.essay_id))
  const { data: essayRows, error: essayError } = await supabase
    .from('essays')
    .select('id, title')
    .in('id', essayIds)

  if (essayError) throw essayError

  const titleMap = new Map(
    (essayRows ?? []).map((essay) => [essay.id as string, essay.title as string]),
  )

  const list = rows.map(
    (row) =>
      ({
        id: row.id,
        essay_id: row.essay_id,
        essay_title: titleMap.get(row.essay_id) ?? '随笔已删除',
        nickname: row.nickname,
        avatar_url: row.avatar_url,
        website_url: row.website_url,
        content: row.content,
        status: normalizeStatus(row.status),
        created_at: row.created_at,
        is_owner: Boolean(row.user_id),
      }) satisfies AdminEssayCommentRow,
  )

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

/** 批量通过随笔评论 */
export async function approveEssayComments(ids: string[]): Promise<number> {
  const unique = uniqueIds(ids)
  if (!unique.length) return 0

  const { data, error } = await supabase
    .from('essay_comments')
    .update({ status: 'approved' })
    .in('id', unique)
    .select('id')

  if (error) throw error
  return data?.length ?? unique.length
}

/** 批量隐藏 / 不通过随笔评论 */
export async function hideEssayComments(ids: string[]): Promise<number> {
  const unique = uniqueIds(ids)
  if (!unique.length) return 0

  const { data, error } = await supabase
    .from('essay_comments')
    .update({ status: 'hidden' })
    .in('id', unique)
    .select('id')

  if (error) throw error
  return data?.length ?? unique.length
}

/** 批量删除随笔评论 */
export async function deleteEssayComments(ids: string[]): Promise<void> {
  const unique = uniqueIds(ids)
  if (!unique.length) return

  const { error } = await supabase.from('essay_comments').delete().in('id', unique)
  if (error) throw error
}

/** 后台随笔评论错误提示 */
export function adminEssayCommentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    return '没有权限修改这条随笔评论，请重新登录后再试'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }

  return message || '操作失败了，请稍后再试'
}
