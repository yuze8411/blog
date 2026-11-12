import { supabase } from '@/api/supabase'

/**
 * 前台统计页的数据接口。
 * 站点总数来自 sql.text 里的 site_stats 视图，月度归档直接读 posts_public。
 */

/** site_stats 视图一行：全站汇总数据 */
export interface SiteStatsRow {
  article_count: number | null
  tag_count: number | null
  category_count: number | null
  word_count: number | null
  view_count: number | null
  comment_count: number | null
  last_updated_at: string | null
}

/**
 * 获取站点汇总数据。
 * 视图正常情况下只有一行；如果还没有任何统计行，返回 null，交给页面用 0 / -- 兜底。
 */
export async function fetchSiteStats(): Promise<SiteStatsRow | null> {
  const { data, error } = await supabase
    .from('site_stats')
    .select(
      'article_count, tag_count, category_count, word_count, view_count, comment_count, last_updated_at',
    )
    .maybeSingle()

  if (error) throw error
  return (data as SiteStatsRow | null) ?? null
}

/** 月度归档只需要标题和发布时间，不用把正文拉下来 */
export interface PostArchiveRow {
  id: string
  slug: string
  title: string
  published_at: string | null
  created_at: string
}

/**
 * 获取所有已发布文章的精简信息，用于近 12 个月归档。
 * posts_public 已经过滤了未发布 / 隐藏的文章。
 */
export async function fetchPostArchive(): Promise<PostArchiveRow[]> {
  const { data, error } = await supabase
    .from('posts_public')
    .select('id, slug, title, published_at, created_at')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PostArchiveRow[]
}
