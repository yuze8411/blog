import { handleCommentReview } from '../server/review'

export const config = { runtime: 'edge' }

/**
 * AI 评论审核的 Edge Function 入口。
 */
export default function handler(request: Request): Promise<Response> {
  // Vercel Edge Runtime 要求直接写 process.env.XXX，不能整体传递 process.env
  return handleCommentReview(request, {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  })
}
