import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/detail',
      name: 'articleDetail',
      component: () => import('@/views/ArticleDetail.vue'),
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('@/views/Classify.vue'),
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('@/views/Tags.vue'),
    },
    {
      path: '/tags/:tag',
      name: 'tagArticle',
      component: () => import('@/views/TagsArticle.vue'),
    },
    {
      path: '/travel',
      name: 'travel',
      component: () => import('@/views/TravelNote.vue'),
    },
    {
      path: '/milestone',
      name: 'milestone',
      component: () => import('@/views/Milestone.vue'),
    },
    {
      path: '/stats',
      name: 'Stats',
      component: () => import('@/views/Stats.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
    },
    {
      // 兜底路由：未匹配的地址统一走 404 页面
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
