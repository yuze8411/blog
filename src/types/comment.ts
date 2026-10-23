/** 评论者身份信息 */
export interface CommentUser {
  uname: string
  uemail?: string
  ulink?: string
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
