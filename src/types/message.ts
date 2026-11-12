/** 留言墙表单提交的数据 */
export interface MessageFormPayload {
  nickname: string
  content: string
  /** 展示头像；QQ 邮箱会换算成 QQ 头像地址 */
  avatarUrl?: string | null
  websiteUrl?: string | null
}
