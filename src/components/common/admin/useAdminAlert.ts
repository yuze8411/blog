import { reactive } from 'vue'

/**
 * 后台轻提示（toast）。
 *
 * 用法（任意组件里）：
 *   const alert = useAdminAlert()
 *   alert.success('文章添加成功')
 *   alert.error('保存失败，请稍后重试')
 *   alert.warning('标题不能超过 60 个字', { duration: 3500 })
 *   alert.info('已复制链接', { title: '提示', duration: 2000 })
 *
 * 提示会渲染在 <AdminAlert /> 里，所以 AdminAlert 需要在应用根节点挂载一次
 * （已经在 App.vue 中挂载，跨路由跳转也不会消失）。
 */

export type AdminAlertType = 'success' | 'error' | 'warning' | 'info'

export interface AdminAlertOptions {
  /** 标题，不传时只显示一行文字 */
  title?: string
  /** 自动关闭时间（毫秒），传 0 表示常驻，只能手动关闭 */
  duration?: number
}

export interface AdminAlertItem {
  id: number
  type: AdminAlertType
  message: string
  title: string
  duration: number
}

/** 同一时间最多保留几条提示，超出的把最早那条挤掉 */
const MAX_ALERTS = 5

/** 模块级单例：所有组件共享同一份列表 */
const alerts = reactive<AdminAlertItem[]>([])
const timers = new Map<number, number>()
let seed = 0

/** 关闭某条提示，并清掉它的定时器 */
function close(id: number) {
  const timer = timers.get(id)
  if (timer !== undefined) {
    window.clearTimeout(timer)
    timers.delete(id)
  }

  const index = alerts.findIndex((item) => item.id === id)
  if (index !== -1) alerts.splice(index, 1)
}

function push(type: AdminAlertType, message: string, options: AdminAlertOptions = {}) {
  if (alerts.length >= MAX_ALERTS) {
    const oldest = alerts[0]
    if (oldest) close(oldest.id)
  }

  const id = ++seed
  const duration = options.duration ?? 2600

  alerts.push({
    id,
    type,
    message,
    title: options.title ?? '',
    duration,
  })

  if (duration > 0) {
    timers.set(
      id,
      window.setTimeout(() => close(id), duration),
    )
  }

  return id
}

export function useAdminAlert() {
  return {
    /** 当前显示的提示列表，<AdminAlert /> 用它在页面上渲染 */
    alerts,
    /** 手动关闭某条提示 */
    close,
    success: (message: string, options?: AdminAlertOptions) => push('success', message, options),
    error: (message: string, options?: AdminAlertOptions) => push('error', message, options),
    warning: (message: string, options?: AdminAlertOptions) => push('warning', message, options),
    info: (message: string, options?: AdminAlertOptions) => push('info', message, options),
  }
}
