import { supabase } from '@/api/supabase'

/**
 * 前台留言墙接口。
 * 读取走 messages_public 视图，只拿已通过的留言；
 * 写入直接操作 messages 表，游客和博主的留言都会先进入待审核。
 */

export interface PublicMessageRow {
  id: string
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  created_at: string
  /** 是否博主本人发布（视图不暴露 user_id） */
  is_owner: boolean
}

export type MessageFilter = 'all' | 'owner' | 'guest'

export interface MessageQuery {
  /** 全部 / 只看博主 / 只看访客 */
  filter: MessageFilter
  page: number
}

export interface MessageListResult {
  list: PublicMessageRow[]
  total: number
  pageSize: number
}

const PAGE_SIZE = 12
const MESSAGE_FIELDS = 'id, nickname, avatar_url, website_url, content, created_at, is_owner'

/** 留言墙列表：按时间倒序，一次取一页，换成「加载更多」时不会一次拉太多 */
export async function fetchMessages(params: MessageQuery): Promise<MessageListResult> {
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from('messages_public').select(MESSAGE_FIELDS, { count: 'exact' })

  if (params.filter === 'owner') query = query.eq('is_owner', true)
  if (params.filter === 'guest') query = query.eq('is_owner', false)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error

  return {
    list: (data ?? []) as PublicMessageRow[],
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  }
}

export interface CreateMessageInput {
  nickname: string
  content: string
  /** 展示头像；QQ 邮箱会换算成 QQ 头像地址 */
  avatarUrl?: string | null
  websiteUrl?: string | null
}

/**
 * 发表留言。
 * 和评论不同：博主留言同样需要审核，所以这里不区分状态，
 * 只根据当前会话决定要不要写入 user_id 来保留博主标识。
 */
export async function createMessage(input: CreateMessageInput): Promise<void> {
  const nickname = input.nickname.trim()
  const content = input.content.trim()
  if (!nickname || !content) {
    throw new Error('昵称和留言内容不能为空')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const user = data.session?.user
  const userId = user && user.app_metadata?.role === 'owner' ? user.id : null

  const { error: insertError } = await supabase.from('messages').insert({
    nickname,
    avatar_url: input.avatarUrl ?? null,
    website_url: input.websiteUrl || null,
    content,
    // 游客和博主的留言都先进入待审核
    status: 'pending',
    ...(userId ? { user_id: userId } : {}),
  })

  if (insertError) throw insertError
}

/** 把数据库 / 网络错误翻译成留言墙能直接展示的中文 */
export function messageErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    if (import.meta.env.DEV) {
      return '留言被数据库拦截了：请确认 Supabase 已执行 sql.text 第 11 段留言墙策略，然后刷新重试'
    }
    return '留言没发出去，登录状态可能变了，刷新后再试试'
  }
  if (text.includes('violates check constraint')) {
    if (text.includes('avatar')) return '头像地址无效，换一种邮箱试试'
    if (text.includes('website')) return '链接格式不对，检查一下再发'
    return '昵称、链接或内容的长度不符合要求，检查一下再发'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }
  if (message.includes('昵称和留言内容')) return message

  return '留言发送失败了，请稍后再试'
}
