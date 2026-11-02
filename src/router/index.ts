import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import NotFound from '@/views/NotFound.vue'
import Classify from '@/views/Classify.vue'
import Tags from '@/views/Tags.vue'
import TagsArticle from '@/views/TagsArticle.vue'
import TravelNote from '@/views/TravelNote.vue'
import Milestone from '@/views/Milestone.vue'
import Stats from '@/views/Stats.vue'

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
      path: '/category',
      name: 'category',
      component: Classify,
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
    },
    {
      path: '/tags/:tag',
      name: 'tagArticle',
      component: TagsArticle,
    },
    {
      path: '/travel',
      name: 'travel',
      component: TravelNote,
    },
    {
      path: '/milestone',
      name: 'milestone',
      component: Milestone,
    },
    {
      path: '/stats',
      name: 'Stats',
      component: Stats,
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
