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

/** 天气请求状态 */
export type WeatherStatus = 'loading' | 'success' | 'error'
