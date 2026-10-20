import type { Article } from '@/types'

/** 首页演示文章数据，后续接入真实接口时只需替换这里的 articles */
export const articles: Article[] = [
  {
    textId: '1',
    coverSrc: '/src/assets/images/demoTextImages/demo2.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
  {
    textId: '2',
    coverSrc: '/src/assets/images/demoTextImages/demo3.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
  {
    textId: '3',
    coverSrc: '/src/assets/images/demoTextImages/demo4.jpg',
    title: '我是一个标题',
    content:
      '文章通过对比昨日欢聚与今日独处的强烈反差，表达了面对离别时的失落与不舍。配图进一步烘托了这种从热闹到寂寥的情绪转变，引发读者共鸣。',
    time: '2026-10-16 17:53',
    comment: 1231,
    eyes: 3213,
    tags: ['前端', 'baas', 'vercel'],
  },
]

/** 去重后的标签列表 */
export const siteTags = [...new Set(articles.flatMap((article) => article.tags))]

/** 站点上线日期，用于计算运行天数 */
export const siteLaunchDate = '2026-10-09'

export const siteStats = {
  /** 文章数目 */
  articleCount: articles.length,
  /** 标签数目 */
  tagCount: siteTags.length,
  /** 访问量：所有文章阅读数之和 */
  viewCount: articles.reduce((total, article) => total + article.eyes, 0),
  /** 评论数：所有文章评论数之和 */
  commentCount: articles.reduce((total, article) => total + article.comment, 0),
  /** 最近更新时间 */
  lastUpdatedAt: articles.reduce((latest, article) => {
    const time = new Date(article.time.replace(' ', 'T')).getTime()
    return Number.isFinite(time) && time > latest ? time : latest
  }, 0),
}
