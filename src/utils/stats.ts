import type { PostArchiveRow } from '@/api/stats'
import type { MonthlyArticles } from '@/data/stats'

/** 月份补零，保证 YYYY-MM 格式固定 */
function pad(num: number) {
  return String(num).padStart(2, '0')
}

/** 把时间转成图表使用的本地年月 */
function monthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/**
 * 把文章列表整理成“近 N 个月”的归档：
 * - 月份从新到旧，只保留最新文章所在月份往前数的 N 个月；
 * - 没有文章的月份也保留（值为 0），折线图不会凭空把空月挤掉；
 * - 每个月内部按发布时间从新到旧。
 */
export function buildMonthlyArchive(
  rows: PostArchiveRow[],
  monthCount = 12,
): MonthlyArticles[] {
  const entries = rows
    .map((row) => {
      const date = new Date(row.published_at ?? row.created_at)
      return Number.isNaN(date.getTime()) ? null : { row, date }
    })
    .filter((entry): entry is { row: PostArchiveRow; date: Date } => entry !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const latest = entries[0]?.date ?? new Date()
  const endYear = latest.getFullYear()
  const endMonth = latest.getMonth()

  // 先铺出连续月份，后面往对应月份里塞文章
  const months: MonthlyArticles[] = []
  for (let offset = 0; offset < monthCount; offset += 1) {
    const date = new Date(endYear, endMonth - offset, 1)
    months.push({
      month: monthKey(date),
      label: `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`,
      articles: [],
    })
  }

  const byMonth = new Map(months.map((group) => [group.month, group]))

  for (const { row, date } of entries) {
    const group = byMonth.get(monthKey(date))
    // 超出近 N 个月的文章不进归档，避免列表无限变长
    if (!group) continue

    group.articles.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
    })
  }

  return months
}
