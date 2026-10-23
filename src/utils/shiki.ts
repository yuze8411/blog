import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import jsx from '@shikijs/langs/jsx'
import tsx from '@shikijs/langs/tsx'
import vue from '@shikijs/langs/vue'
import html from '@shikijs/langs/html'
import css from '@shikijs/langs/css'
import scss from '@shikijs/langs/scss'
import json from '@shikijs/langs/json'
import bash from '@shikijs/langs/bash'
import markdown from '@shikijs/langs/markdown'
import python from '@shikijs/langs/python'
import java from '@shikijs/langs/java'
import sql from '@shikijs/langs/sql'
import yaml from '@shikijs/langs/yaml'
import diff from '@shikijs/langs/diff'
import vitesseLight from '@shikijs/themes/vitesse-light'
import vitesseDark from '@shikijs/themes/vitesse-dark'

export const SHIKI_THEMES = {
  light: 'vitesse-light',
  dark: 'vitesse-dark',
} as const

// 常用语言；后续要支持新语言，在这里补 import 和数组项即可
const SHIKI_LANGS = [
  javascript,
  typescript,
  jsx,
  tsx,
  vue,
  html,
  css,
  scss,
  json,
  bash,
  markdown,
  python,
  java,
  sql,
  yaml,
  diff,
]

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null

/**
 * 这个文件只会在文章正文渲染时被动态 import，
 * 避免把语言包和主题打进首屏 chunk。
 */
export function getHighlighter() {
  // 创建一个高亮器实例
  highlighterPromise ??= createHighlighterCore({
    themes: [vitesseLight, vitesseDark],
    langs: SHIKI_LANGS,
    engine: createOnigurumaEngine(() => import('shiki/wasm').then((module) => module.default)),
  })
  return highlighterPromise
}
