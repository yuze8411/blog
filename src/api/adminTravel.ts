import { supabase } from '@/api/supabase'

/**
 * 后台游记管理接口：直接读写 travel_images 表。
 * 图片文件存在 Storage 的 blog-image 桶里，这里只负责保存公开地址和文字信息。
 */

export interface AdminTravelRow {
  id: string
  img_url: string
  img_introduction: string
  img_tags: string[]
  /** 拍摄日期，固定是 YYYY-MM-DD */
  img_time: string
  created_at: string
}

export interface TravelPayload {
  img_url: string
  img_introduction: string
  img_tags: string[]
  img_time: string
}

export interface AdminTravelQuery {
  keyword: string
  year: number | null
  month: number | null
  page: number
}

export interface AdminTravelListResult {
  list: AdminTravelRow[]
  total: number
  pageSize: number
}

const PAGE_SIZE = 10
const TRAVEL_FIELDS = 'id, img_url, img_introduction, img_tags, img_time, created_at'

/** 关键字里会破坏 PostgREST or() 语法的字符先换成空格 */
function safeKeyword(keyword: string) {
  return keyword.trim().replace(/[,()%\\]/g, ' ')
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/**
 * 把「年 + 月」换算成 img_time 的日期区间 [start, end)。
 * img_time 是 date 类型，直接比较 YYYY-MM-DD 字符串即可，不会有 UTC 时区偏移。
 */
function dateRange(year: number, month: number | null) {
  const startMonth = month ?? 1
  const start = `${year}-${pad(startMonth)}-01`

  if (month === null) return { start, end: `${year + 1}-01-01` }
  if (month === 12) return { start, end: `${year + 1}-01-01` }

  return { start, end: `${year}-${pad(month + 1)}-01` }
}

/** 游记照片列表：支持介绍关键字、拍摄年月筛选和分页 */
export async function fetchAdminTravel(params: AdminTravelQuery): Promise<AdminTravelListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('travel_images').select(TRAVEL_FIELDS, { count: 'exact' })

  const keyword = safeKeyword(params.keyword)
  if (keyword) query = query.ilike('img_introduction', `%${keyword}%`)

  if (params.year !== null) {
    const { start, end } = dateRange(params.year, params.month)
    query = query.gte('img_time', start).lt('img_time', end)
  }

  const { data, error, count } = await query
    .order('img_time', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  const list = (data ?? []).map((row) => ({
    id: row.id as string,
    img_url: row.img_url as string,
    img_introduction: (row.img_introduction as string | null) ?? '',
    img_tags: Array.isArray(row.img_tags) ? (row.img_tags as string[]) : [],
    img_time: String(row.img_time ?? ''),
    created_at: String(row.created_at ?? ''),
  }))

  return { list, total: count ?? 0, pageSize: PAGE_SIZE }
}

/** 新增一张游记照片 */
export async function createTravel(payload: TravelPayload): Promise<void> {
  const { error } = await supabase.from('travel_images').insert({
    img_url: payload.img_url.trim(),
    img_introduction: payload.img_introduction.trim(),
    img_tags: payload.img_tags,
    img_time: payload.img_time,
  })

  if (error) throw error
}

/** 修改照片信息（图片地址、介绍、标签、拍摄日期） */
export async function updateTravel(id: string, payload: TravelPayload): Promise<void> {
  const { error } = await supabase
    .from('travel_images')
    .update({
      img_url: payload.img_url.trim(),
      img_introduction: payload.img_introduction.trim(),
      img_tags: payload.img_tags,
      img_time: payload.img_time,
    })
    .eq('id', id)

  if (error) throw error
}

/** 批量删除照片记录；Storage 里的原图不会自动删，需要时再手动清理 */
export async function deleteTravel(ids: string[]): Promise<void> {
  const unique = [...new Set(ids)]
  if (!unique.length) return

  const { error } = await supabase.from('travel_images').delete().in('id', unique)
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

export function adminTravelErrorMessage(error: unknown): string {
  const text = errorText(error)

  if (text.includes('travel_images_img_url_check')) return '图片地址无效，请重新上传图片'
  if (text.includes('travel_images_img_introduction_check')) return '照片介绍最多 300 个字'
  if (text.includes('row-level security')) return '没有权限修改游记，请重新登录后再试'
  if (/failed to fetch|network|timeout/i.test(text)) return '网络不太稳定，稍后再试试'

  return text || '操作失败了，请稍后再试'
}
