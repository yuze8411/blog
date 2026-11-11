/**
 * 粗略统计正文字数：
 * 去掉 markdown 代码块、常见符号和空白后，剩下的字符数。
 * 首页站点数据、文章详情页共用这一套算法，保证两处显示一致。
 */
export function countWords(content: string | null | undefined) {
  if (!content) return 0

  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`~_[\]()!-]/g, '')
    .replace(/\s/g, '').length
}
