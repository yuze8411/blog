import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
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
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
