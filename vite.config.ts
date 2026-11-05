import { fileURLToPath, URL } from 'node:url'
import type { Connect, Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { handleWeather } from './api/weather.ts'
import { handleGithubContributions } from './api/githubcontributions.ts'

/** 这些响应头由 Node 的 http 模块自己管理，转发时要去掉 */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
])

/**
 * 本地开发时模拟 Vercel 的 /api 函数。
 * 每个接口都复用线上 api/ 目录里的 handle 函数，保证本地和线上行为一致；
 * 环境变量从 .env 读取，不会打进前端产物。
 */
function createLocalApiPlugin(
  name: string,
  path: string,
  handler: (request: Request) => Promise<Response>,
): Plugin {
  function attach(server: { middlewares: Connect.Server }) {
    server.middlewares.use(async (req, res, next) => {
      // 只拦截指定路径，其余请求交给 Vite
      const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
      if (requestUrl.pathname !== path) {
        next()
        return
      }

      try {
        const headers = new Headers()
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') headers.set(key, value)
          else if (Array.isArray(value)) headers.set(key, value.join(', '))
        }

        const request = new Request(requestUrl, { method: req.method, headers })
        const response = await handler(request)

        res.statusCode = response.status
        response.headers.forEach((value, key) => {
          if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) res.setHeader(key, value)
        })
        res.end(await response.text())
      } catch (err) {
        console.error(`[${name}] 本地 API 代理异常：`, err)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ msg: '本地 API 代理异常' }))
      }
    })
  }

  return {
    name,
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 空前缀 = 读取所有 .env 变量（不注入到前端，仅在本地代理里使用）
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  return {
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        dts: true, // 生成 auto-imports.d.ts，ref/reactive/ElMessage自动导入+类型提示
      }),
      Components({
        // 自动扫描src/components目录下所有vue组件，自定义组件自动导入
        dirs: ['src/components'],
        resolvers: [ElementPlusResolver()],
        dts: true, // 生成 components.d.ts，自定义组件+ElementPlus组件提示
      }),
      createLocalApiPlugin('local-weather-api', '/api/weather', (request) =>
        handleWeather(request, {
          QWEATHER_KEY: env.QWEATHER_KEY,
          QWEATHER_API_HOST: env.QWEATHER_API_HOST,
        }),
      ),
      createLocalApiPlugin('local-github-api', '/api/githubcontributions', (request) =>
        handleGithubContributions(request, {
          GITHUB_PAT: env.GITHUB_PAT,
        }),
      ),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
