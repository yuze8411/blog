import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/detail',
      name: 'articleDetail',
      component: ArticleDetail,
    },
    {
      // 兜底路由：未匹配的地址统一走 404 页面
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFound,
    },
  ],
})

export default router
