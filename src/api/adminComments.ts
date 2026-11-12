import { supabase } from '@/api/supabase'

/**
 * 后台评论管理接口。
 * 读取 / 修改都直接操作 comments 表，RLS 里只允许 owner 查看和修改全部评论；
 * 前台仍然只通过 comments_public 读取已通过的评论。
 */

export type AdminCommentStatus = 'pending' | 'approved' | 'hidden' | 'spam'
export type AdminCommentStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

export interface AdminCommentRow {
  id: string
  post_id: string
  root_id: string | null
  reply_to_id: string | null
  reply_to_nickname: string | null
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  status: AdminCommentStatus
  created_at: string
  /** 是否博主本人发布；由 user_id 是否为空换算而来 */
  is_owner: boolean
  /** 所属文章标题，文章被删时 comments 会级联删除，这里只是兜底 */
  post_title: string
  /** 所属文章 slug，用于后台点标题跳去前台详情页 */
  post_slug: string | null
}

export interface AdminCommentQuery {
  keyword: string
  status: AdminCommentStatusFilter
  year: number | null
  month: number | null
  page: number
}

export interface AdminCommentListResult {
  list: AdminCommentRow[]
  total: number
  pageSize: number
}

interface RawAdminCommentRow {
  id: string
  post_id: string
  root_id: string | null
  reply_to_id: string | null
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
  'id, post_id, root_id, reply_to_id, user_id, nickname, avatar_url, website_url, content, status, created_at'

/** 数据库里出现未知状态时先按待审核处理，避免后台直接漏掉一条评论 */
function normalizeStatus(value: string): AdminCommentStatus {
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

/** 拉取后台评论列表：支持状态、关键字、年月筛选和分页 */
export async function fetchAdminComments(
  params: AdminCommentQuery,
): Promise<AdminCommentListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('comments').select(COMMENT_FIELDS, { count: 'exact' })

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

  const rows = (data ?? []) as RawAdminCommentRow[]
  if (!rows.length) return { list: [], total: count ?? 0, pageSize: PAGE_SIZE }

  // 评论表本身不存文章标题 / 被回复者昵称，这里用两次小查询补上，
  // 比在 PostgREST 里拼多层关联更直观，也不影响分页结果。
  const postIds = uniqueIds(rows.map((row) => row.post_id))
  const replyTargetIds = uniqueIds(rows.map((row) => row.reply_to_id))

  const [postResult, targetResult] = await Promise.all([
    supabase.from('posts').select('id, title, slug').in('id', postIds),
    replyTargetIds.length
      ? supabase.from('comments').select('id, nickname').in('id', replyTargetIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (postResult.error) throw postResult.error
  if (targetResult.error) throw targetResult.error

  const postMap = new Map(
    (postResult.data ?? []).map((post) => [
      post.id as string,
      post as { id: string; title: string; slug: string | null },
    ]),
  )
  const targetMap = new Map(
    (targetResult.data ?? []).map((target) => [target.id as string, target.nickname as string]),
  )

  const list = rows.map((row) => {
    const post = postMap.get(row.post_id)
    return {
      id: row.id,
      post_id: row.post_id,
      root_id: row.root_id,
      reply_to_id: row.reply_to_id,
      reply_to_nickname: row.reply_to_id ? (targetMap.get(row.reply_to_id) ?? null) : null,
      nickname: row.nickname,
      avatar_url: row.avatar_url,
      website_url: row.website_url,
      content: row.content,
      status: normalizeStatus(row.status),
      created_at: row.created_at,
      is_owner: Boolean(row.user_id),
      post_title: post?.title ?? '文章已删除',
      post_slug: post?.slug ?? null,
    } satisfies AdminCommentRow
  })

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

export interface ApproveCommentsResult {
  /** 本次直接设为已通过的评论数 */
  approved: number
  /** 为了让回复能显示，顺带通过的待审核主评论数 */
  rootApproved: number
}

/**
 * 批量通过评论。
 * 如果通过的是二级回复，而它所属的一级评论还是待审核，
 * 这里会顺手把一级评论也通过，否则前台的评论树会挂不上这条回复。
 */
export async function approveComments(rows: AdminCommentRow[]): Promise<ApproveCommentsResult> {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ids = [...byId.keys()]
  if (!ids.length) return { approved: 0, rootApproved: 0 }

  const rootIds = uniqueIds(
    rows.map((row) => row.root_id).filter((rootId) => rootId && !byId.has(rootId)),
  )

  let rootApproved = 0
  if (rootIds.length) {
    const { data, error } = await supabase
      .from('comments')
      .update({ status: 'approved' })
      .in('id', rootIds)
      // 主评论可能之前被隐藏或标成垃圾，只放行回复会让前台挂不上这个线程，
      // 所以这里把它也一起恢复；已经通过的主评论不重复计数。
      .neq('status', 'approved')
      .select('id')

    if (error) throw error
    rootApproved = data?.length ?? 0
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ status: 'approved' })
    .in('id', ids)
    .select('id')

  if (error) throw error
  return { approved: data?.length ?? ids.length, rootApproved }
}

export interface HideCommentsResult {
  hidden: number
  /** 被隐藏的一级评论下，一并隐藏的回复数 */
  childHidden: number
}

/**
 * 不通过 / 隐藏评论。
 * 隐藏一级评论时，它下面的回复也一起隐藏，避免前台出现没有主评论的孤儿回复。
 */
export async function hideComments(rows: AdminCommentRow[]): Promise<HideCommentsResult> {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ids = [...byId.keys()]
  if (!ids.length) return { hidden: 0, childHidden: 0 }

  const { data, error } = await supabase
    .from('comments')
    .update({ status: 'hidden' })
    .in('id', ids)
    .select('id')

  if (error) throw error

  const rootIds = rows.filter((row) => !row.root_id).map((row) => row.id)
  let childHidden = 0

  if (rootIds.length) {
    const childResult = await supabase
      .from('comments')
      .update({ status: 'hidden' })
      .in('root_id', rootIds)
      .select('id')

    if (childResult.error) throw childResult.error
    childHidden = childResult.data?.length ?? 0
  }

  return { hidden: data?.length ?? ids.length, childHidden }
}

/** 删除评论：删一级评论时数据库会级联删掉它下面的回复 */
export async function deleteComments(ids: string[]): Promise<void> {
  const unique = uniqueIds(ids)
  if (!unique.length) return

  const { error } = await supabase.from('comments').delete().in('id', unique)
  if (error) throw error
}

/** 把数据库 / 网络错误整理成后台能直接展示的中文 */
export function adminCommentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    return '没有权限修改这条评论，请重新登录后再试'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }

  return message || '操作失败了，请稍后再试'
}
