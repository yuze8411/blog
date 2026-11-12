import { supabase } from '@/api/supabase'
import type { TravelImage } from '@/types/travel'

/**
 * 前台游记接口。
 * 照片统一存在 travel_images 表里，后台游记管理也操作同一张表。
 * 前台一次性取回全部照片，由瀑布流组件自己分批渲染。
 */

interface RawTravelRow {
  id: string
  img_url: string
  img_introduction: string | null
  img_tags: string[] | null
  img_time: string | null
}

export async function fetchTravelImages(): Promise<TravelImage[]> {
  const { data, error } = await supabase
    .from('travel_images')
    .select('id, img_url, img_introduction, img_tags, img_time')
    // 先按拍摄时间倒序，同一天拍的再按入库时间倒序，顺序稳定
    .order('img_time', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as RawTravelRow[]).map((row) => ({
    img_id: row.id,
    img_url: row.img_url,
    img_introduction: row.img_introduction ?? '',
    img_tags: Array.isArray(row.img_tags) ? row.img_tags : [],
    img_time: row.img_time ?? '',
  }))
}
