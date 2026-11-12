import { supabase } from '@/api/supabase'

/**
 * 前台评论接口。
 * 读取统一走 sql.text 里的 comments_public 视图：
 * 它只暴露已通过的评论，并把 user_id 收敛成 is_owner，不把博主账号 id 带到前台。
 * 写入则直接操作 comments 表，匿名 / 博主两种身份由 RLS 策略约束。
 */

/** comments_public 视图字段 */
export interface PublicCommentRow {
  id: string
  post_id: string
  /** 一级评论为 null，二级评论指向所属的一级评论 */
  root_id: string | null
  /** 具体回复的那条评论，可能是一级也可能是同线程的二级 */
  reply_to_id: string | null
  /** 被回复者的昵称，由视图关联出来 */
  reply_to_nickname: string | null
  nickname: string
  avatar_url: string | null
  website_url: string | null
  content: string
  created_at: string
  /** 是否博主本人发布（视图不暴露 user_id） */
  is_owner: boolean
}

const COMMENT_FIELDS =
  'id, post_id, root_id, reply_to_id, reply_to_nickname, nickname, avatar_url, website_url, content, created_at, is_owner'

/**
 * 某篇文章下的全部已通过评论。
 * 按时间正序取回，前端再分组成“一级评论 + 二级回复”，
 * 这样回复的先后顺序不会因为分页或倒序被打乱。
 */
export async function fetchPostComments(postId: string): Promise<PublicCommentRow[]> {
  const { data, error } = await supabase
    .from('comments_public')
    .select(COMMENT_FIELDS)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as PublicCommentRow[]
}

export interface CreateCommentInput {
  postId: string
  nickname: string
  content: string
  /** 展示头像；QQ 邮箱会换算成 QQ 头像地址 */
  avatarUrl?: string | null
  websiteUrl?: string | null
  /** 二级评论所属的一级评论 id */
  rootId?: string | null
  /** 被回复评论的 id */
  replyToId?: string | null
}

interface CommentAuthor {
  userId: string | null
  status: 'approved' | 'pending'
}

/**
 * 写入前重新读一次当前会话，以数据库真正认的身份为准。
 *
 * 页面里的博主身份是异步读取的，刚进页面就提交时可能还没准备好；
 * 如果这时按游客写 pending，已登录的博主反而会被 RLS 拦住。
 * 这里直接根据 session 判断：博主 -> approved + user_id，游客 -> pending。
 */
async function resolveCommentAuthor(): Promise<CommentAuthor> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const user = data.session?.user
  if (user && user.app_metadata?.role === 'owner') {
    return { userId: user.id, status: 'approved' }
  }
  return { userId: null, status: 'pending' }
}

/**
 * 发表评论 / 回复。
 * 不返回完整行，成功后由页面重新拉一次列表，
 * 这样 is_owner、reply_to_nickname 这些视图计算字段不会出现前后不一致。
 */
export async function createComment(input: CreateCommentInput): Promise<void> {
  const nickname = input.nickname.trim()
  const content = input.content.trim()
  if (!nickname || !content) {
    throw new Error('昵称和评论内容不能为空')
  }

  const author = await resolveCommentAuthor()

  const { error } = await supabase.from('comments').insert({
    post_id: input.postId,
    root_id: input.rootId ?? null,
    reply_to_id: input.replyToId ?? null,
    nickname,
    avatar_url: input.avatarUrl ?? null,
    website_url: input.websiteUrl || null,
    content,
    // 游客评论先进入待审核；博主评论直接展示
    status: author.status,
    // 游客不能伪造 user_id；博主必须写入自己的 uid，RLS 才会放行
    ...(author.userId ? { user_id: author.userId } : {}),
  })

  if (error) throw error
}

/** 把数据库 / 网络错误翻译成评论区能直接展示的中文 */
export function commentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const text = message.toLowerCase()

  if (text.includes('row-level security')) {
    // 开发时最常见的原因是 Supabase 还没执行最新的评论审核策略；
    // 线上不把这种只会让访客困惑的提示暴露出去。
    if (import.meta.env.DEV) {
      return '评论被数据库拦截了：请确认 Supabase 已执行 sql.text 第 9 段评论审核策略，然后刷新重试'
    }
    return '评论没发出去，登录状态或文章状态可能变了，刷新后再试试'
  }
  if (text.includes('violates check constraint')) {
    if (text.includes('avatar')) return '头像地址无效，换一种邮箱试试'
    if (text.includes('website')) return '链接格式不对，检查一下再发'
    return '昵称、链接或内容的长度不符合要求，检查一下再发'
  }
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('timeout')) {
    return '网络不太稳定，稍后再试试'
  }
  if (message.includes('昵称和评论内容')) return message

  return '评论发送失败了，请稍后再试'
}
