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

/** categories_with_counts 视图：分类 + 该分类下已发布文章数 */
export interface PublicCategory {
  id: number
  name: string
  slug: string
  sort_order: number
  post_count: number | null
}

/** tags_with_counts 视图：标签 + 该标签下已发布文章数 */
export interface PublicTag {
  id: number
  name: string
  post_count: number | null
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
 * 获取所有分类（带文章数），按后台设置的排序值升序。
 * 分类页顶部的切换按钮和分类名都来自这里。
 */
export async function fetchCategories(): Promise<PublicCategory[]> {
  const { data, error } = await supabase
    .from('categories_with_counts')
    .select('id, name, slug, sort_order, post_count')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as PublicCategory[]
}

/**
 * 某个分类下的全部文章。
 * posts_public 已经过滤了未发布 / 隐藏的文章，这里直接按分类 id 查即可。
 */
export async function fetchPostsByCategory(categoryId: number): Promise<PublicPost[]> {
  const { data, error } = await supabase
    .from('posts_public')
    .select(LIST_FIELDS)
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PublicPost[]
}

/**
 * 获取标签墙数据（带文章数）。
 * 视图里已经按文章数排过序，这里再显式写一次，避免以后视图调整后顺序变化。
 */
export async function fetchTags(): Promise<PublicTag[]> {
  const { data, error } = await supabase
    .from('tags_with_counts')
    .select('id, name, post_count')
    .order('post_count', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as PublicTag[]
}

/**
 * 某个标签下的全部文章。
 * posts_public.tags 是 text[]，用 contains 做数组包含查询（tags @> '{标签名}'）。
 */
export async function fetchPostsByTag(tagName: string): Promise<PublicPost[]> {
  const { data, error } = await supabase
    .from('posts_public')
    .select(LIST_FIELDS)
    .contains('tags', [tagName])
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PublicPost[]
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
