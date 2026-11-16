/**
 * 把随笔的 Markdown 正文压成一段纯文本，供后台列表和草稿箱预览。
 * 这里只做粗略处理，不追求完美还原；太长时截断并补省略号。
 */
export function essayExcerpt(content: string | null | undefined, length = 110) {
  const plain = (content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*`~_[\]()!|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plain) return '暂无内容'
  return plain.length > length ? `${plain.slice(0, length)}…` : plain
}
