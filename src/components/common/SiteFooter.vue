<template>
  <footer class="border-t border-gray-200/80 dark:border-gray-700/60">
    <div class="max-w-[1250px] mx-auto px-6 py-8 text-center">
      <p class="text-[14px] font-[huoxie] text-gray-600 dark:text-gray-300">
        © {{ year }} 愿世间美好更多，愿你我前程顺风
      </p>
      <p class="mt-2 text-[12px] text-gray-400 dark:text-gray-500">
        Built with
        <a
          href="https://vuejs.org"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-sky-500"
        >
          Vue 3
        </a>
        ·
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-sky-500"
        >
          Vite
        </a>
        ·
        <a
          href="https://tailwindcss.com"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-sky-500"
        >
          Tailwind CSS
        </a>
        <span class="mx-1">|</span>
        Deployed on
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-sky-500"
        >
          Vercel
        </a>
      </p>
      <button
        type="button"
        class="mt-3 text-[12px] text-gray-400 transition-colors hover:text-sky-500 dark:text-gray-500"
        @click="backToTop"
      >
        回到顶部 ↑
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped></style>
