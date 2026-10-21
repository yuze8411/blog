<template>
  <div
    id="article-content"
    class="w-full md:w-[90%] lg:w-[74%] xl:w-[79%] mx-auto transition-width group px-2"
  >
    <div class="w-full overflow-auto">
      <div
        class="text-gray-900 dark:text-gray-200 font-[huoxie] text-[26px] max-w-full line-clamp-2 mt-2"
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
      <div class="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mt-[6px]"></div>
      <div class="article-prose w-full mt-6 pt-5" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ArticleDetailProps } from '@/types'
import { md } from '@/utils/markdown'

const props = defineProps<ArticleDetailProps>()

let htmlContent = ref('')

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

onMounted(() => {
  htmlContent.value = md.render(props.virtureData.content)
  console.log(htmlContent.value)
})
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

:global(.dark) .article-prose {
  --prose-text: #cbd5e1;
  --prose-heading: #f1f5f9;
  --prose-muted: #94a3b8;
  --prose-accent: #7dd3fc;
  --prose-accent-2: #38bdf8;
  --prose-accent-soft: rgba(56, 189, 248, 0.07);
  --prose-zebra: rgba(148, 163, 184, 0.04);
  --prose-border: #334155;
  --prose-inline-bg: rgba(51, 65, 85, 0.65);
  --prose-mark: rgba(56, 189, 248, 0.22);
  --prose-selection: rgba(56, 189, 248, 0.25);
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
</style>
