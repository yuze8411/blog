import { handleMessageReview } from '../server/review'

export const config = { runtime: 'edge' }

/**
 * AI 留言审核的 Edge Function 入口。
 * 共享审核逻辑放在 server/review.ts，避免 Edge Function 之间互相 import。
 */
export default function handler(request: Request): Promise<Response> {
  return handleMessageReview(request, {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  })
}
