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

let shikiPromise: Promise<typeof import('./shiki')> | null = null

// 动态引入 Shiki，语言包和主题会单独打包，不进入首屏 chunk
function loadShiki() {
  shikiPromise ??= import('./shiki')
  return shikiPromise
}

/**
 * 带 Shiki 高亮的 markdown 渲染。
 * markdown-it 的 highlight 是同步的，所以先等 highlighter 初始化完成再渲染。
 */
export async function renderMarkdown(content: string): Promise<string> {
  try {
    const { getHighlighter, SHIKI_THEMES } = await loadShiki()
    const highlighter = await getHighlighter()
    const loaded = new Set(highlighter.getLoadedLanguages())

    // markdown-it 的 highlight 是实例选项，不是 render 的第二个参数
    md.options.highlight = (code: string, lang: string) => {
      // 别名（js、ts 等）先归一到标准语言名；没加载或没写语言就用纯文本
      let language = highlighter.resolveLangAlias(lang || 'text')
      if (language !== 'text' && !loaded.has(language)) language = 'text'

      try {
        return highlighter.codeToHtml(code, {
          lang: language,
          themes: SHIKI_THEMES,
          defaultColor: 'light',
        })
      } catch (error) {
        console.warn(`[shiki] 语言 "${lang}" 高亮失败，已回退为纯文本`, error)
        return highlighter.codeToHtml(code, {
          lang: 'text',
          themes: SHIKI_THEMES,
          defaultColor: 'light',
        })
      }
    }

    return md.render(content) // 在解析到fence时会自动调用highlight定义的回调函数，然后返回值，所以shiki写在highlight的回调里面
  } catch (error) {
    console.error('[shiki] 初始化失败，代码块将按普通文本渲染', error)
    return md.render(content)
  }
}

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
