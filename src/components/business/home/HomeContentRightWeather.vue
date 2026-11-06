<template>
  <div
    class="relative mt-3 min-h-[300px] overflow-hidden rounded-[10px] border border-gray-200/80 bg-white bg-gradient-to-br p-5 pb-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700/60 dark:bg-gray-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
    :class="weatherTheme"
  >
    <div class="relative z-10 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <span class="text-[16px] font-[huoxie] text-gray-700 dark:text-gray-300">实时天气</span>

        <!-- 经纬度直接用浏览器定位结果，不做逆地理编码，简单且不额外请求 -->
        <p
          v-if="coordsText"
          class="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"
        >
          <IconFont
            name="diqiu"
            class="shrink-0 text-[12px] text-sky-500/80 dark:text-sky-300/70"
          ></IconFont>
          <span class="truncate">当前位置 {{ coordsText }}</span>
        </p>
      </div>

      <span
        v-if="updateTimeText"
        class="flex shrink-0 items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
      >
        <IconFont name="shijian" class="text-[11px]"></IconFont>
        {{ updateTimeText }} 更新
      </span>
    </div>

    <!-- 加载中 / 出错 -->
    <div
      v-if="status !== 'success'"
      class="relative z-10 flex h-[220px] flex-col items-center justify-center gap-3"
    >
      <template v-if="status === 'loading'">
        <span
          class="h-6 w-6 animate-spin rounded-full border-2 border-sky-300 border-t-transparent"
        ></span>
        <span class="text-[14px] font-[huoxie] text-gray-500 dark:text-gray-400">
          正在定位并获取天气…
        </span>
      </template>
      <template v-else>
        <span class="text-[14px] font-[huoxie] text-gray-500 dark:text-gray-400">
          {{ errorMessage }}
        </span>
        <button
          type="button"
          class="text-[13px] text-sky-500 duration-300 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
          @click="getPositionAndWeather"
        >
          重新获取
        </button>
      </template>
    </div>

    <!-- 天气内容 -->
    <template v-else>
      <div class="relative z-10 mt-4 flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-start gap-2">
          <span class="text-[50px] leading-none font-[huoxie] text-gray-800 dark:text-gray-100">
            {{ temperatureText }}
          </span>

          <div class="pt-1">
            <p class="text-[18px] leading-tight font-[huoxie] text-gray-700 dark:text-gray-200">
              {{ conditionText }}
            </p>
            <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              体感 {{ feelsLikeText }}
            </p>
          </div>
        </div>

        <span
          class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/70 bg-white/50 text-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:bg-white/[0.06]"
          aria-hidden="true"
        >
          {{ weatherEmoji }}
        </span>
      </div>

      <div class="relative z-10 mt-4 border-t border-white/70 dark:border-white/10"></div>

      <!-- 天气指标：两列小卡片，比原来纯文字两栏更清楚 -->
      <div class="relative z-10 mt-3 grid grid-cols-2 gap-2">
        <div
          v-for="metric in weatherMetrics"
          :key="metric.label"
          class="min-w-0 rounded-xl border border-white/70 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <p class="text-[10.5px] text-gray-400 dark:text-gray-500">{{ metric.label }}</p>
          <p
            class="mt-0.5 truncate text-[13px] font-[huoxie] text-gray-700 dark:text-gray-200"
            :title="metric.value"
          >
            {{ metric.value }}
          </p>
        </div>
      </div>

      <!-- 外出建议 -->
      <div
        class="relative z-10 mt-3 rounded-xl border border-white/70 bg-white/50 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]"
      >
        <p
          class="flex items-center gap-1.5 text-[10.5px] tracking-[0.12em] text-sky-600/80 dark:text-sky-300/80"
        >
          <IconFont name="a-232_linggan" class="text-[12px]"></IconFont>
          外出建议
        </p>
        <p
          class="mt-1.5 text-[12.5px] leading-relaxed font-[huoxie] text-gray-600 dark:text-gray-300"
        >
          {{ outingAdvice }}
        </p>
      </div>

      <a
        :href="attributionUrl"
        target="_blank"
        rel="noreferrer"
        class="relative z-10 mt-2 block text-right text-[10px] text-gray-400/80 transition-colors duration-300 hover:text-sky-500 dark:text-gray-500 dark:hover:text-sky-300"
      >
        数据来自和风天气
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCurrentWeather } from '@/api/weather'
import type { CurrentWeather, WeatherStatus, WeatherValue } from '@/types'

const status = ref<WeatherStatus>('loading')
const weather = ref<CurrentWeather>()
const errorMessage = ref('')
/** 浏览器定位得到的经纬度，只做展示，不额外请求逆地理编码 */
const coordsText = ref('')

const COMPASS_TEXT = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
const PRECIPITATION_TEXT: Record<string, string> = {
  rain: '雨',
  snow: '雪',
  ice: '冰',
  mixed: '雨夹雪',
}

/**
 * 天气背景色：全部使用很淡的渐变色，
 * 晴、云、雨、雪、雾、雷暴和夜间各有一套轻微不同的色调。
 */
const WEATHER_THEMES = {
  sunny:
    'from-amber-50 via-orange-50/80 to-white dark:from-amber-950/20 dark:via-gray-900 dark:to-gray-900',
  cloudy:
    'from-slate-50 via-sky-50/80 to-white dark:from-slate-800/30 dark:via-gray-900 dark:to-gray-900',
  rain: 'from-sky-50 via-cyan-50/80 to-white dark:from-sky-950/30 dark:via-gray-900 dark:to-gray-900',
  snow: 'from-sky-50 via-indigo-50/80 to-white dark:from-indigo-950/25 dark:via-gray-900 dark:to-gray-900',
  fog: 'from-slate-50 via-gray-50/80 to-white dark:from-slate-800/25 dark:via-gray-900 dark:to-gray-900',
  storm:
    'from-violet-50 via-indigo-50/80 to-white dark:from-violet-950/25 dark:via-gray-900 dark:to-gray-900',
  night:
    'from-indigo-50 via-slate-50/80 to-white dark:from-indigo-950/30 dark:via-gray-900 dark:to-gray-900',
  default: 'from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900',
} as const

type WeatherTone = keyof typeof WEATHER_THEMES

const weatherTone = computed<WeatherTone>(() => {
  const code = Number(weather.value?.condition?.code)
  if (!Number.isFinite(code)) return 'default'
  if (code >= 200 && code < 300) return 'storm'
  if (code >= 300 && code < 400) return 'rain'
  if (code >= 400 && code < 500) return 'snow'
  if (code >= 500 && code < 600) return 'fog'
  if (code >= 150 && code <= 153) return 'night'
  if (code === 100) return 'sunny'
  if (code >= 101 && code <= 104) return 'cloudy'
  return 'default'
})

const weatherTheme = computed(() => WEATHER_THEMES[weatherTone.value])

const conditionText = computed(() => weather.value?.condition?.text ?? '--')

function valueText(value: WeatherValue | undefined): string {
  if (typeof value?.value !== 'number') return '--'
  return `${Math.round(value.value)}${value.unit ?? ''}`
}

const temperatureText = computed(() => valueText(weather.value?.temperature))
const feelsLikeText = computed(() => valueText(weather.value?.feelsLike))

const humidityText = computed(() => {
  const humidity = weather.value?.humidity
  if (typeof humidity !== 'number') return '--'
  const percent = humidity <= 1 ? humidity * 100 : humidity
  return `${Math.round(percent)}%`
})

const windText = computed(() => {
  const wind = weather.value?.wind
  const degree = wind?.direction?.degree
  const direction =
    typeof degree === 'number' ? (COMPASS_TEXT[Math.round(degree / 45) % 8] ?? '') : ''

  if (typeof wind?.scale === 'number') return `${direction} ${wind.scale}级`.trim()
  if (typeof wind?.speed?.value === 'number') {
    return `${direction} ${wind.speed.value.toFixed(1)}${wind.speed.unit ?? 'm/s'}`.trim()
  }
  return '--'
})

const precipitationText = computed(() => {
  const precipitation = weather.value?.precipitation
  const type = precipitation?.type
  if (!type || type === 'none' || type === 'unknown') return '无'

  const typeText = PRECIPITATION_TEXT[type] ?? ''
  const amount = precipitation?.amount?.value
  const amountText =
    typeof amount === 'number' ? `${amount.toFixed(1)}${precipitation?.amount?.unit ?? 'mm'}` : ''

  return [typeText, amountText].filter(Boolean).join(' ') || '有降水'
})

const visibilityText = computed(() => {
  const value = weather.value?.visibility?.value
  if (typeof value !== 'number') return '--'
  return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${Math.round(value)}m`
})

const pressureText = computed(() => valueText(weather.value?.pressure))

const uvText = computed(() => {
  const uv = weather.value?.uvIndex
  if (typeof uv !== 'number') return '--'
  const level = uv <= 2 ? '弱' : uv <= 5 ? '中等' : uv <= 7 ? '强' : uv <= 10 ? '很强' : '极强'
  return `${Math.round(uv)} ${level}`
})

const weatherMetrics = computed(() => [
  { label: '湿度', value: humidityText.value },
  { label: '风力', value: windText.value },
  { label: '降水', value: precipitationText.value },
  { label: '能见度', value: visibilityText.value },
  { label: '气压', value: pressureText.value },
  { label: '紫外线', value: uvText.value },
])

const updateTimeText = computed(() => {
  const raw = weather.value?.updateTime
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

const attributionUrl = computed(() => {
  const first = weather.value?.metadata?.attributions?.[0]
  if (typeof first === 'string') return first
  if (first?.url) return first.url
  return 'https://www.qweather.com'
})

const weatherEmoji = computed(() => {
  const code = Number(weather.value?.condition?.code)
  if (!Number.isFinite(code)) return '🌤️'
  if (code >= 200 && code < 300) return '🌬️'
  if (code >= 300 && code < 400) return '🌧️'
  if (code >= 400 && code < 500) return '❄️'
  if (code >= 500 && code < 600) return '🌫️'
  if (code >= 150 && code <= 153) return '🌙'
  if (code === 100) return '☀️'
  if (code === 104) return '☁️'
  return '🌤️'
})

/** 综合气温、体感、风速、降水给出外出建议 */
const outingAdvice = computed(() => {
  const current = weather.value
  if (!current) return ''

  const tips: string[] = []
  const precipType = current.precipitation?.type ?? 'none'
  const precipAmount = current.precipitation?.amount?.value ?? 0
  const feelsLike = current.feelsLike?.value ?? current.temperature?.value
  const windScale = current.wind?.scale ?? 0
  const visibility = current.visibility?.value
  const uv = current.uvIndex ?? 0

  // 降水
  if (precipType === 'snow' || precipType === 'ice') {
    tips.push('有降雪或结冰，路面湿滑，注意保暖防滑')
  } else if (precipType === 'rain' || precipType === 'mixed') {
    tips.push(precipAmount >= 10 ? '雨势较大，尽量减少外出并带好雨具' : '有降雨，出门记得带伞')
  }

  // 体感温度
  if (typeof feelsLike === 'number') {
    if (feelsLike <= 0) tips.push('体感寒冷，穿厚外套并做好保暖')
    else if (feelsLike < 10) tips.push('体感偏冷，建议穿厚外套')
    else if (feelsLike < 18) tips.push('体感微凉，加件薄外套即可')
    else if (feelsLike < 26) tips.push('体感舒适，适合外出活动')
    else if (feelsLike < 32) tips.push('体感偏热，注意补水防晒')
    else tips.push('体感炎热，尽量避开午后高温时段')
  }

  // 风力 / 能见度 / 紫外线
  if (windScale >= 6) tips.push('风力较大，外出注意防风')
  else if (windScale >= 4) tips.push('有一定风力，留意高空坠物')

  if (typeof visibility === 'number' && visibility < 1000) {
    tips.push('能见度较低，出行注意交通安全')
  } else if (uv >= 6) {
    tips.push('紫外线较强，做好防晒')
  }

  if (!tips.length) tips.push('天气平稳，适合外出')
  return `${tips.slice(0, 3).join('；')}。`
})

/** 把浏览器返回的十进制度数变成更好读的经纬度文本 */
function formatCoords(lat: number, lon: number): string {
  const latDirection = lat >= 0 ? 'N' : 'S'
  const lonDirection = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${latDirection} · ${Math.abs(lon).toFixed(2)}°${lonDirection}`
}

function getPositionAndWeather() {
  status.value = 'loading'
  errorMessage.value = ''
  coordsText.value = ''

  if (!navigator.geolocation) {
    status.value = 'error'
    errorMessage.value = '当前浏览器不支持定位'
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      coordsText.value = formatCoords(latitude, longitude)

      try {
        weather.value = await getCurrentWeather(latitude, longitude)
        status.value = 'success'
      } catch (err) {
        console.error('天气获取失败：', err)
        status.value = 'error'
        errorMessage.value = '天气获取失败，请稍后再试'
      }
    },
    (err) => {
      console.warn('定位失败：', err.code, err.message)
      status.value = 'error'
      errorMessage.value =
        err.code === 1 // PERMISSION_DENIED
          ? '定位权限被拒绝，无法获取天气'
          : '定位失败，无法获取天气'
    },
    {
      enableHighAccuracy: false, // 高精度定位更慢更耗电，查天气没必要
      timeout: 10000, // 超时时间 10s
      maximumAge: 10 * 60 * 1000, // 复用 10 分钟内的定位结果
    },
  )
}

onMounted(() => {
  getPositionAndWeather()
})
</script>

<style scoped></style>
