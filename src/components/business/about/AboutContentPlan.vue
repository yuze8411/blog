<template>
  <section
    class="relative flex h-[100vh] w-full items-center overflow-hidden font-[huoxie] text-slate-100"
  >
    <div
      v-reveal
      class="plan-page relative z-10 mx-auto w-full max-w-[1360px] py-3 pl-5 pr-14 sm:py-6 sm:pl-8 sm:pr-20 lg:pl-12 lg:pr-28"
    >
      <!-- 我的未来 -->
      <section aria-labelledby="plan-personal-future">
        <h2 id="plan-personal-future" class="plan-heading mb-2 flex items-center gap-2.5 sm:mb-3">
          <IconFont name="xuexijihua-" class="text-[24px] text-sky-300 sm:text-[28px]"></IconFont>
          我的未来
        </h2>

        <div class="plan-group">
          <div class="plan-row">
            <p class="plan-index">
              <span class="plan-index__num">01</span>
              <span class="plan-index__tag">STUDY</span>
            </p>

            <div class="min-w-0">
              <h3 class="plan-title">学习与就业</h3>
              <ul class="plan-list">
                <li>趁还没毕业，继续深入学习前端内容，不优先拓展宽度，优先增加深度;</li>
                <li>学习ai工具的使用，把ai当作就业的有力竞争力，而不是把ai当作就业的敌人;</li>
                <li>把学过的知识整理成文章和笔记，能讲清楚才算真正掌握；</li>
              </ul>
            </div>
          </div>

          <div class="plan-row">
            <p class="plan-index">
              <span class="plan-index__num">02</span>
              <span class="plan-index__tag">LIFE</span>
            </p>

            <div class="min-w-0">
              <h3 class="plan-title">生活</h3>
              <ul class="plan-list">
                <li>上了20年的学，很少有机会出去看看，未来的话要找机会看看祖国的大好山河！</li>
                <li>
                  培养好的习惯，要节制，不能因为年轻就乱糟蹋身体，现在做的还行，未来继续保持👍
                </li>
                <li>多留一点时间给家人和朋友，也给自己留出发呆和放空的时间；</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 本站的未来 -->
      <section aria-labelledby="plan-site-future" class="mt-5 sm:mt-8">
        <h2 id="plan-site-future" class="plan-heading mb-2 flex items-center gap-2.5 sm:mb-3">
          <IconFont name="WEBSITE" class="text-[24px] text-sky-300 sm:text-[28px]"></IconFont>
          本站的未来
        </h2>

        <div class="plan-group">
          <div class="plan-row">
            <p class="plan-index">
              <span class="plan-index__num">01</span>
              <span class="plan-index__tag">WEBPLAN</span>
            </p>

            <div class="min-w-0">
              <h3 class="plan-title">功能补充</h3>
              <ul class="plan-list">
                <li>未来将持续添加新的功能，优化现有功能，使之成为一个可靠的网站</li>
                <li>同时对于现有样式也将不断迭代升级，致力于打造年轻化、轻量化的博客网站</li>
                <li>逐步完善评论、留言等互动功能，让写作、阅读和交流都更顺手；</li>
              </ul>
            </div>
          </div>

          <div class="plan-row">
            <p class="plan-index">
              <span class="plan-index__num">02</span>
              <span class="plan-index__tag">CAPACITY</span>
            </p>

            <div class="min-w-0">
              <h3 class="plan-title">性能优化</h3>
              <ul class="plan-list">
                <li>逐渐优化本站的性能，最求更快更稳更好！</li>
                <li>继续关注图片、字体和首屏加载，在视觉效果和速度之间找到平衡。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { vReveal } from '@/directives/reveal'

// 第三页滚进视口时整体淡入，保留原来的通栏结构，不再拆成卡片。
</script>

<style scoped>
.plan-page {
  text-shadow: 0 1px 16px rgba(2, 6, 23, 0.5);
}

/* 标题：图标 + 标题 + 一条渐渐消失的冷光横线 */
.plan-heading {
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: 0.03em;
  color: #fff;
}

/* 一组计划的底边，和每一行的顶边一起，组成原来的上下边框 */
.plan-group {
  border-bottom: 1px solid rgba(186, 230, 253, 0.18);
}

.plan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.2rem;
  padding: 0.55rem 0;
  border-top: 1px solid rgba(186, 230, 253, 0.18);
}

/* 手机端编号放在标题上方，桌面端再回到左侧独立的编号栏 */
.plan-index {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.plan-index__num {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1;
  color: #4f9dff;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
}

.plan-index__tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 8px;
  line-height: 1;
  letter-spacing: 0.18em;
  color: rgba(125, 211, 252, 0.55);
}

.plan-title {
  font-size: 19px;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: rgb(236, 241, 255);
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-top: 0.3rem;
}

.plan-list li {
  position: relative;
  padding-left: 0.85rem;
  font-size: 0.75rem;
  line-height: 1.55;
  color: rgba(236, 241, 255, 0.74);
}

/* 原来重复写了很多遍的圆点，现在统一收在这里 */
.plan-list li::before {
  content: '';
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.8);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.45);
}

@media (min-width: 640px) {
  .plan-heading {
    font-size: 30px;
  }

  .plan-row {
    grid-template-columns: 100px minmax(0, 1fr);
    gap: 1.25rem;
    padding: 0.9rem 0;
  }

  .plan-index {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding-top: 2px;
  }

  .plan-index__num {
    font-size: 16px;
  }

  .plan-index__tag {
    font-size: 9.5px;
  }

  .plan-title {
    font-size: 22px;
  }

  .plan-list {
    gap: 0.2rem;
    margin-top: 0.45rem;
  }

  .plan-list li {
    font-size: 0.84375rem;
    line-height: 1.7;
  }
}

@media (min-width: 1024px) {
  .plan-row {
    grid-template-columns: 180px minmax(0, 1fr);
    gap: 2.5rem;
    padding: 0.95rem 0;
  }

  /* 大屏恢复原来「01 STUDY」同一行的编号样式 */
  .plan-index {
    flex-direction: row;
    align-items: baseline;
    gap: 0.6rem;
    padding-top: 0;
  }

  .plan-index__num {
    font-size: 17px;
  }

  .plan-index__tag {
    font-size: 10px;
  }

  .plan-title {
    font-size: 24px;
  }

  .plan-list li {
    font-size: 0.875rem;
    line-height: 1.68;
  }
}

/* 矮屏手机：收紧行距，尽量维持一屏显示 */
@media (max-width: 639px) and (max-height: 820px) {
  .plan-heading {
    font-size: 22px;
  }

  .plan-row {
    padding: 0.4rem 0;
  }

  .plan-index__num {
    font-size: 12px;
  }

  .plan-index__tag {
    font-size: 7.5px;
  }

  .plan-title {
    font-size: 17.5px;
  }

  .plan-list {
    gap: 0.05rem;
    margin-top: 0.2rem;
  }

  .plan-list li {
    font-size: 0.6875rem;
    line-height: 1.5;
  }
}

/* 小平板横向时也别让内容顶出屏幕 */
@media (min-width: 640px) and (max-width: 1023px) and (max-height: 820px) {
  .plan-row {
    padding: 0.6rem 0;
  }

  .plan-title {
    font-size: 20px;
  }

  .plan-list {
    margin-top: 0.3rem;
  }

  .plan-list li {
    font-size: 0.78125rem;
    line-height: 1.55;
  }
}

/* 桌面矮屏：减少上下留白，保证两块计划都能完整露出 */
@media (min-width: 1024px) and (max-height: 760px) {
  .plan-row {
    padding: 0.75rem 0;
  }

  .plan-title {
    font-size: 22px;
  }

  .plan-list li {
    font-size: 0.84375rem;
    line-height: 1.6;
  }
}
</style>
