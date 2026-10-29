import demo from '@/assets/images/demoTextImages/demo.jpg'
import demo2 from '@/assets/images/demoTextImages/demo2.jpg'
import demo3 from '@/assets/images/demoTextImages/demo3.jpg'
import demo4 from '@/assets/images/demoTextImages/demo4.jpg'
import { tagWall } from '@/data/tags'
import type { Article } from '@/types/article'

/**
 * 标签文章页的演示数据。
 * 按标签名生成固定的文章列表，数量与标签墙上的 count 保持一致；
 * 后续接接口时把 tagArticleMap 替换成接口返回即可。
 */

const COVERS = [demo2, demo3, demo4, demo]

const CONTENTS = [
  '把这段时间零散的记录整理成篇，既是复盘，也是留给以后的自己的一点线索。',
  '从最初的好奇到慢慢形成习惯，中间踩过的坑和突然想通的瞬间都写在了这里。',
  '没有太多宏大的结论，只是把当时的感受和判断原样记下来，供以后回看。',
  '很多事情真正做起来，和想象中并不一样，这篇算是一次诚实的记录。',
]

const TITLE_PATTERNS: ((tag: string) => string)[] = [
  (tag) => `重新认识 ${tag}`,
  (tag) => `关于 ${tag} 的一次深度整理`,
  (tag) => `${tag} 使用笔记：从入门到顺手`,
  (tag) => `我和 ${tag} 相处的这段时间`,
  (tag) => `${tag} 里那些容易被忽略的细节`,
  (tag) => `从 ${tag} 聊起`,
  (tag) => `${tag} 实战中的几点体会`,
  (tag) => `为什么我最近总在关注 ${tag}`,
  (tag) => `${tag} 踩坑与避坑指南`,
  (tag) => `把 ${tag} 讲清楚，其实没那么难`,
  (tag) => `${tag} 的二三事`,
  (tag) => `一次围绕 ${tag} 的复盘`,
  (tag) => `${tag} 带给我的改变`,
  (tag) => `深夜里关于 ${tag} 的一些思考`,
  (tag) => `${tag} 入门路线与我走过的弯路`,
  (tag) => `关于 ${tag} 的碎片记录`,
  (tag) => `用 ${tag} 做一件小事`,
  (tag) => `${tag} 的边界在哪里`,
  (tag) => `重新捡起 ${tag} 之后`,
  (tag) => `${tag} 里值得收藏的几个点`,
  (tag) => `${tag} 杂谈：从兴趣到习惯`,
  (tag) => `我和 ${tag} 的第一次见面`,
  (tag) => `${tag} 进阶路上的一点心得`,
  (tag) => `假如生活里没有 ${tag}`,
  (tag) => `${tag} 年度小结`,
  (tag) => `写在 ${tag} 边上`,
]

const TAG_NAMES = tagWall.map((tag) => tag.name)

function pad(value: number) {
  return String(value).padStart(2, '0')
}

// 每个标签的起始时间稍微错开，避免所有标签的最新文章都挤在同一天
function makeTime(tagIndex: number, index: number) {
  const date = new Date(2026, 9, 23)
  date.setDate(date.getDate() - (index * 11 + (tagIndex % 9)))

  const hour = 8 + ((tagIndex * 5 + index * 3) % 13)
  const minute = (tagIndex * 17 + index * 23) % 60

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(hour)}:${pad(minute)}`
}

function makeTags(tag: string, tagIndex: number, index: number) {
  const related = [
    tag,
    TAG_NAMES[(tagIndex + 5 + index) % TAG_NAMES.length],
    TAG_NAMES[(tagIndex + 11 + index * 2) % TAG_NAMES.length],
  ].filter((name): name is string => Boolean(name))

  return [...new Set(related)]
}

export const tagArticleMap: Record<string, Article[]> = Object.fromEntries(
  tagWall.map((tag, tagIndex) => {
    const articles: Article[] = Array.from({ length: tag.count }, (_, index) => ({
      textId: `t${tagIndex}-${index + 1}`,
      coverSrc: COVERS[(tagIndex + index) % COVERS.length] ?? COVERS[0] ?? '',
      title:
        TITLE_PATTERNS[index % TITLE_PATTERNS.length]?.(tag.name) ?? `${tag.name} 随笔 ${index + 1}`,
      content: CONTENTS[(tagIndex + index) % CONTENTS.length] ?? CONTENTS[0] ?? '',
      time: makeTime(tagIndex, index),
      comment: 30 + ((tagIndex * 13 + index * 37) % 900),
      eyes: 200 + ((tagIndex * 97 + index * 173) % 5000),
      tags: makeTags(tag.name, tagIndex, index),
    }))

    return [tag.name, articles]
  }),
)

/** 按标签名取文章，找不到时返回空数组 */
export function getTagArticles(tag: string): Article[] {
  return tagArticleMap[tag] ?? []
}
