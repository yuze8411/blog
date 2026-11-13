<template>
  <div
    id="article-content"
    class="w-full md:w-[90%] lg:w-[72%] xl:w-[77%] mx-auto transition-width group px-2"
  >
    <div class="w-full overflow-auto">
      <div
        class="text-gray-900 dark:text-[#e8eff8] font-[huoxie] text-[26px] max-w-full line-clamp-2 mt-2"
      >
        {{ virtureData.title }}
      </div>
      <div class="flex mt-2 mb-4 justify-between" title="标签">
        <div class="flex gap-2">
          <IconFont name="biaoqian1" class="text-[23px] mr-[2px] relative top-[2px]"></IconFont>
          <span
            class="font-[huoxie] text-[17px] px-2 rounded-[6px]"
            :class="tagColorList[index % tagColorList.length]"
            v-for="(item, index) of virtureData.tags"
            :key="index"
            >#{{ item }}</span
          >
        </div>
        <div
          class="cursor-pointer opacity-0 group-hover:opacity-100 duration-300 rounded-full p-1 bg-[rgba(0,183,255,.05)] mr-5"
          title="复制文章/md格式"
          @click="copyContent()"
        >
          <IconFont name="fuzhi"></IconFont>
        </div>
      </div>
      <div class="w-full h-[1px] bg-gray-200 dark:bg-[#243247] mt-[6px]"></div>
      <div class="article-prose w-full" v-html="htmlContent"></div>
    </div>
    <Comment :post-id="virtureData.id" @count-change="emit('countChange', $event)"></Comment>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { ArticleDetailProps } from '@/types'
import { md, renderMarkdown } from '@/utils/markdown'

const props = defineProps<ArticleDetailProps>()

const emit = defineEmits<{
  /** 评论加载 / 发表后同步给详情页顶部 */
  countChange: [count: number]
}>()

let htmlContent = ref('')
// 用户可能在同一页面里切换到另一篇文章，用递增 id 只接收最后一次渲染结果
let renderId = 0

// 标签样式class列表，tailwind 类名
const tagColorList = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
]
async function copyContent() {
  try {
    await navigator.clipboard.writeText(
      props.virtureData.content + `/b雨落千山的博客，请不要随意使用，仅作参考`,
    )
  } catch (err) {
    console.error('复制失败', err)
  }
}

async function renderArticle() {
  const current = ++renderId
  const content = props.virtureData.content || ''

  // 先用普通 markdown 渲染，避免等待 Shiki 初始化时正文一片空白
  htmlContent.value = content ? md.render(content) : ''
  if (!content) return

  try {
    // Shiki 就绪后替换为带高亮的版本
    const html = await renderMarkdown(content)
    if (current === renderId) htmlContent.value = html
  } catch (error) {
    console.error('代码高亮失败，保留普通渲染结果', error)
  }
}

// 从列表进入详情时数据是异步拿到的，正文变化后要重新渲染
watch(() => props.virtureData.content, renderArticle)
onMounted(renderArticle)
</script>

<style scoped>
/* ========== markdown 正文样式 ==========
   颜色统一用变量，方便后续微调；
   代码块（pre / pre code）的配色留给 shiki，这里只保留基础间距。 */
.article-prose {
  /* 用低饱和的雾蓝做点缀，深色只保留在正文文字和链接上，保证可读性 */
  --prose-text: #4a5a6b;
  --prose-heading: #34495e;
  --prose-muted: #7b8b9d;
  --prose-accent: #6ba3c9;
  --prose-accent-2: #b3d9ef;
  --prose-link: #3f719b;
  --prose-link-hover: #2f6288;
  --prose-accent-soft: rgba(139, 192, 226, 0.12);
  --prose-zebra: rgba(139, 192, 226, 0.06);
  --prose-border: #dfeaf4;
  --prose-inline-bg: #eef7fd;
  --prose-mark: rgba(172, 214, 241, 0.5);
  --prose-selection: rgba(142, 203, 255, 0.38);
  --prose-card-shadow: 0 14px 40px -38px rgba(53, 96, 128, 0.45);

  margin-top: 1.5rem;
  padding: 1.65rem 1.9rem 1.9rem;
  border: 1px solid var(--prose-border);
  border-radius: 16px;
  background:
    radial-gradient(90% 60% at 0% 0%, rgba(196, 224, 243, 0.26), transparent 70%),
    linear-gradient(180deg, #f7fbfe, #eff7fd);
  box-shadow:
    var(--prose-card-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.95;
  letter-spacing: 0.01em;
  color: var(--prose-text);
  word-break: break-word;
  overflow-wrap: anywhere;
  text-rendering: optimizeLegibility;
}

.dark .article-prose {
  /* 正文整体压成偏蓝的深色，和站点水墨蓝主题统一 */
  --prose-text: #c3cedd;
  --prose-heading: #e8eff8;
  --prose-muted: #8d9db2;
  --prose-accent: #8ecbff;
  --prose-accent-2: #5fa6dd;
  --prose-link: #9ed2f2;
  --prose-link-hover: #c4e6fb;
  --prose-accent-soft: rgba(95, 166, 221, 0.1);
  --prose-zebra: rgba(148, 163, 184, 0.035);
  --prose-border: #243247;
  --prose-inline-bg: rgba(95, 166, 221, 0.1);
  --prose-mark: rgba(142, 203, 255, 0.2);
  --prose-selection: rgba(95, 166, 221, 0.3);
  --prose-card-shadow: 0 18px 46px -40px rgba(0, 0, 0, 0.85);

  /* 暗色下不再额外铺一层卡片底，避免和页面深色底脱节 */
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

:global(.article-prose ::selection) {
  color: var(--prose-heading);
  background: var(--prose-selection);
}

/* ---------- 标题 ---------- */
.article-prose :deep(h1),
.article-prose :deep(h2),
.article-prose :deep(h3),
.article-prose :deep(h4),
.article-prose :deep(h5),
.article-prose :deep(h6) {
  font-family: 'huoxie', sans-serif;
  font-weight: normal;
  line-height: 1.45;
  letter-spacing: 0.05em;
  color: var(--prose-heading);
  /* 点击目录跳转时，给固定导航栏留出空间 */
  scroll-margin-top: 88px;
}

.article-prose :deep(h1) {
  position: relative;
  margin: 2.2rem 0 1.15rem;
  padding-bottom: 0.75rem;
  font-size: 30px;
}

.article-prose :deep(h1)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--prose-accent-2),
    rgba(179, 217, 239, 0.3) 42%,
    transparent 88%
  );
}

/* h2 用一层很淡的雾蓝渐变做“章节卡片”，不再压深色竖条 */
.article-prose :deep(h2) {
  position: relative;
  margin: 2.25rem 0 1rem;
  padding: 0.5rem 0.95rem 0.5rem 1.05rem;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgba(174, 213, 240, 0.34),
    rgba(174, 213, 240, 0.1) 56%,
    transparent 94%
  );
  font-size: 24px;
}

.article-prose :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0.36rem;
  top: 0.62em;
  bottom: 0.62em;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--prose-accent-2), var(--prose-accent));
}

.article-prose :deep(h3) {
  position: relative;
  margin: 1.75rem 0 0.75rem;
  padding-left: 1rem;
  font-size: 20px;
}

.article-prose :deep(h3)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.58em;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--prose-accent);
  box-shadow: 0 0 0 3px var(--prose-accent-soft);
}

.article-prose :deep(h4) {
  margin: 1.4rem 0 0.6rem;
  padding-left: 0.72rem;
  border-left: 2px solid var(--prose-accent-2);
  font-size: 17px;
}

.article-prose :deep(h5),
.article-prose :deep(h6) {
  margin: 1.2rem 0 0.5rem;
  font-size: 16px;
  color: var(--prose-muted);
}

/* ---------- 段落与强调 ---------- */
.article-prose :deep(p) {
  margin: 1rem 0;
}

.article-prose :deep(strong) {
  font-weight: 600;
  color: var(--prose-heading);
}

.article-prose :deep(em) {
  color: var(--prose-heading);
}

.article-prose :deep(mark) {
  padding: 0 0.15em;
  border-radius: 3px;
  color: inherit;
  background: var(--prose-mark);
}

.article-prose :deep(del) {
  color: var(--prose-muted);
}

/* ---------- 列表 ---------- */
.article-prose :deep(ul),
.article-prose :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.6rem;
}

.article-prose :deep(ul) {
  list-style: disc;
}

.article-prose :deep(ul ul) {
  list-style: circle;
}

.article-prose :deep(ul ul ul) {
  list-style: square;
}

.article-prose :deep(ol) {
  list-style: decimal;
}

.article-prose :deep(li) {
  margin: 0.4rem 0;
  padding-left: 0.15rem;
}

.article-prose :deep(li::marker) {
  color: var(--prose-accent);
}

.article-prose :deep(li > ul),
.article-prose :deep(li > ol) {
  margin: 0.35rem 0 0;
}

/* ---------- 链接：淡蓝小卡片，悬停时轻微提亮 ---------- */
.article-prose :deep(a) {
  margin: 0 0.05em;
  padding: 0.06em 0.36em;
  border: 1px solid rgba(151, 196, 225, 0.45);
  border-radius: 6px;
  background: linear-gradient(180deg, #f9fcff, #eaf5fd);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 3px 9px -8px rgba(46, 87, 118, 0.6);
  color: var(--prose-link);
  text-decoration: none;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.article-prose :deep(a:hover) {
  border-color: rgba(123, 178, 214, 0.72);
  background: #e9f5fd;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 5px 12px -10px rgba(46, 87, 118, 0.78);
  color: var(--prose-link-hover);
}

.article-prose :deep(a strong),
.article-prose :deep(a em) {
  color: inherit;
}

/* 外链在卡片右上角加一个小小的箭头，减少“点出去”的突兀感 */
.article-prose :deep(a[href^='http'])::after {
  content: '↗';
  margin-left: 0.16em;
  font-size: 0.72em;
  opacity: 0.55;
  vertical-align: 0.08em;
}

/* 标题里的链接不套卡片，避免破坏标题的留白 */
.article-prose :deep(h1 a),
.article-prose :deep(h2 a),
.article-prose :deep(h3 a),
.article-prose :deep(h4 a),
.article-prose :deep(h5 a),
.article-prose :deep(h6 a) {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
  color: inherit;
}

.article-prose :deep(h1 a[href^='http'])::after,
.article-prose :deep(h2 a[href^='http'])::after,
.article-prose :deep(h3 a[href^='http'])::after,
.article-prose :deep(h4 a[href^='http'])::after,
.article-prose :deep(h5 a[href^='http'])::after,
.article-prose :deep(h6 a[href^='http'])::after {
  content: none;
}

/* ---------- 引用：浅蓝卡片，左侧留一条淡色书签边 ---------- */
.article-prose :deep(blockquote) {
  position: relative;
  margin: 1.6rem 0;
  padding: 1rem 1.15rem 1rem 2.65rem;
  border: 1px solid var(--prose-border);
  border-left: 3px solid var(--prose-accent-2);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(196, 224, 243, 0.32), rgba(248, 252, 255, 0.6) 72%);
  box-shadow: 0 12px 28px -32px rgba(50, 90, 120, 0.55);
  color: var(--prose-muted);
}

.article-prose :deep(blockquote)::before {
  content: '“';
  position: absolute;
  left: 0.62rem;
  top: 0.12rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.2rem;
  line-height: 1.2;
  color: var(--prose-accent);
  opacity: 0.32;
}

.article-prose :deep(blockquote p) {
  margin: 0.25rem 0;
}

/* ---------- 表格：圆角卡片，表头用很淡的蓝 ---------- */
.article-prose :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid var(--prose-border);
  border-radius: 12px;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 14px 34px -36px rgba(50, 90, 120, 0.5);
  font-size: 14px;
}

.article-prose :deep(th),
.article-prose :deep(td) {
  padding: 0.62rem 0.88rem;
  border-bottom: 1px solid var(--prose-border);
  text-align: left;
}

.article-prose :deep(th) {
  font-weight: 600;
  color: var(--prose-heading);
  white-space: nowrap;
  background: linear-gradient(180deg, #eef8fe, #e8f3fb);
}

.article-prose :deep(th + th),
.article-prose :deep(td + td) {
  border-left: 1px solid var(--prose-border);
}

.article-prose :deep(tbody tr:last-child td) {
  border-bottom: 0;
}

.article-prose :deep(tbody tr:nth-child(even)) {
  background: var(--prose-zebra);
}

/* ---------- 图片与分割线 ---------- */
.article-prose :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.6rem auto;
  padding: 6px;
  border: 1px solid var(--prose-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfdff, #f2f8fd);
  box-shadow: 0 16px 38px -30px rgba(34, 71, 99, 0.55);
}

.article-prose :deep(hr) {
  height: 1px;
  margin: 2.4rem auto;
  border: 0;
  width: 60%;
  background: linear-gradient(90deg, transparent, var(--prose-border), transparent);
}

/* ---------- 行内代码（代码块配色交给 shiki） ---------- */
.article-prose :deep(:not(pre) > code) {
  padding: 0.16rem 0.45rem;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px rgba(151, 196, 225, 0.45);
  background: linear-gradient(180deg, #fbfdff, var(--prose-inline-bg));
  color: var(--prose-link);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}

.article-prose :deep(pre) {
  margin: 1.15rem 0;
}

/* 代码块基础外观，语法配色由 Shiki 输出的行内样式负责 */
.article-prose :deep(pre.shiki) {
  padding: 1rem 1.1rem;
  border: 1px solid var(--prose-border);
  border-radius: 12px;
  background-color: #f8fbfe !important;
  box-shadow: 0 14px 34px -36px rgba(50, 90, 120, 0.55);
  overflow-x: auto;
  font-size: 13.5px;
  line-height: 1.75;
}

.article-prose :deep(pre.shiki code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: inherit;
  background: transparent;
}

/* 暗色模式：把 Shiki 的 light 主题切换到 dark 主题变量 */
.dark .article-prose :deep(.shiki),
.dark .article-prose :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

/* ---------- 暗色模式下的局部细节 ---------- */
.dark .article-prose :deep(h2) {
  background: linear-gradient(
    90deg,
    rgba(95, 166, 221, 0.16),
    rgba(95, 166, 221, 0.04) 56%,
    transparent 94%
  );
}

.dark .article-prose :deep(a) {
  border-color: rgba(142, 203, 255, 0.22);
  background: linear-gradient(180deg, rgba(95, 166, 221, 0.15), rgba(95, 166, 221, 0.08));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.035) inset,
    0 3px 10px -9px rgba(0, 0, 0, 0.9);
}

.dark .article-prose :deep(a:hover) {
  border-color: rgba(142, 203, 255, 0.4);
  background: rgba(95, 166, 221, 0.2);
}

.dark .article-prose :deep(:not(pre) > code) {
  background: linear-gradient(180deg, rgba(95, 166, 221, 0.14), rgba(95, 166, 221, 0.08));
  box-shadow: inset 0 0 0 1px rgba(142, 203, 255, 0.16);
}

.dark .article-prose :deep(blockquote) {
  border-color: var(--prose-border);
  border-left-color: #5fa6dd;
  background: linear-gradient(135deg, rgba(95, 166, 221, 0.12), rgba(15, 25, 40, 0.35) 72%);
  box-shadow: 0 12px 28px -32px rgba(0, 0, 0, 0.9);
}

.dark .article-prose :deep(li::marker) {
  color: var(--prose-accent-2);
}

.dark .article-prose :deep(table) {
  background: rgba(7, 12, 21, 0.45);
}

.dark .article-prose :deep(th) {
  background: linear-gradient(180deg, rgba(95, 166, 221, 0.16), rgba(95, 166, 221, 0.08));
}

.dark .article-prose :deep(img) {
  border-color: #243247;
  background: linear-gradient(180deg, #101b2b, #0c1522);
  box-shadow:
    0 18px 42px -26px rgba(0, 0, 0, 0.95),
    0 0 0 1px rgba(148, 163, 184, 0.12);
}

/* 代码块换成偏蓝的深色底，避免和页面纯黑脱节 */
.dark .article-prose :deep(pre.shiki) {
  --shiki-dark-bg: #0d1524 !important;

  border-color: #243247;
  background-color: #0d1524 !important;
  scrollbar-width: thin;
  scrollbar-color: #2b3a4f transparent;
  box-shadow: inset 0 1px 0 rgba(142, 203, 255, 0.05);
}

.dark .article-prose :deep(pre.shiki::-webkit-scrollbar) {
  height: 6px;
}

.dark .article-prose :deep(pre.shiki::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: #2b3a4f;
}

/* ---------- 小屏：正文卡片收窄留白，标题同步缩小 ---------- */
@media (max-width: 640px) {
  .article-prose {
    margin-top: 1.25rem;
    padding: 1.2rem 1rem 1.4rem;
    border-radius: 14px;
    font-size: 15.5px;
    line-height: 1.9;
  }

  .article-prose :deep(h1) {
    font-size: 26px;
  }

  .article-prose :deep(h2) {
    padding: 0.45rem 0.8rem 0.45rem 0.95rem;
    font-size: 21px;
  }

  .article-prose :deep(h3) {
    font-size: 18.5px;
  }

  .article-prose :deep(h4) {
    font-size: 16.5px;
  }

  .article-prose :deep(blockquote) {
    padding: 0.9rem 1rem 0.9rem 2.25rem;
  }

  .article-prose :deep(table) {
    font-size: 13px;
  }

  .article-prose :deep(a) {
    padding: 0.05em 0.3em;
  }
}
</style>
