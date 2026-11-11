export const config = { runtime: 'edge' }

/** Vercel 环境变量（本地开发时由 vite.config.ts 从 .env 读取后传入） */
export interface DeepSeekEnv {
  DEEPSEEK_API_KEY?: string
  DEEPSEEK_MODEL?: string
  DEEPSEEK_BASE_URL?: string
  /** 用来校验请求者是不是博主本人 */
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

/**
 * 代理 DeepSeek 的流式对话接口。
 * Key 只留在服务端，不会被打进前端代码；前端只请求 /api/deepseek。
 * 单独导出，方便本地 Vite 开发服务器复用同一份逻辑。
 */
export async function handleDeepSeek(request: Request, env: DeepSeekEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ msg: '仅支持 POST 请求' }, 405)
  }

  const apiKey = env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.error('缺少环境变量 DEEPSEEK_API_KEY')
    return jsonResponse({ msg: 'AI 写作未配置，请在服务端设置 DEEPSEEK_API_KEY' }, 500)
  }

  // 只允许登录的博主调用，防止别人拿这个接口刷 AI 额度
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return jsonResponse({ msg: '请先登录后再使用 AI 写作' }, 401)
  }

  const supabaseUrl = env.SUPABASE_URL?.replace(/\/+$/, '')
  const supabaseAnonKey = env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('缺少环境变量 SUPABASE_URL 或 SUPABASE_ANON_KEY')
    return jsonResponse({ msg: '服务端登录校验未配置' }, 500)
  }

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!userRes.ok) {
      return jsonResponse({ msg: '登录状态已失效，请重新登录' }, 401)
    }
    const user = (await userRes.json()) as { app_metadata?: { role?: string } }
    if (user.app_metadata?.role !== 'owner') {
      return jsonResponse({ msg: '只有博主本人可以使用 AI 写作' }, 403)
    }
  } catch (err) {
    console.error('Supabase 登录校验失败：', err)
    return jsonResponse({ msg: '登录校验失败，请稍后重试' }, 502)
  }

  let body: { messages?: unknown }
  try {
    body = (await request.json()) as { messages?: unknown }
  } catch {
    return jsonResponse({ msg: '请求体不是合法的 JSON' }, 400)
  }

  // 只转发 messages，模型参数统一由服务端决定，避免前端乱传
  if (!Array.isArray(body.messages)) {
    return jsonResponse({ msg: 'messages 必须是数组' }, 400)
  }

  const baseUrl = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // 用户要求使用 flash 模型；具体模型名可以在 .env 里改
        model: env.DEEPSEEK_MODEL || 'deepseek-flash',
        messages: body.messages,
        stream: true,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      console.error('DeepSeek 接口返回错误：', upstream.status, detail)
      // 把上游错误摘要带回去，方便聊天区直接展示
      return jsonResponse({ msg: `DeepSeek 返回异常（${upstream.status}）：${detail.slice(0, 200)}` }, 502)
    }

    // 直接把 SSE 流转发给浏览器，实现「边生成边显示」
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    })
  } catch (err) {
    console.error('DeepSeek 接口请求失败：', err)
    return jsonResponse({ msg: '请求 AI 服务异常，请稍后重试' }, 502)
  }
}

export default function handler(request: Request): Promise<Response> {
  // Vercel Edge Runtime 要求直接写 process.env.XXX，不能整体传递 process.env
  return handleDeepSeek(request, {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    // Supabase 的 URL / anon key 本来就是前端公开配置，这里复用来校验登录态
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  })
}
