import { supabase } from '@/api/supabase'
import type { Essay } from '@/types'

/**
 * 前台随笔接口。
 * 读取统一走 essays_public 视图，只包含「已发布 + 前台展示」的随笔；
 * 点赞不记录用户身份，直接调用数据库函数累加，所以同一访客可以无限点。
 */

export interface EssayPage {
  list: Essay[]
  total: number
  pageSize: number
}

interface RawEssayRow {
  id: string
  title: string
  content: string
  published_at: string | null
  created_at: string
  like_count: number | null
  comment_count: number | null
}

export const ESSAY_PAGE_SIZE = 10

const ESSAY_FIELDS = 'id, title, content, published_at, created_at, like_count, comment_count'

/** 按发布时间倒序分页读取随笔 */
export async function fetchEssays(page = 1, pageSize = ESSAY_PAGE_SIZE): Promise<EssayPage> {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const from = (safePage - 1) * pageSize

  const { data, error, count } = await supabase
    .from('essays_public')
    .select(ESSAY_FIELDS, { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error

  const list = ((data ?? []) as RawEssayRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
  }))

  return { list, total: count ?? 0, pageSize }
}

/** 点赞 +1；数据库只负责累加，不做“每人只能点一次”的限制 */
export async function incrementEssayLike(essayId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_essay_like', { p_essay_id: essayId })
  if (error) throw error
}

/** 把数据库 / 网络错误翻译成前台能直接展示的中文 */
export function essayErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (/could not find the table|does not exist|schema cache/i.test(message)) {
    return import.meta.env.DEV
      ? '随笔的数据表还没有准备好，请先在 Supabase 执行 sql.text 里的第 13 段 SQL。'
      : '随笔暂时加载不出来，稍后再试试。'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试。'
  }

  return '随笔暂时加载不出来，稍后再试试。'
}
