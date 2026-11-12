import { supabase } from '@/api/supabase'

/**
 * 后台留言管理接口。
 * 读取 / 修改都直接操作 messages 表，RLS 只允许 owner 查看和修改全部留言；
 * 前台仍然只通过 messages_public 读取已通过的留言。
 */

export type AdminMessageStatus = 'pending' | 'approved' | 'hidden' | 'spam'
export type AdminMessageStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

export interface AdminMessageRow {
  id: string
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  status: AdminMessageStatus
  created_at: string
  /** 是否博主本人发布；由 user_id 是否为空换算而来 */
  is_owner: boolean
}

export interface AdminMessageQuery {
  keyword: string
  status: AdminMessageStatusFilter
  year: number | null
  month: number | null
  page: number
}

export interface AdminMessageListResult {
  list: AdminMessageRow[]
  total: number
  pageSize: number
}

interface RawAdminMessageRow {
  id: string
  user_id: string | null
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  status: string
  created_at: string
}

const PAGE_SIZE = 10
const MESSAGE_FIELDS = 'id, user_id, nickname, avatar_url, website_url, content, status, created_at'

/** 数据库里出现未知状态时先按待审核处理，避免后台直接漏掉一条留言 */
function normalizeStatus(value: string): AdminMessageStatus {
  if (value === 'approved' || value === 'hidden' || value === 'spam') return value
  return 'pending'
}

/** 去重后的 id 列表，批量操作时避免重复更新 */
function uniqueIds(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

/** 搜索关键字里会破坏 PostgREST or() 语法的字符先替换成空格 */
function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

/** 拉取后台留言列表：支持状态、关键字、年月筛选和分页 */
export async function fetchAdminMessages(
  params: AdminMessageQuery,
): Promise<AdminMessageListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('messages').select(MESSAGE_FIELDS, { count: 'exact' })

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

  const list = ((data ?? []) as RawAdminMessageRow[]).map(
    (row) =>
      ({
        id: row.id,
        nickname: row.nickname,
        avatar_url: row.avatar_url,
        website_url: row.website_url,
        content: row.content,
        status: normalizeStatus(row.status),
        created_at: row.created_at,
        is_owner: Boolean(row.user_id),
      }) satisfies AdminMessageRow,
  )

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

/** 批量通过留言 */
export async function approveMessages(ids: string[]): Promise<number> {
  const unique = uniqueIds(ids)
  if (!unique.length) return 0

  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'approved' })
    .in('id', unique)
    .select('id')

  if (error) throw error
  return data?.length ?? unique.length
}

/** 批量不通过 / 隐藏留言 */
export async function hideMessages(ids: string[]): Promise<number> {
  const unique = uniqueIds(ids)
  if (!unique.length) return 0

  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'hidden' })
    .in('id', unique)
    .select('id')

  if (error) throw error
  return data?.length ?? unique.length
}

/** 批量删除留言 */
export async function deleteMessages(ids: string[]): Promise<void> {
  const unique = uniqueIds(ids)
  if (!unique.length) return

  const { error } = await supabase.from('messages').delete().in('id', unique)
  if (error) throw error
}

/** 把数据库 / 网络错误整理成后台能直接展示的中文 */
export function adminMessageErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    return '没有权限修改这条留言，请重新登录后再试'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }

  return message || '操作失败了，请稍后再试'
}
