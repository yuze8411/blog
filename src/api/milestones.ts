import { supabase } from '@/api/supabase'
import type { MilestoneArticle } from '@/types'
import fallbackCover from '@/assets/images/demoTextImages/demo.jpg'

/**
 * 前台时光页接口。
 * 读取 milestones_public 视图：只包含被放进时光轴且处于展示中的文章。
 * 时间线位置不单独保存，统一按文章发布时间由早到晚自动排列。
 */

interface RawMilestoneRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  tags: string[] | null
  read_minutes: number | null
}

/** 把带时区的发布时间换成用户本地日期，避免早上 8 点前出现差一天 */
function localDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export async function fetchMilestones(): Promise<MilestoneArticle[]> {
  const { data, error } = await supabase
    .from('milestones_public')
    .select('id, slug, title, excerpt, cover_url, published_at, tags, read_minutes')
    .order('published_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw error

  return ((data ?? []) as RawMilestoneRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    date: localDate(row.published_at ?? ''),
    title: row.title,
    excerpt: row.excerpt?.trim() || '这篇文章暂时还没有摘要，点进来看看吧～',
    tags: Array.isArray(row.tags) ? row.tags : [],
    cover: row.cover_url || fallbackCover,
    readTime: `${row.read_minutes ?? 1} 分钟`,
  }))
}
