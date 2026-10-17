import axios from 'axios'

/** 和风天气带单位的数值，如 { value: 31.71, unit: '°C' } */
export interface WeatherValue {
  value: number
  unit?: string
}

/** 和风天气 v1 实时天气响应（只声明用到的字段） */
export interface CurrentWeather {
  temperature?: WeatherValue
  feelsLike?: WeatherValue
  condition?: {
    code?: string
    text?: string
  }
  /** 0 ~ 1 的小数，展示时需要乘以 100 */
  humidity?: number
  wind?: {
    direction?: {
      degree?: number
      compass?: string
    }
    speed?: WeatherValue
    /** 蒲福风级，如 3 */
    scale?: number
  }
  windGust?: WeatherValue
  precipitation?: {
    amount?: WeatherValue
    intensity?: WeatherValue
    /** rain / snow / ice / mixed / none / unknown */
    type?: string
  }
  pressure?: WeatherValue
  visibility?: WeatherValue
  dewPoint?: WeatherValue
  cloudCover?: number
  uvIndex?: number
  updateTime?: string
  metadata?: {
    attributions?: Array<{ name?: string; url?: string } | string>
  }
}

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
