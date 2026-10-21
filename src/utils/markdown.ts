import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import type { TocItem } from '@/types'

/**
 * 标题转 id：保留中文和英文数字，空格转连字符，去掉其它标点。
 * markdown-it-anchor 会自动处理重复标题（追加 -2、-3）。
 */
function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w一-龥-]/g, '') || 'section'
  )
}

/** 全站共用同一个实例，保证正文和目录生成的标题 id 一致 */
export const md = new MarkdownIt().use(anchor, { slugify })

/**
 * 从 markdown 原文中提取目录。
 * 依赖 markdown-it-anchor 在 parse 阶段写入标题 id。
 */
export function extractToc(content: string, maxLevel = 4): TocItem[] {
  const tokens = md.parse(content, {})
  const toc: TocItem[] = [] /// 目录列表数组

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return // 找h标签

    const level = Number(token.tag.slice(1)) // 取h标签的大小数字
    if (level > maxLevel) return //有最大标题限制，不然我小小的目录栏塞不下太多层级目录

    const inline = tokens[index + 1] // 找下一级的inline token
    if (inline?.type !== 'inline') return

    // 标题里可能有粗体等行内标记，取纯文本内容
    const title = inline.content.replace(/[*_`~[\]]/g, '').trim()
    if (!title) return
    // 目录列表添加该层级目录，方便后面目录渲染
    toc.push({ level, title, id: String(token.attrGet('id') ?? '') })
  })

  return toc
}
