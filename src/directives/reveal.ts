import type { Directive } from 'vue'

/**
 * v-reveal：元素进入视口时淡入上浮。
 * 用法：v-reveal 或 v-reveal="120"（120ms 延迟，用于错峰）。
 * 加 .fade 修饰符则只淡入、不位移，适合紧贴其它区块的元素：
 *   v-reveal.fade="80"
 */
const observers = new WeakMap<HTMLElement, IntersectionObserver>()
// 记录用于延迟观察的 rAF，组件提前卸载时要取消，避免对已移除的元素继续观察
const pendingRafs = new WeakMap<HTMLElement, number[]>()

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    // 尊重系统「减少动态效果」设置
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const fadeOnly = Boolean(binding.modifiers.fade)
    el.classList.add(fadeOnly ? 'reveal-fade-init' : 'reveal-init')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add(fadeOnly ? 'reveal-fade-in' : 'reveal-in')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    observers.set(el, observer)

    // 页面顶部的元素（比如封面）挂载时就已经在视口里。
    // 如果立刻 observe，IntersectionObserver 会在浏览器首次绘制前就回调，
    // opacity:0 和 opacity:1 落在同一帧，transition 没有起点，动画看起来“没生效”。
    // 所以等两帧：第一帧让初始隐藏状态真正画出来，第二帧再开始观察。
    const rafs: number[] = []
    rafs.push(
      requestAnimationFrame(() => {
        rafs.push(requestAnimationFrame(() => observer.observe(el)))
      }),
    )
    pendingRafs.set(el, rafs)
  },
  unmounted(el) {
    for (const id of pendingRafs.get(el) ?? []) cancelAnimationFrame(id)
    pendingRafs.delete(el)
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
