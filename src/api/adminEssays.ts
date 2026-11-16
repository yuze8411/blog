import { supabase } from '@/api/supabase'

/**
 * 后台随笔管理接口。
 * 随笔只有标题和正文，发布状态和展示状态分开：
 * - is_published = false 是草稿，只出现在草稿箱；
 * - 已发布的随笔再用 is_visible 控制前台显示 / 隐藏。
 */

export type AdminEssayStatusFilter = 'visible' | 'hidden' | 'all'

export interface AdminEssayRow {
  id: string
  title: string
  content: string
  is_published: boolean
  is_visible: boolean
  published_at: string | null
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface AdminEssayDraft {
  id: string
  title: string
  content: string
  updated_at: string
}

export interface AdminEssayQuery {
  keyword: string
  status: AdminEssayStatusFilter
  page: number
}

export interface AdminEssayListResult {
  list: AdminEssayRow[]
  total: number
  pageSize: number
}

interface RawAdminEssayRow {
  id: string
  title: string
  content: string
  is_published: boolean
  is_visible: boolean
  published_at: string | null
  like_count: number | null
  comment_count: number | null
  created_at: string
  updated_at: string
}

const PAGE_SIZE = 10
const DRAFT_LIMIT = 50

const ESSAY_ADMIN_FIELDS =
  'id, title, content, is_published, is_visible, published_at, like_count, comment_count, created_at, updated_at'

/** 搜索关键字里会破坏 PostgREST or() / ilike 语法的字符先换成空格 */
function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

function mapEssay(row: RawAdminEssayRow): AdminEssayRow {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    is_published: row.is_published,
    is_visible: row.is_visible,
    published_at: row.published_at,
    like_count: row.like_count ?? 0,
    comment_count: row.comment_count ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** 已发布随笔列表：显示中 / 隐藏中 / 全部 */
export async function fetchAdminEssays(params: AdminEssayQuery): Promise<AdminEssayListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase
    .from('essays_admin')
    .select(ESSAY_ADMIN_FIELDS, { count: 'exact' })
    .eq('is_published', true)

  if (params.status === 'visible') query = query.eq('is_visible', true)
  if (params.status === 'hidden') query = query.eq('is_visible', false)

  const keyword = safeKeyword(params.keyword)
  if (keyword) query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)

  const { data, error, count } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  return {
    list: ((data ?? []) as RawAdminEssayRow[]).map(mapEssay),
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  }
}

/** 草稿箱：所有未发布的随笔，按最后修改时间倒序 */
export async function fetchEssayDrafts(): Promise<AdminEssayDraft[]> {
  const { data, error } = await supabase
    .from('essays')
    .select('id, title, content, updated_at')
    .eq('is_published', false)
    .order('updated_at', { ascending: false })
    .limit(DRAFT_LIMIT)

  if (error) throw error

  return ((data ?? []) as AdminEssayDraft[]).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    updated_at: row.updated_at,
  }))
}

/** 编辑页按 id 读取一篇随笔（包括草稿） */
export async function fetchAdminEssay(id: string): Promise<AdminEssayRow | null> {
  const { data, error } = await supabase
    .from('essays_admin')
    .select(ESSAY_ADMIN_FIELDS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapEssay(data as RawAdminEssayRow) : null
}

/** 切换已发布随笔的前台展示状态 */
export async function setEssayVisible(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from('essays').update({ is_visible: visible }).eq('id', id)
  if (error) throw error
}

/** 删除随笔；随笔下的评论会随外键级联删除 */
export async function deleteEssays(ids: string[]): Promise<void> {
  const unique = [...new Set(ids)]
  if (!unique.length) return

  const { error } = await supabase.from('essays').delete().in('id', unique)
  if (error) throw error
}

/** 后台错误提示 */
export function adminEssayErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (/could not find the table|does not exist|schema cache/i.test(message)) {
    return '随笔的数据表还没有准备好，请先在 Supabase 执行 sql.text 里的第 13 段 SQL。'
  }
  if (text.includes('row-level security')) {
    return '没有权限修改随笔，请重新登录后再试。'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试。'
  }

  return message || '操作失败了，请稍后再试。'
}
