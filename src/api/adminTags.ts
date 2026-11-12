import { supabase } from '@/api/supabase'

/**
 * 后台标签管理接口。
 * 读取 tags 表，同时用 PostgREST 的嵌套 count 拿到每个标签关联的文章数；
 * 删除标签时 post_tags 里的关联会级联删除，不会影响文章本身。
 */

export interface AdminTagRow {
  id: number
  name: string
  created_at: string
  /** 关联的文章数（包含草稿，后台看的是完整数据） */
  post_count: number
}

export interface AdminTagQuery {
  keyword: string
  page: number
}

export interface AdminTagListResult {
  list: AdminTagRow[]
  total: number
  pageSize: number
}

/** 嵌套 count 返回的形状：post_tags: [{ count: 3 }] */
interface RawTagRow {
  id: number
  name: string
  created_at: string
  post_tags?: { count: number }[] | null
}

const PAGE_SIZE = 10
const TAG_FIELDS = 'id, name, created_at, post_tags(count)'

function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

/** 标签列表：支持名称搜索和分页 */
export async function fetchAdminTags(params: AdminTagQuery): Promise<AdminTagListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('tags').select(TAG_FIELDS, { count: 'exact' })

  const keyword = safeKeyword(params.keyword)
  if (keyword) query = query.ilike('name', `%${keyword}%`)

  const { data, error, count } = await query
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  const list = ((data ?? []) as RawTagRow[]).map((row) => ({
    id: Number(row.id),
    name: row.name,
    created_at: row.created_at,
    post_count: Number(row.post_tags?.[0]?.count ?? 0),
  }))

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

/** 新增标签：name 在数据库里是唯一索引，重名会报错 */
export async function createTag(name: string): Promise<void> {
  const { error } = await supabase.from('tags').insert({ name: name.trim() })
  if (error) throw error
}

/** 重命名标签：文章通过 post_tags.tag_id 关联，改名不影响已有文章 */
export async function renameTag(id: number, name: string): Promise<void> {
  const { error } = await supabase.from('tags').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

/** 批量删除标签（关联关系会级联清理） */
export async function deleteTags(ids: number[]): Promise<void> {
  const unique = [...new Set(ids)]
  if (!unique.length) return

  const { error } = await supabase.from('tags').delete().in('id', unique)
  if (error) throw error
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : ''
  }
  return ''
}

export function adminTagErrorMessage(error: unknown): string {
  const text = errorText(error)

  if (text.includes('tags_name_key')) return '这个标签已经存在了，不用重复添加'
  if (text.includes('row-level security')) return '没有权限修改标签，请重新登录后再试'
  if (/failed to fetch|network|timeout/i.test(text)) return '网络不太稳定，稍后再试试'

  return text || '操作失败了，请稍后再试'
}
