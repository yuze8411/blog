import type { AuthError, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * 后台登录相关接口统一收口在这里。
 * 页面里只调用 signIn / signOut / getCurrentUser，不再直接碰 supabase.auth，
 * 这样以后换登录方式（比如加验证码、改成 OAuth）只需要改这一个文件。
 */

/** 页面里真正会用到的用户信息：只保留展示需要的字段，避免把整个 Supabase User 到处传 */
export interface AdminUser {
  id: string
  email: string
  /** 展示用昵称：优先取 Supabase 用户元数据里的 name / full_name，没有就用邮箱前缀 */
  name: string
  /** 头像地址，可能为空，页面里自己兜底成默认头像 */
  avatarUrl: string
  /** 角色，博主账号是 owner；路由守卫靠它判断后台权限 */
  role: string
  createdAt: string
  lastSignInAt: string
}

/** 只有 owner 才是博主本人，才允许进入后台 */
export function isOwner(user: AdminUser | null | undefined): boolean {
  return user?.role === 'owner'
}

/** 从元数据里按顺序找一个非空字符串字段 */
function pickString(source: Record<string, unknown> | undefined, keys: string[]): string {
  if (!source) return ''
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/** 把 Supabase 的 User 转成页面好用的 AdminUser */
function toAdminUser(user: User): AdminUser {
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const appMetadata = user.app_metadata as Record<string, unknown> | undefined
  const email = user.email ?? ''
  return {
    id: user.id,
    email,
    name:
      pickString(metadata, ['name', 'full_name', 'display_name', 'nickname']) ||
      email.split('@')[0] ||
      '博主',
    avatarUrl: pickString(metadata, ['avatar_url', 'avatar', 'picture']),
    role: pickString(appMetadata, ['role']),
    createdAt: user.created_at ?? '',
    lastSignInAt: user.last_sign_in_at ?? '',
  }
}

/** Supabase 常见的英文错误，翻译成页面能直接展示的中文 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: '邮箱或密码错误，请重试',
  email_not_confirmed: '邮箱还没有验证，请先完成邮箱验证',
  over_request_rate_limit: '尝试次数过多，请稍后再试',
  user_not_found: '账号不存在',
  weak_password: '密码强度不够，请更换更复杂的密码',
  session_not_found: '登录状态已失效，请重新登录',
}

function translateAuthError(error: AuthError): string {
  // 优先用错误码，稳定且不受 Supabase 文案变化影响
  const byCode = error.code ? AUTH_ERROR_MESSAGES[error.code] : undefined
  if (byCode) return byCode

  // 兜底：没有匹配到错误码时，再按英文关键字猜一下
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials')) return '邮箱或密码错误，请重试'
  if (message.includes('email not confirmed')) return '邮箱还没有验证，请先完成邮箱验证'
  if (message.includes('rate limit') || message.includes('too many'))
    return '尝试次数过多，请稍后再试'

  return error.message || '操作失败，请稍后重试'
}

/**
 * 邮箱 + 密码登录。
 * 成功返回用户信息；失败直接 throw Error，页面用 try/catch 展示中文提示即可。
 */
export async function signIn(email: string, password: string): Promise<AdminUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) throw new Error(translateAuthError(error))
  if (!data.user) throw new Error('登录失败，请稍后重试')

  return toAdminUser(data.user)
}

/** 退出登录：清掉本地会话和 Supabase 服务端的 refresh token */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(translateAuthError(error))
}

/**
 * 获取当前登录用户。
 * getUser() 会拿本地会话去 Supabase 服务端校验一遍，比直接读本地缓存更可靠，
 * 所以路由守卫和后台顶部栏都通过它拿用户信息。未登录时返回 null。
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return toAdminUser(data.user)
}
