export const config = { runtime: 'edge' }

/** Vercel 环境变量（本地开发时由 vite.config.ts 从 .env 读取后传入） */
export interface WeatherEnv {
  QWEATHER_KEY?: string
  QWEATHER_API_HOST?: string
}

/** 允许跨域访问的来源（同源部署时其实用不到，留作调试/独立前端调用） */
const ALLOW_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://blog-rho-gules.vercel.app',
]

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

/**
 * 查询和风天气实时天气。
 * 单独导出，方便本地 Vite 开发服务器复用同一份逻辑，避免线上/本地两份实现。
 */
export async function handleWeather(request: Request, env: WeatherEnv): Promise<Response> {
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

  const apiKey = env.QWEATHER_KEY
  // API Host 在控制台 - 设置中查看，形如 abcxyz.qweatherapi.com（不要带协议和斜杠）
  const apiHost = env.QWEATHER_API_HOST?.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')

  if (!apiKey || !apiHost) {
    console.error('缺少环境变量 QWEATHER_KEY 或 QWEATHER_API_HOST')
    return jsonResponse(
      { msg: '天气服务未配置，请在服务端设置 QWEATHER_KEY 与 QWEATHER_API_HOST' },
      500,
      origin,
    )
  }

  const url = new URL(request.url)
  const latitude = Number(url.searchParams.get('lat'))
  const longitude = Number(url.searchParams.get('lon'))

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return jsonResponse({ msg: '经纬度参数不正确' }, 400, origin)
  }

  // 和风天气新接口要求经纬度最多两位小数
  const targetUrl = new URL(
    `/weather/v1/current/${latitude.toFixed(2)}/${longitude.toFixed(2)}`,
    `https://${apiHost}`,
  )
  targetUrl.searchParams.set('lang', 'zh')

  try {
    const res = await fetch(targetUrl, {
      headers: { 'X-QW-Api-Key': apiKey },
      signal: AbortSignal.timeout(8000),
    })
    const body = await res.text()

    if (!res.ok) {
      console.error('和风天气接口返回错误：', res.status, body)
      return jsonResponse({ msg: `天气服务返回异常（${res.status}）` }, 502, origin)
    }

    const headers = corsHeaders(origin)
    headers.set(
      'Content-Type',
      res.headers.get('content-type') ?? 'application/json; charset=utf-8',
    )
    // 同一位置 5 分钟内复用结果，减少调用次数
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
    return new Response(body, { status: 200, headers })
  } catch (err) {
    console.error('和风天气接口请求失败：', err)
    return jsonResponse({ msg: '请求天气服务异常' }, 502, origin)
  }
}

export default function handler(request: Request): Promise<Response> {
  // Vercel Edge Runtime 要求直接写 process.env.XXX（静态读取），不能整体传递 process.env
  return handleWeather(request, {
    QWEATHER_KEY: process.env.QWEATHER_KEY,
    QWEATHER_API_HOST: process.env.QWEATHER_API_HOST,
  })
}
