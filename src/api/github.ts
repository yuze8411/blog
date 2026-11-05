import axios from 'axios'
import type { GithubContributionData } from '@/types'

/** 博客对应的 GitHub 用户名，需要换账号时改这里 */
const GITHUB_USERNAME = 'yuze8411'

/**
 * 获取近一年的 GitHub 贡献数据。
 * 浏览器只请求站内 /api/githubcontributions，PAT 始终保存在服务端。
 */
export async function fetchGithubContributions(
  username = GITHUB_USERNAME,
): Promise<GithubContributionData> {
  const { data } = await axios.get<GithubContributionData>('/api/githubcontributions', {
    params: { username },
    timeout: 15000,
  })
  return data
}
