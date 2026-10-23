import type { Directive } from 'vue'

/**
 * v-reveal：元素进入视口时淡入上浮。
 * 用法：v-reveal 或 v-reveal="120"（120ms 延迟，用于错峰）。
 * 加 .fade 修饰符则只淡入、不位移，适合紧贴其它区块的元素：
 *   v-reveal.fade="80"
 */
const observers = new WeakMap<HTMLElement, IntersectionObserver>()

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
    observer.observe(el)
  },
  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
