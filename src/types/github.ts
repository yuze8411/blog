/** GitHub 热力图里的单日贡献 */
export interface GithubContributionDay {
  /** YYYY-MM-DD */
  date: string
  count: number
  /** 0 无贡献，1-4 由少到多 */
  level: 0 | 1 | 2 | 3 | 4
}

/** 一列（一周）贡献数据；未来日期用 null 占位 */
export interface GithubContributionWeek {
  days: (GithubContributionDay | null)[]
}

/** 组件和请求层共用的贡献数据结构 */
export interface GithubContributionData {
  username: string
  total: number
  longestStreak: number
  currentStreak: number
  startDate: string
  endDate: string
  weeks: GithubContributionWeek[]
}
