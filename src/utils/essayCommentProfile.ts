import { reactive } from 'vue'

/**
 * 随笔评论的游客身份。
 * 随笔页可能同时展开多张卡片的评论区，把昵称 / 邮箱放在模块级，
 * 用户只需填写一次，打开下一张卡片时会自动带过去。
 * 只在当前页面生命周期内有效，不写入本地存储。
 */
export const essayCommentGuestProfile = reactive({
  nickname: '',
  email: '',
})
