import { supabase } from '@/api/supabase'

/**
 * 后台时光管理接口。
 * milestone_articles 只保存「哪篇文章被放进了时光轴」和展示状态，
 * 具体位置由前台按文章发布时间自动计算，不需要手动排序。
 */

export type AdminMilestoneStatusFilter = 'visible' | 'hidden' | 'all'

export interface AdminMilestoneRow {
  id: string
  post_id: string
  /** 时光轴上的展示状态 */
  is_visible: boolean
  created_at: string
  title: string
  slug: string
  excerpt: string
  cover_url: string | null
  published_at: string | null
  /** 文章本身是否已发布 */
  is_published: boolean
  /** 文章本身是否在前台展示 */
  post_is_visible: boolean
}

export interface AdminMilestoneQuery {
  keyword: string
  status: AdminMilestoneStatusFilter
  page: number
}

export interface AdminMilestoneListResult {
  list: AdminMilestoneRow[]
  total: number
  pageSize: number
}

export interface AdminMilestoneCandidate {
  id: string
  title: string
  excerpt: string
  cover_url: string | null
  published_at: string
}

interface RawAdminMilestoneRow {
  id: string
  post_id: string
  is_visible: boolean
  created_at: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  is_published: boolean
  post_is_visible: boolean
}

const PAGE_SIZE = 10
const CANDIDATE_LIMIT = 100

const MILESTONE_FIELDS =
  'id, post_id, is_visible, created_at, title, slug, excerpt, cover_url, published_at, is_published, post_is_visible'

/** 搜索关键字里会破坏 PostgREST or() / ilike 语法的字符先换成空格 */
function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

/** 后台时光列表：支持标题搜索、展示状态筛选和分页 */
export async function fetchAdminMilestones(
  params: AdminMilestoneQuery,
): Promise<AdminMilestoneListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('milestones_admin').select(MILESTONE_FIELDS, { count: 'exact' })

  if (params.status === 'visible') query = query.eq('is_visible', true)
  if (params.status === 'hidden') query = query.eq('is_visible', false)

  const keyword = safeKeyword(params.keyword)
  if (keyword) query = query.ilike('title', `%${keyword}%`)

  const { data, error, count } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  const list = ((data ?? []) as RawAdminMilestoneRow[]).map((row) => ({
    id: row.id,
    post_id: row.post_id,
    is_visible: row.is_visible,
    created_at: row.created_at,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt?.trim() ?? '',
    cover_url: row.cover_url,
    published_at: row.published_at,
    is_published: row.is_published,
    post_is_visible: row.post_is_visible,
  }))

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

/**
 * 可加入时光轴的文章。
 * 只列出「已发布 + 前台可见」且还没有出现在时光轴里的文章，避免重复添加。
 */
export async function fetchMilestoneCandidates(keyword = ''): Promise<AdminMilestoneCandidate[]> {
  const { data: usedRows, error: usedError } = await supabase
    .from('milestone_articles')
    .select('post_id')

  if (usedError) throw usedError

  const usedIds = (usedRows ?? [])
    .map((row) => row.post_id as string | null)
    .filter((id): id is string => Boolean(id))

  let query = supabase
    .from('posts')
    .select('id, title, excerpt, cover_url, published_at')
    .eq('is_published', true)
    .eq('is_visible', true)
    // 没有发布时间的文章无法在时光轴上定位，不放进候选列表
    .gte('published_at', '1970-01-01T00:00:00Z')

  const safe = safeKeyword(keyword)
  if (safe) query = query.ilike('title', `%${safe}%`)
  if (usedIds.length) query = query.not('id', 'in', `(${usedIds.join(',')})`)

  const { data, error } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(CANDIDATE_LIMIT)

  if (error) throw error

  return (
    (data ?? []) as {
      id: string
      title: string
      excerpt: string | null
      cover_url: string | null
      published_at: string
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt?.trim() ?? '',
    cover_url: row.cover_url,
    published_at: row.published_at,
  }))
}

/** 把文章加入时光轴，默认处于展示中 */
export async function addMilestone(postId: string): Promise<void> {
  const { error } = await supabase.from('milestone_articles').insert({
    post_id: postId,
    is_visible: true,
  })

  if (error) throw error
}

/** 切换时光轴上的展示 / 隐藏状态 */
export async function setMilestoneVisible(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase
    .from('milestone_articles')
    .update({ is_visible: visible })
    .eq('id', id)

  if (error) throw error
}

/** 从时光轴移除文章；不会删除原文章 */
export async function deleteMilestones(ids: string[]): Promise<void> {
  const unique = [...new Set(ids)]
  if (!unique.length) return

  const { error } = await supabase.from('milestone_articles').delete().in('id', unique)
  if (error) throw error
}

/** 把 Supabase / 网络错误整理成后台能直接展示的中文 */
export function adminMilestoneErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('milestone_articles_post_id_key') || text.includes('duplicate key')) {
    return '这篇文章已经在时光轴里了'
  }
  if (text.includes('row-level security')) {
    return '没有权限修改时光轴，请重新登录后再试'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }

  return message || '操作失败了，请稍后再试'
}
