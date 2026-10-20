import axios from 'axios'
import type { CurrentWeather } from '@/types'

/**
 * 获取当前位置的实时天气。
 * 浏览器只请求站内 /api/weather，密钥始终保存在服务端。
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const { data } = await axios.get<CurrentWeather>('/api/weather', {
    params: {
      lat: Number(lat.toFixed(2)),
      lon: Number(lon.toFixed(2)),
    },
    timeout: 15000,
  })
  return data
}
