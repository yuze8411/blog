import type { PublicPost } from '@/api/posts'
import type { Article } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'
import { formatDate } from './date'

/**
 * 把 posts_public 的一行转换成列表卡片使用的 Article。
 * 首页、分类页、标签文章页共用同一套映射，保证三处显示一致。
 */
export function publicPostToArticle(row: PublicPost): Article {
  return {
    textId: row.id,
    slug: row.slug,
    coverSrc: row.cover_url || fallbackCover,
    title: row.title,
    content: row.excerpt?.trim() || '这篇文章暂时还没有摘要，点进来看看吧～',
    time: formatDate(row.published_at ?? row.created_at),
    comment: row.comment_count ?? 0,
    eyes: row.view_count ?? 0,
    tags: row.tags ?? [],
    category: row.category_name ?? undefined,
  }
}
