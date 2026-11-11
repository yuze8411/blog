/**
 * 站点统一的时间格式化工具。
 * Supabase 返回的是 ISO 字符串（如 2026-11-11T08:30:00+00:00），
 * 这里转成本地时区后展示，避免直接截字符串导致时区对不上。
 */
export function formatDate(value: string | null | undefined, withTime = true) {
  if (!value) return '未知时间'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知时间'

  const pad = (num: number) => String(num).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day
}
