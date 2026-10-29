/** 旅游相册里的一张照片 */
export interface TravelImage {
  img_id: string
  img_url: string
  /** 照片介绍，悬停时展示 */
  img_introduction: string
  img_tags: string[]
  /** 拍摄时间，例如 2025-06-06 */
  img_time: string
}
