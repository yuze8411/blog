<template>
  <div
    ref="chartRef"
    class="h-full w-full"
    role="img"
    :aria-label="ariaLabel"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'

/* 只注册用得到的模块，避免把整个 echarts 打进包里 */
echarts.use([
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  MarkPointComponent,
  CanvasRenderer,
])

const props = withDefaults(
  defineProps<{
    /** 完整的 ECharts option，由父组件根据主题算好传进来 */
    option: EChartsCoreOption
    /** 给读屏软件的一句话描述 */
    ariaLabel?: string
  }>(),
  { ariaLabel: '数据统计图表' },
)

const emit = defineEmits<{
  /** 点击某个数据点时抛出它的 name（分类名或月份） */
  select: [name: string]
  /** 悬停 / 离开某个数据点，用来让页面其它部分跟着联动 */
  hover: [name: string | null]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: EChartsType | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const el = chartRef.value
  if (!el) return

  chart = echarts.init(el, undefined, { renderer: 'canvas' })
  chart.setOption(props.option)

  chart.on('click', (params) => {
    if (typeof params.name === 'string' && params.name) emit('select', params.name)
  })

  chart.on('mouseover', (params) => {
    if (typeof params.name === 'string' && params.name) emit('hover', params.name)
  })

  // 折线图隐藏了数据点，只靠 mouseover 不一定能拿到月份；
  // updateAxisPointer 会在坐标轴指示器移动时给出当前 x 轴的值，更稳。
  chart.on('updateAxisPointer', (event) => {
    const info = (event as { axesInfo?: { value?: unknown }[] }).axesInfo?.[0]
    const value = info?.value
    if (typeof value === 'string' || typeof value === 'number') emit('hover', String(value))
  })

  // globalout 只在指针真正离开整张图时触发，比 mouseout 稳定，不会在扇区之间闪烁
  chart.on('globalout', () => emit('hover', null))

  // 父容器宽度会随栅格和侧边栏变化，用 ResizeObserver 比监听 window.resize 更准
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(el)
})

// 主题切换或数据变化时整体替换 option，避免旧颜色残留在 canvas 上
watch(
  () => props.option,
  (next) => chart?.setOption(next, true),
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>
