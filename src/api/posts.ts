import { supabase } from '@/api/supabase'

/**
 * 前台文章接口。
 * 统一走 sql.text 里定义的 posts_public 视图：
 * 它只暴露已发布且未隐藏的文章，并且已经帮我们算好了分类名、标签数组和评论数，
 * 前台不需要自己拼 posts / post_tags / tags / comments 多张表。
 */

/** posts_public 视图里列表页会用到的字段 */
export interface PublicPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  category_name: string | null
  published_at: string | null
  created_at: string
  view_count: number | null
  comment_count: number | null
  tags: string[] | null
}

/** 详情页比列表多一个正文 */
export interface PublicPostDetail extends PublicPost {
  content: string | null
}

/** 列表查询的固定字段，详情页会在后面再补一个 content */
const LIST_FIELDS =
  'id, slug, title, excerpt, cover_url, category_name, published_at, created_at, view_count, comment_count, tags'

export interface PublicPostPage {
  list: PublicPost[]
  total: number
  pageSize: number
}

/**
 * 获取前台文章列表（分页）。
 * 按发布时间倒序，发布时间相同再按创建时间倒序，保证翻页顺序稳定。
 */
export async function fetchPublicPosts(page = 1, pageSize = 10): Promise<PublicPostPage> {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const from = (safePage - 1) * pageSize

  const { data, error, count } = await supabase
    .from('posts_public')
    .select(LIST_FIELDS, { count: 'exact' })
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error

  return {
    list: (data ?? []) as PublicPost[],
    total: count ?? 0,
    pageSize,
  }
}

/**
 * 按 slug 或 id 获取单篇文章详情。
 * 优先 slug（地址更好看），没有 slug 时再用 id 兜底。
 * 文章不存在 / 被隐藏时返回 null，交给页面展示“找不到文章”。
 */
export async function fetchPublicPost(params: {
  slug?: string
  id?: string
}): Promise<PublicPostDetail | null> {
  let query = supabase.from('posts_public').select(`${LIST_FIELDS}, content`)

  if (params.slug) query = query.eq('slug', params.slug)
  else if (params.id) query = query.eq('id', params.id)
  else throw new Error('缺少文章 slug 或 id')

  const { data, error } = await query.maybeSingle()
  if (error) throw error

  return (data as PublicPostDetail | null) ?? null
}

/**
 * 浏览量 +1。
 * 游客没有直接更新 posts 表的权限，所以走 sql.text 里提供的
 * security definer 函数 increment_post_views。
 */
export async function increasePostView(slug: string) {
  const { error } = await supabase.rpc('increment_post_views', { p_slug: slug })
  if (error) throw error
}
