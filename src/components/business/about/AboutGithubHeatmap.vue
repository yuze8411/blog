<template>
  <div class="heatmap" role="group" aria-label="GitHub contribution calendar">
    <template v-if="data">
      <!-- 月份刻度：和下面的格子共用同一套列宽，所以不会错位 -->
      <div class="heatmap-months" :style="{ gridTemplateColumns }" aria-hidden="true">
        <span
          v-for="month in monthLabels"
          :key="`${month.column}-${month.label}`"
          :style="{ gridColumn: month.column + 2 }"
        >
          {{ month.label }}
        </span>
      </div>

      <!-- 主体：左边一列星期标签，右边 53 列对应 53 周 -->
      <div
        class="heatmap-grid"
        :style="{ gridTemplateColumns }"
        role="img"
        aria-label="GitHub contributions over the past year"
      >
        <!-- 星期标签只保留周一、三、五，和 GitHub 原版一样清爽 -->
        <template v-for="(label, index) in WEEKDAY_LABELS" :key="index">
          <span v-if="label" class="heatmap-weekday" :style="{ gridColumn: 1, gridRow: index + 1 }">
            {{ label }}
          </span>
        </template>

        <!-- 每个格子按照“第几周、星期几”落到对应坐标上 -->
        <template v-for="(week, weekIndex) in data.weeks" :key="weekIndex">
          <template v-for="(day, dayIndex) in week.days" :key="`${weekIndex}-${dayIndex}`">
            <span
              v-if="day"
              class="heatmap-cell"
              :class="`level-${day.level}`"
              :style="{ gridColumn: weekIndex + 2, gridRow: dayIndex + 1 }"
              :title="formatDayTitle(day)"
            />
          </template>
        </template>
      </div>

      <!-- 图例放在右下角，延续 GitHub 的阅读习惯 -->
      <div class="heatmap-footer">
        <span class="heatmap-footer-title">Contributions</span>
        <ul class="heatmap-legend" aria-label="Contribution level legend">
          <li v-for="item in LEGEND_ITEMS" :key="item.level">
            <span class="heatmap-legend-cell" :class="`level-${item.level}`" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </template>

    <!-- 数据还没回来或者接口失败时，保留一块浅色面板，避免页面突然塌下去 -->
    <p v-else class="heatmap-status" aria-live="polite">
      {{ errorMessage || '正在加载 GitHub 贡献数据…' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchGithubContributions } from '@/api/github'
import type { GithubContributionData, GithubContributionDay } from '@/types'

const data = ref<GithubContributionData | null>(null)
const errorMessage = ref('')

// 十二个月份的英文缩写，和 GitHub 原版保持一致
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// 一列有七天，只在周一、三、五放文字，避免左侧太挤
const WEEKDAY_LABELS: (string | null)[] = [null, 'Mon', null, 'Wed', null, 'Fri', null]

/**
 * 图例里的数量区间要和 api/githubcontributions.ts 里的 toLevel 分级保持一致。
 * 以后如果改成按分位数分级，两边要一起调整。
 */
const LEGEND_ITEMS = [
  { level: 0, label: '0' },
  { level: 1, label: '1–2' },
  { level: 2, label: '3–5' },
  { level: 3, label: '6–9' },
  { level: 4, label: '10+' },
] as const

onMounted(async () => {
  try {
    data.value = await fetchGithubContributions()
  } catch (error) {
    console.error('[github] 获取贡献数据失败', error)
    errorMessage.value = 'GitHub 贡献数据加载失败，请稍后再试'
  }
})

/**
 * 月份标签只在“某个月第一次出现的那一列”打一次。
 * 比如 3 月 1 日落在星期三，那么包含它的那一周上方就写 Mar，
 * 后面的周不再重复，和 GitHub 原版的月份刻度一致。
 */
const monthLabels = computed(() => {
  const weeks = data.value?.weeks ?? []
  const labels: { label: string; column: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, column) => {
    for (const day of week.days) {
      if (!day) continue

      // 1 月对应索引 0，所以日期里的月份要减一
      const monthIndex = Number(day.date.slice(5, 7)) - 1
      if (monthIndex === lastMonth) continue

      lastMonth = monthIndex
      labels.push({
        label: MONTH_LABELS[monthIndex] ?? '',
        column,
      })
    }
  })

  return labels
})

/**
 * 列模板：第一列留给星期标签，剩下的列平分剩余宽度。
 * 用 minmax(0, 1fr) 是为了窄屏时允许格子缩小，而不是把容器撑破。
 */
const gridTemplateColumns = computed(() => {
  const weekCount = Math.max(1, data.value?.weeks.length ?? 1)
  return `var(--axis) repeat(${weekCount}, minmax(0, 1fr))`
})

/** 原生 title 提示：悬停格子时能看到具体日期和当天贡献数 */
function formatDayTitle(day: GithubContributionDay) {
  const unit = day.count === 1 ? 'contribution' : 'contributions'
  return `${day.date} · ${day.count} ${unit}`
}
</script>

<style scoped>
.heatmap {
  /* 左侧星期标签的固定宽度，以及格子之间的小缝 */
  --axis: 26px;
  --gap: 3px;

  display: flex;
  box-sizing: border-box;
  width: 100%;
  flex-direction: column;
  padding: 14px 16px 12px;
  border: 1px solid rgba(226, 232, 240, 0.12);
  border-radius: 16px;
  color: rgba(203, 213, 225, 0.62);

  /* 一层很浅的冰蓝玻璃底：既托住格子，又不至于抢走星空的氛围 */
  background:
    radial-gradient(110% 140% at 8% 0%, rgba(241, 245, 249, 0.14), transparent 60%),
    linear-gradient(135deg, rgba(226, 232, 240, 0.09), rgba(125, 211, 252, 0.045));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 20px 45px -30px rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(10px);
}

/* 加载中 / 加载失败时的占位，让面板保持一个稳定的高度 */
.heatmap-status {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 8px;
  font-size: 10px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  color: rgba(203, 213, 225, 0.5);
  text-align: center;
}

/* 月份刻度与格子共用 column-gap，保证文字和每一列严丝合缝 */
.heatmap-months,
.heatmap-grid {
  display: grid;
  column-gap: var(--gap);
}

.heatmap-months {
  margin-bottom: 4px;
  font-size: 9px;
  line-height: 1;
  color: rgba(203, 213, 225, 0.58);
}

.heatmap-months span {
  white-space: nowrap;
}

/* 七行分别对应周日到周六，行高由格子自身的宽高比撑开 */
.heatmap-grid {
  grid-template-rows: repeat(7, auto);
  row-gap: var(--gap);
}

.heatmap-weekday {
  align-self: center;
  justify-self: end;
  font-size: 8px;
  line-height: 1;
  color: rgba(203, 213, 225, 0.45);
}

/*
 * 重点：宽度交给网格列分配，高度用 aspect-ratio 跟宽度保持一致。
 * 这样整张图会随着容器宽度缩放，不需要写死 20px 之类的固定尺寸。
 */
.heatmap-cell {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(240, 246, 252, 0.04);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.heatmap-cell:hover {
  position: relative;
  z-index: 2;
  transform: scale(1.18);
  box-shadow: 0 0 9px rgba(125, 211, 252, 0.55);
}

/* 冷蓝色系：从空白到最活跃共五档，和整页的蓝墨色主题保持一致 */
.level-0 {
  background: rgba(148, 163, 184, 0.14);
}

.level-1 {
  background: rgba(56, 189, 248, 0.24);
}

.level-2 {
  background: rgba(56, 189, 248, 0.48);
}

.level-3 {
  background: rgba(34, 211, 238, 0.72);
}

.level-4 {
  background: rgba(165, 243, 252, 0.96);
}

/* 图例：靠右排成一行，像 GitHub 图下方的 Less → More */
.heatmap-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px 10px;
  margin-top: 8px;
  font-size: 9px;
  line-height: 1;
  color: rgba(203, 213, 225, 0.68);
}

.heatmap-footer-title {
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(203, 213, 225, 0.42);
}

.heatmap-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.heatmap-legend li {
  display: flex;
  align-items: center;
  gap: 5px;
}

.heatmap-legend-cell {
  width: 9px;
  height: 9px;
  flex: none;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(240, 246, 252, 0.06);
}

/*
 * 手机上不横向滚动：去掉星期标签、缩小缝隙和内边距，
 * 让 53 列继续按照容器宽度自动缩放，保证完整显示。
 */
@media (max-width: 640px) {
  .heatmap {
    --axis: 0px;
    --gap: 2px;

    padding: 12px;
    border-radius: 13px;
  }

  .heatmap-weekday {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .heatmap-cell {
    transition: none;
  }
}
</style>
