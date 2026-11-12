/** 评论者身份信息 */
export interface CommentUser {
  uname: string
  uemail?: string
  ulink?: string
  /** 当前展示用的头像；QQ 邮箱会换算成 QQ 头像，博主则用自己的头像 */
  avatar?: string
  /** 当前身份是否是博主，回复框据此隐藏昵称 / 邮箱输入 */
  isOwner?: boolean
}

/** 一级评论提交的数据 */
export interface CommentFormPayload extends CommentUser {
  content: string
}

/** 二级评论（回复）提交的数据 */
export interface CommentReplyPayload extends CommentUser {
  parentId: string
  content: string
  /** 被 @ 的昵称 */
  replyTo?: string
  /** 被回复的那条评论 id（一级或二级），用于写入 reply_to_id */
  replyToId?: string
}

/** 二级评论 */
export interface CommentReply {
  id: string
  uname: string
  ulink?: string
  avatar?: string
  time: string
  content: string
  /** 被 @ 的昵称，只在二级评论里使用 */
  replyTo?: string
  isAuthor?: boolean
}

/** 一级评论，replies 里只放二级评论，不会继续嵌套 */
export interface CommentThread {
  id: string
  uname: string
  ulink?: string
  avatar?: string
  time: string
  content: string
  isAuthor?: boolean
  replies: CommentReply[]
}

/** CommentAvatar 组件 props */
export interface CommentAvatarProps {
  name: string
  src?: string
  size?: number
  /** 没有头像时的兜底配色；warm 用于暖色页面，cool 用于白灰为主的页面 */
  tone?: 'default' | 'warm' | 'cool'
}

/** CommentReply 组件 props */
export interface CommentReplyProps {
  reply: CommentReply
}

/** CommentItem 组件 props */
export interface CommentItemProps {
  comment: CommentThread
  profile: CommentUser
}
