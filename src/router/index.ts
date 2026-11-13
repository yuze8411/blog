import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser, isOwner } from '@/api/auth'

// 后台二级页面暂时共用一个占位组件，后续逐个替换成具体页面
const AdminPlaceholder = () => import('@/views/admin/AdminPlaceholder.vue')

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
      path: '/message',
      name: 'messageWall',
      component: () => import('@/views/MessageWall.vue'),
      meta: { title: '留言墙' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { isAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'adminDashboard',
          component: AdminPlaceholder,
          meta: { title: '后台首页' },
        },
        {
          path: 'data/visits',
          name: 'adminDataVisits',
          component: AdminPlaceholder,
          meta: { title: '访问统计' },
        },
        {
          path: 'data/articles',
          name: 'adminDataArticles',
          component: AdminPlaceholder,
          meta: { title: '文章数据' },
        },
        {
          path: 'data/comments',
          name: 'adminDataComments',
          component: AdminPlaceholder,
          meta: { title: '评论数据' },
        },
        {
          path: 'manage/articles',
          name: 'adminManageArticles',
          component: () => import('@/views/admin/AdminArticleManage.vue'),
          meta: { title: '文章管理' },
        },
        {
          path: 'articleedit',
          component: () => import('@/views/admin/AdminArticleEdit.vue'),
          meta: { title: '写博客' },
        },
        {
          path: 'manage/categories',
          name: 'adminManageCategories',
          component: () => import('@/views/admin/AdminCategoryManage.vue'),
          meta: { title: '分类管理' },
        },
        {
          path: 'manage/tags',
          name: 'adminManageTags',
          component: () => import('@/views/admin/AdminTagManage.vue'),
          meta: { title: '标签管理' },
        },
        {
          path: 'manage/comments',
          name: 'adminManageComments',
          component: () => import('@/views/admin/AdminCommentManage.vue'),
          meta: { title: '评论管理' },
        },
        {
          path: 'manage/travel',
          name: 'adminManageTravel',
          component: () => import('@/views/admin/AdminTravelManage.vue'),
          meta: { title: '游记管理' },
        },
        {
          path: 'manage/milestones',
          name: 'adminManageMilestones',
          component: () => import('@/views/admin/AdminMilestoneManage.vue'),
          meta: { title: '时光管理' },
        },
        {
          path: 'manage/messages',
          name: 'adminManageMessages',
          component: () => import('@/views/admin/AdminMessageManage.vue'),
          meta: { title: '留言管理' },
        },
        {
          path: 'settings',
          name: 'adminSettings',
          component: AdminPlaceholder,
          meta: { title: '设置' },
        },
      ],
    },
    {
      // 后台登录页：只有博主一个人能登录，不提供注册
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      // 兜底路由：未匹配的地址统一走 404 页面
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 只有后台和登录页需要登录状态，前台页面直接放行，避免每次跳转都请求 Supabase
  if (!to.meta.isAdmin && to.name !== 'login') return next()
  // 如果来之前就在后台了，那么大概率就是管理员了，进去即可，放置每次点击左侧导航栏都发请求，太慢了
  if (_from.path.startsWith('/admin')) return next()

  // getCurrentUser 会向 Supabase 校验当前会话，未登录 / 会话失效时返回 null
  const user = await getCurrentUser()
  const owner = isOwner(user)

  // 1. 已经是博主，访问登录页 → 直接跳后台首页
  if (to.name === 'login' && owner) {
    return next('/admin/dashboard')
  }

  // 2. 访问后台路由，校验权限：必须是登录状态，并且角色是 owner
  //    带上 redirect，登录成功后可以回到原来想去的后台页面
  if (to.meta.isAdmin && !owner) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 3. 登录页未登录、后台已登录 → 放行
  next()
})

export default router
