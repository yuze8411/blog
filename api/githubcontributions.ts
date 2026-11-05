export const config = { runtime: 'edge' }

/** Vercel 环境变量（本地开发时由 vite.config.ts 从 .env 读取后传入） */
export interface GithubEnv {
  GITHUB_PAT?: string
}

/** 允许跨域访问的来源，和天气接口保持一致 */
const ALLOW_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://blog-rho-gules.vercel.app',
]

/** 没传 username 时默认查这个账号 */
const DEFAULT_USERNAME = 'yuze8411'

/** GitHub 用户名规则：字母数字开头结尾，中间可以有单个连字符 */
const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers()
  if (origin && ALLOW_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }
  return headers
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  const headers = corsHeaders(origin)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(body), { status, headers })
}

/** GitHub GraphQL 返回的原始贡献日 */
interface GithubContributionDayPayload {
  date: string
  contributionCount: number
  /** 0 是周日，6 是周六 */
  weekday: number
}

interface GithubGraphqlPayload {
  data?: {
    user: {
      login: string
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: GithubContributionDayPayload[]
          }[]
        }
      }
    } | null
  }
  errors?: { message: string }[]
}

/** 把贡献次数换算成热力图的五档颜色 */
function toLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

/** 统一使用 UTC 日期，避免服务器和浏览器时区不同导致最后一天错位 */
function formatDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 查询 GitHub 贡献日历。
 * GitHub REST API 没有贡献日历接口，所以这里走 GraphQL 的 contributionCalendar，
 * PAT 只在服务端读取，浏览器永远看不到。
 */
export async function handleGithubContributions(
  request: Request,
  env: GithubEnv,
): Promise<Response> {
  const origin = request.headers.get('origin')

  // CORS 预检
  if (request.method === 'OPTIONS') {
    const headers = corsHeaders(origin)
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return new Response(null, { status: 204, headers })
  }

  if (request.method !== 'GET') {
    return jsonResponse({ msg: '仅支持 GET 请求' }, 405, origin)
  }

  const token = env.GITHUB_PAT?.trim()
  if (!token) {
    console.error('缺少环境变量 GITHUB_PAT')
    return jsonResponse({ msg: 'GitHub 服务未配置，请在服务端设置 GITHUB_PAT' }, 500, origin)
  }

  const url = new URL(request.url)
  const username = url.searchParams.get('username')?.trim() || DEFAULT_USERNAME

  if (!USERNAME_PATTERN.test(username)) {
    return jsonResponse({ msg: 'GitHub 用户名格式不正确' }, 400, origin)
  }

  // 查询最近 365 天：今天往前推 364 天，首尾都算上刚好一年
  const end = new Date()
  const start = new Date(end.getTime() - 364 * 86_400_000)
  const startKey = formatDate(start)
  const todayKey = formatDate(end)

  const query = `
    query GithubContributions($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        login
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'my-blog-github-heatmap',
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: start.toISOString(),
          to: end.toISOString(),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    })

    const bodyText = await res.text()

    if (!res.ok) {
      console.error('GitHub GraphQL 请求失败：', res.status, bodyText)
      return jsonResponse({ msg: `GitHub 服务返回异常（${res.status}）` }, 502, origin)
    }

    let payload: GithubGraphqlPayload
    try {
      payload = JSON.parse(bodyText) as GithubGraphqlPayload
    } catch {
      console.error('GitHub GraphQL 返回了无法解析的内容：', bodyText.slice(0, 200))
      return jsonResponse({ msg: 'GitHub 服务返回格式异常' }, 502, origin)
    }

    // GraphQL 有时 HTTP 200，但 errors 里才写着真正的问题
    if (payload.errors?.length) {
      console.error(
        'GitHub GraphQL 返回错误：',
        payload.errors.map((item) => item.message).join('; '),
      )
      return jsonResponse({ msg: 'GitHub 数据查询失败' }, 502, origin)
    }

    const user = payload.data?.user
    if (!user) {
      return jsonResponse({ msg: '没有找到这个 GitHub 用户' }, 404, origin)
    }

    // 把 GitHub 的周数据整理成组件需要的结构：每列固定七天，缺失的位置补 null
    const weeks: { days: ({ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 } | null)[] }[] =
      []

    for (const week of user.contributionsCollection.contributionCalendar.weeks) {
      const days = Array.from({ length: 7 }, () => null) as ({
        date: string
        count: number
        level: 0 | 1 | 2 | 3 | 4
      } | null)[]

      for (const day of week.contributionDays) {
        // 首尾两周可能包含范围外的日期，或者今天之后还没到的日期，直接跳过
        if (day.date < startKey || day.date > todayKey) continue

        const count = Math.max(0, day.contributionCount)
        // weekday 是 0-6，正好对应热力图的七行；万一字段异常就按日期自己算
        const weekday =
          day.weekday >= 0 && day.weekday <= 6
            ? day.weekday
            : new Date(`${day.date}T00:00:00Z`).getUTCDay()

        days[weekday] = {
          date: day.date,
          count,
          level: toLevel(count),
        }
      }

      // 整个星期都在范围外时不要留空列
      if (days.some((day) => day !== null)) {
        weeks.push({ days })
      }
    }

    const allDays = weeks
      .flatMap((week) => week.days)
      .filter((day): day is NonNullable<typeof day> => day !== null)

    let total = 0
    let longestStreak = 0
    let runningStreak = 0

    for (const day of allDays) {
      total += day.count

      if (day.count > 0) {
        runningStreak += 1
        longestStreak = Math.max(longestStreak, runningStreak)
      } else {
        runningStreak = 0
      }
    }

    // 当前连续天数：从今天往回数，遇到零贡献或数据边界就停
    let currentStreak = 0
    for (let index = allDays.length - 1; index >= 0; index -= 1) {
      const day = allDays[index]
      if (!day || day.count === 0) break
      currentStreak += 1
    }

    const result = {
      username: user.login,
      total,
      longestStreak,
      currentStreak,
      startDate: allDays[0]?.date ?? startKey,
      endDate: allDays[allDays.length - 1]?.date ?? todayKey,
      weeks,
    }

    const headers = corsHeaders(origin)
    headers.set('Content-Type', 'application/json; charset=utf-8')
    // 贡献数据变化不快，缓存 5 分钟，顺便减少 GraphQL 调用次数
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
    return new Response(JSON.stringify(result), { status: 200, headers })
  } catch (err) {
    console.error('GitHub 贡献数据请求失败：', err)
    return jsonResponse({ msg: '请求 GitHub 服务异常' }, 502, origin)
  }
}

export default function handler(request: Request): Promise<Response> {
  // Vercel Edge Runtime 要求直接写 process.env.XXX，不能整体传递 process.env
  return handleGithubContributions(request, {
    GITHUB_PAT: process.env.GITHUB_PAT,
  })
}
