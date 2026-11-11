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
      <div class="article-prose w-full mt-6 pt-5" v-html="htmlContent"></div>
    </div>
    <Comment></Comment>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { ArticleDetailProps } from '@/types'
import { md, renderMarkdown } from '@/utils/markdown'

const props = defineProps<ArticleDetailProps>()

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
  --prose-text: #4b5563;
  --prose-heading: #1f2937;
  --prose-muted: #6b7280;
  --prose-accent: #2f4a77;
  --prose-accent-2: #8ecbff;
  --prose-accent-soft: rgba(47, 74, 119, 0.06);
  --prose-zebra: rgba(47, 74, 119, 0.03);
  --prose-border: #e5e7eb;
  --prose-inline-bg: #f4f6f8;
  --prose-mark: rgba(142, 203, 255, 0.35);
  --prose-selection: rgba(47, 74, 119, 0.16);

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
  --prose-accent-soft: rgba(95, 166, 221, 0.1);
  --prose-zebra: rgba(148, 163, 184, 0.035);
  --prose-border: #243247;
  --prose-inline-bg: rgba(95, 166, 221, 0.1);
  --prose-mark: rgba(142, 203, 255, 0.2);
  --prose-selection: rgba(95, 166, 221, 0.3);
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
  margin: 2.2rem 0 1.1rem;
  padding-bottom: 0.7rem;
  font-size: 30px;
}

.article-prose :deep(h1)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--prose-accent), var(--prose-border) 30%, transparent 90%);
  opacity: 0.55;
}

.article-prose :deep(h2) {
  position: relative;
  margin: 2.2rem 0 1rem;
  padding-left: 1rem;
  font-size: 24px;
}

.article-prose :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2em;
  bottom: 0.2em;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--prose-accent), var(--prose-accent-2));
}

.article-prose :deep(h3) {
  position: relative;
  margin: 1.7rem 0 0.75rem;
  padding-left: 0.95rem;
  font-size: 20px;
}

.article-prose :deep(h3)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--prose-accent);
  opacity: 0.7;
  transform: rotate(45deg);
}

.article-prose :deep(h4) {
  margin: 1.4rem 0 0.6rem;
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

/* ---------- 链接：悬停时下划线从左往右展开 ---------- */
.article-prose :deep(a) {
  color: var(--prose-accent);
  text-decoration: none;
  padding-bottom: 1px;
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0 1px;
  transition:
    background-size 0.25s ease,
    color 0.2s ease;
}

.article-prose :deep(a:hover) {
  background-size: 100% 1px;
}

/* ---------- 引用 ---------- */
.article-prose :deep(blockquote) {
  position: relative;
  margin: 1.5rem 0;
  padding: 1rem 1.15rem 1rem 2.7rem;
  border-left: 3px solid var(--prose-accent);
  border-radius: 0 12px 12px 0;
  background: linear-gradient(135deg, var(--prose-accent-soft), transparent 80%);
  color: var(--prose-muted);
}

.article-prose :deep(blockquote)::before {
  content: '“';
  position: absolute;
  left: 0.65rem;
  top: 0.15rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.2rem;
  line-height: 1.2;
  color: var(--prose-accent);
  opacity: 0.22;
}

.article-prose :deep(blockquote p) {
  margin: 0.25rem 0;
}

/* ---------- 表格 ---------- */
.article-prose :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid var(--prose-border);
  border-radius: 10px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.article-prose :deep(th),
.article-prose :deep(td) {
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid var(--prose-border);
  text-align: left;
}

.article-prose :deep(th) {
  font-weight: 600;
  color: var(--prose-heading);
  white-space: nowrap;
  background: var(--prose-accent-soft);
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
  border-radius: 12px;
  box-shadow: 0 12px 32px -20px rgba(15, 35, 65, 0.5);
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
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px var(--prose-border);
  background: var(--prose-inline-bg);
  color: var(--prose-accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}

.article-prose :deep(pre) {
  margin: 1rem 0;
}

/* 代码块基础外观，语法配色由 Shiki 输出的行内样式负责 */
.article-prose :deep(pre.shiki) {
  padding: 1rem 1.1rem;
  border: 1px solid var(--prose-border);
  border-radius: 10px;
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
.dark .article-prose :deep(:not(pre) > code) {
  box-shadow: inset 0 0 0 1px rgba(142, 203, 255, 0.16);
}

.dark .article-prose :deep(blockquote) {
  border-left-color: #5fa6dd;
}

.dark .article-prose :deep(li::marker) {
  color: var(--prose-accent-2);
}

.dark .article-prose :deep(table) {
  background: rgba(7, 12, 21, 0.45);
}

.dark .article-prose :deep(img) {
  box-shadow:
    0 18px 42px -26px rgba(0, 0, 0, 0.95),
    0 0 0 1px rgba(148, 163, 184, 0.12);
}

/* 代码块换成偏蓝的深色底，避免和页面纯黑脱节 */
.dark .article-prose :deep(pre.shiki) {
  --shiki-dark-bg: #0d1524 !important;

  border-color: #243247;
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
</style>
