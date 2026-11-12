import { supabase } from '@/api/supabase'

/**
 * 后台分类管理接口。
 * 读取走 categories_with_counts 视图（自带已发布文章数），
 * 写入直接操作 categories 表，RLS 只允许博主修改。
 */

export interface AdminCategoryRow {
  id: number
  name: string
  slug: string
  sort_order: number
  /** 该分类下已发布且未隐藏的文章数 */
  post_count: number
}

export interface CategoryPayload {
  name: string
  slug: string
  sort_order: number
}

const CATEGORY_FIELDS = 'id, name, slug, sort_order, post_count'

/** 关键字里会破坏 PostgREST or() 语法的字符先换成空格 */
function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

/** 分类列表：数量不多，一次全取，按后台设置的顺序排列 */
export async function fetchAdminCategories(keyword = ''): Promise<AdminCategoryRow[]> {
  let query = supabase.from('categories_with_counts').select(CATEGORY_FIELDS)

  const safe = safeKeyword(keyword)
  if (safe) query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`)

  const { data, error } = await query
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    sort_order: Number(row.sort_order),
    post_count: Number(row.post_count ?? 0),
  }))
}

/**
 * 新增分类。
 * categories.id 是手动维护的 smallint（没有自增），
 * 这里取当前最大 id + 1；分类数量很少，不需要考虑并发抢号。
 */
export async function createCategory(payload: CategoryPayload): Promise<void> {
  const { data, error: maxError } = await supabase
    .from('categories')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)

  if (maxError) throw maxError

  const nextId = Number(data?.[0]?.id ?? 0) + 1

  const { error } = await supabase.from('categories').insert({
    id: nextId,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    sort_order: payload.sort_order,
  })

  if (error) throw error
}

/** 修改分类：id 是主键，不能改 */
export async function updateCategory(id: number, payload: CategoryPayload): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      sort_order: payload.sort_order,
    })
    .eq('id', id)

  if (error) throw error
}

/** 删除分类：分类下还有文章时，数据库会拒绝（on delete restrict） */
export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

/** 取出错误对象里的文字，Supabase 的 PostgrestError 不一定是 Error 实例 */
function errorText(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : ''
  }
  return ''
}

/** 把数据库错误整理成后台能直接展示的中文 */
export function adminCategoryErrorMessage(error: unknown): string {
  const text = errorText(error)

  if (text.includes('categories_name_key')) return '分类名称已经存在了，换一个名字试试'
  if (text.includes('categories_slug_key')) return '这个 slug 已经被占用了，换一个试试'
  if (text.includes('categories_sort_order_key')) return '排序值不能和已有分类重复'
  if (text.includes('violates foreign key') || text.includes('23503')) {
    return '这个分类下还有文章，先把文章移到其它分类再删除'
  }
  if (text.includes('row-level security')) return '没有权限修改分类，请重新登录后再试'
  if (/failed to fetch|network|timeout/i.test(text)) return '网络不太稳定，稍后再试试'

  return text || '操作失败了，请稍后再试'
}
