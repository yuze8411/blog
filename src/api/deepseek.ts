/**
 * 前端调用 AI 写作的封装。
 * 真正的 DeepSeek 请求在服务端 api/deepseek.ts 里完成，Key 不会出现在前端。
 */

import { supabase } from '@/api/supabase'

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface StreamOptions {
  messages: DeepSeekMessage[]
  signal?: AbortSignal
  /** 每收到一小段文本就回调一次，页面可以把它直接写进编辑区实现流式输出 */
  onDelta: (text: string) => void
}

interface DeepSeekChunk {
  choices?: { delta?: { content?: string } }[]
}

/**
 * 发起流式对话请求。
 * 用法：await streamDeepSeek({ messages, onDelta: (text) => { ... } })
 */
export async function streamDeepSeek({ messages, signal, onDelta }: StreamOptions) {
  // 带上当前登录会话，服务端会校验是不是博主本人，避免接口被随便调用
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    throw new Error('登录状态已失效，请重新登录后再使用 AI 写作')
  }

  const response = await fetch('/api/deepseek', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!response.ok) {
    // 服务端会返回 { msg }，尽量把可读的错误原因带到界面上
    const detail = await response.text()
    let message = detail
    try {
      const parsed = JSON.parse(detail) as { msg?: string }
      if (parsed.msg) message = parsed.msg
    } catch {
      // 不是 JSON 就直接用原文
    }
    throw new Error(message || `AI 服务返回异常（${response.status}）`)
  }
  if (!response.body) {
    throw new Error('当前浏览器不支持读取流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE 一行一条 data:，最后一行可能只收到一半，留到下一轮再拼接
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const text = line.trim()
      if (!text.startsWith('data:')) continue

      const payload = text.slice(5).trim()
      if (!payload || payload === '[DONE]') continue

      try {
        const chunk = JSON.parse(payload) as DeepSeekChunk
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) onDelta(delta)
      } catch {
        // 不完整的 JSON 忽略即可，下一轮会补上
      }
    }
  }
}
