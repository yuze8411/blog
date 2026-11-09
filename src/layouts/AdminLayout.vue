<template>
  <div class="flex h-screen w-full overflow-hidden bg-[#f6f8fb] text-slate-800">
    <!-- ==================== 左侧导航栏 ==================== -->
    <aside
      class="flex h-full shrink-0 flex-col border-r border-slate-200/70 bg-white transition-[width] duration-300 ease-out"
      :class="isCollapse ? 'w-16' : 'w-[232px]'"
    >
      <!-- 品牌区：点击回到后台首页 -->
      <RouterLink
        to="/admin/dashboard"
        class="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 transition-colors hover:bg-slate-50/70"
        :class="isCollapse ? 'justify-center px-0' : ''"
      >
        <span
          class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.7)]"
        >
          <el-icon :size="18"><Reading /></el-icon>
        </span>
        <span v-show="!isCollapse" class="min-w-0 leading-tight">
          <span class="block truncate text-[15px] font-medium text-slate-800">雨落千山</span>
          <span class="block truncate text-[11px] tracking-[0.12em] text-slate-400">管理后台</span>
        </span>
        <span
          v-show="!isCollapse"
          class="ml-auto shrink-0 rounded-full border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-sky-500"
        >
          ADMIN
        </span>
      </RouterLink>

      <!-- 导航菜单：el-menu 负责展开/收起、选中高亮和折叠后的浮层 -->
      <el-scrollbar class="min-h-0 flex-1">
        <p
          v-show="!isCollapse"
          class="px-5 pb-1 pt-4 text-[10px] font-medium tracking-[0.22em] text-slate-400"
        >
          导航菜单
        </p>

        <el-menu
          :default-active="route.path"
          :default-openeds="openedMenus"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="admin-menu pb-3"
          @select="handleSelect"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><House /></el-icon>
            <template #title>后台首页</template>
          </el-menu-item>

          <!-- 网站数据：后续把二级页面逐个接进来 -->
          <el-sub-menu index="data">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>网站数据</span>
            </template>
            <el-menu-item index="/admin/data/visits">访问统计</el-menu-item>
            <el-menu-item index="/admin/data/articles">文章数据</el-menu-item>
            <el-menu-item index="/admin/data/comments">评论数据</el-menu-item>
          </el-sub-menu>

          <!-- 管理：文章、分类、标签、评论、游记 -->
          <el-sub-menu index="manage">
            <template #title>
              <el-icon><Management /></el-icon>
              <span>管理</span>
            </template>
            <el-menu-item index="/admin/manage/articles">文章管理</el-menu-item>
            <el-menu-item index="/admin/manage/categories">分类管理</el-menu-item>
            <el-menu-item index="/admin/manage/tags">标签管理</el-menu-item>
            <el-menu-item index="/admin/manage/comments">评论管理</el-menu-item>
            <el-menu-item index="/admin/manage/travel">游记管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <template #title>设置</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <!-- 底部：站点状态 + 退出登录 -->
      <div class="shrink-0 px-3 pb-3">
        <div
          v-show="!isCollapse"
          class="mb-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
        >
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <p class="text-[12px] font-medium text-slate-600">站点运行中</p>
          </div>
          <p class="mt-1 text-[11px] leading-5 text-slate-400">文章、相册与评论的管理入口</p>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            :class="isCollapse ? 'justify-center px-0' : ''"
            title="退出登录"
            @click="handleLogout"
          >
            <el-icon :size="18"><SwitchButton /></el-icon>
            <span v-show="!isCollapse">退出登录</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- ==================== 右侧：顶部栏 + 内容区 ==================== -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur sm:px-6"
      >
        <div class="flex min-w-0 items-center gap-2.5">
          <!-- 侧栏收起 / 展开 -->
          <button
            type="button"
            class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            :aria-label="isCollapse ? '展开侧边栏' : '收起侧边栏'"
            @click="isCollapse = !isCollapse"
          >
            <el-icon :size="18">
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
          </button>

          <span class="hidden h-4 w-px shrink-0 bg-slate-200 sm:block"></span>

          <!-- 面包屑：后台管理 / 分组 / 当前页 -->
          <el-breadcrumb separator="/" class="admin-breadcrumb hidden min-w-0 sm:block">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">
              <span class="inline-flex items-center gap-1">
                <el-icon :size="13"><House /></el-icon>
                后台管理
              </span>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="groupTitle">{{ groupTitle }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 小屏时面包屑太长，只显示当前页标题 -->
          <p class="truncate text-[15px] font-medium text-slate-800 sm:hidden">{{ pageTitle }}</p>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- 回到前台博客 -->
          <RouterLink
            to="/"
            class="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-600 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/60 hover:text-sky-600"
          >
            <el-icon :size="14" class="transition-transform group-hover:-translate-x-0.5">
              <Back />
            </el-icon>
            <span class="hidden sm:inline">返回博客</span>
          </RouterLink>

          <span class="hidden h-4 w-px bg-slate-200 sm:block"></span>

          <!-- 博主信息：头像、昵称、邮箱都来自当前登录的 Supabase 账号 -->
          <div class="flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-1 sm:pr-2">
            <span class="relative shrink-0">
              <el-avatar
                :size="34"
                :src="displayAvatar"
                :title="displayEmail"
                class="shadow-sm ring-2 ring-white"
              />
              <span
                class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400"
                aria-hidden="true"
              ></span>
            </span>
            <div class="hidden min-w-0 leading-tight sm:block">
              <p class="flex items-center gap-1.5 text-[13px] font-medium text-slate-800">
                <span class="max-w-[140px] truncate">{{ displayName }}</span>
                <span
                  class="shrink-0 rounded-full border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-500"
                >
                  博主
                </span>
              </p>
              <p class="max-w-[180px] truncate text-[11px] text-slate-400">
                {{ displayEmail || '已登录' }}
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区：二级路由的具体页面渲染在这里 -->
      <main class="relative min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4 sm:p-6">
        <!-- 很淡的底色光晕，避免大片纯灰显得单调 -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl"
          ></div>
          <div
            class="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl"
          ></div>
        </div>

        <div class="relative mx-auto h-full w-full">
          <RouterView v-slot="{ Component }">
            <Transition name="admin-fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <!-- 退出登录确认框：点遮罩 / 按 Esc / 点取消都等同于取消 -->
    <AdminConfirm
      v-model="logoutVisible"
      type="warning"
      title="确定退出登录吗？"
      message="退出后需要重新登录才能进入后台。"
      confirm-text="退出登录"
      cancel-text="再想想"
      :loading="logoutLoading"
      loading-text="退出中…"
      @confirm="confirmLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  Back,
  DataAnalysis,
  Expand,
  Fold,
  House,
  Management,
  Reading,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue'
import fallbackAvatar from '@/assets/images/mycover.jpg'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import { getCurrentUser, signOut } from '@/api/auth'
import type { AdminUser } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const adminAlert = useAdminAlert()

/** 侧栏是否收起 */
const isCollapse = ref(false)

/** 退出登录确认框是否显示 */
const logoutVisible = ref(false)

/** 退出登录请求进行中，用于禁用确认按钮 */
const logoutLoading = ref(false)

/** 当前登录的博主信息，进入后台时拉取一次 */
const currentUser = ref<AdminUser | null>(null)
const displayName = computed(() => currentUser.value?.name || '博主')
const displayEmail = computed(() => currentUser.value?.email || '')
const displayAvatar = computed(() => currentUser.value?.avatarUrl || fallbackAvatar)

async function loadCurrentUser() {
  currentUser.value = await getCurrentUser()
}

/** 顶部栏 / 面包屑显示当前二级路由的标题 */
const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : '后台首页'
})

/** 面包屑中间那一级：数据 / 管理分组没有独立路由，按路径前缀判断 */
const groupTitle = computed(() => {
  if (route.path.startsWith('/admin/data')) return '网站数据'
  if (route.path.startsWith('/admin/manage')) return '管理'
  return ''
})

/**
 * default-openeds 只在菜单首次渲染时读取。
 * 直接访问 /admin/data/xxx 这类地址时，让对应分组默认展开，
 * 否则选中项藏在收起的子菜单里，看不出来自己在哪一页。
 */
const openedMenus = computed(() => {
  const menus: string[] = []
  if (route.path.startsWith('/admin/data')) menus.push('data')
  if (route.path.startsWith('/admin/manage')) menus.push('manage')
  return menus
})

/** 菜单项点击：统一交给 router 跳转，刷新时也保持 el-menu 的选中态 */
function handleSelect(index: string) {
  if (index === route.path) return
  void router.push(index)
}

/** 小屏幕默认收起侧栏，给内容区留出空间 */
function syncCollapse() {
  if (window.innerWidth < 1024) isCollapse.value = true
}

function handleLogout() {
  logoutVisible.value = true
}

/** 确认框里点了「退出登录」：调用封装好的 signOut，成功后回登录页 */
async function confirmLogout() {
  if (logoutLoading.value) return
  logoutLoading.value = true

  try {
    await signOut()
  } catch (error) {
    adminAlert.error(error instanceof Error ? error.message : '退出登录失败，请稍后重试')
    return
  } finally {
    logoutLoading.value = false
  }

  logoutVisible.value = false
  currentUser.value = null
  adminAlert.success('已退出登录')
  void router.push('/login')
}

onMounted(() => {
  syncCollapse()
  void loadCurrentUser()
  window.addEventListener('resize', syncCollapse, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncCollapse)
})
</script>

<style scoped>
/* ==================== Element Plus 菜单微调 ==================== */
.admin-menu {
  --el-menu-item-height: 44px;
  --el-menu-sub-item-height: 40px;
  /* 20px 是 Element 的默认值：收起时菜单宽度正好 24 + 20 * 2 = 64px，和侧栏 w-16 对齐 */
  --el-menu-base-level-padding: 20px;
  --el-menu-level-padding: 18px;
  --el-menu-item-font-size: 14px;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: #f8fafc;
  --el-menu-border-color: transparent;
  border-right: none;
  padding-left: 0;
}

/* 展开状态下：每项留出左右空隙，选中时是一块圆角浅蓝底 */
.admin-menu:not(.el-menu--collapse) :deep(.el-menu-item),
.admin-menu:not(.el-menu--collapse) :deep(.el-sub-menu__title) {
  margin: 2px 10px;
  border-radius: 10px;
}

.admin-menu :deep(.el-menu-item),
.admin-menu :deep(.el-sub-menu__title) {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-menu :deep(.el-menu-item .el-icon),
.admin-menu :deep(.el-sub-menu__title .el-icon) {
  color: #94a3b8;
  transition: color 0.2s ease;
}

.admin-menu :deep(.el-menu-item:hover .el-icon),
.admin-menu :deep(.el-sub-menu__title:hover .el-icon) {
  color: #3b82f6;
}

/* 选中项：浅蓝渐变底 + 细边框，左侧再加一条小竖条 */
.admin-menu :deep(.el-menu-item.is-active) {
  color: #2563eb;
  font-weight: 500;
  background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
}

.admin-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #2563eb;
}

.admin-menu:not(.el-menu--collapse) :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  height: 18px;
  width: 3px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #60a5fa, #2563eb);
}

/* 子菜单里有选中项时，让父级标题也变蓝 */
.admin-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #2563eb;
  font-weight: 500;
}

.admin-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: #2563eb;
}

/* 收起状态：图标居中，避免左右的 margin / padding 把图标挤偏 */
.admin-menu.el-menu--collapse :deep(.el-menu-item),
.admin-menu.el-menu--collapse :deep(.el-sub-menu__title) {
  justify-content: center;
  margin: 2px 6px;
  padding: 0;
  border-radius: 10px;
}

/* ==================== 面包屑 ==================== */
.admin-breadcrumb :deep(.el-breadcrumb__inner) {
  color: #94a3b8;
  font-weight: 500;
  transition: color 0.2s ease;
}

.admin-breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) {
  color: #2563eb;
}

.admin-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1e293b;
  font-weight: 600;
}

.admin-breadcrumb :deep(.el-breadcrumb__separator) {
  color: #cbd5e1;
}

/* ==================== 内容区切换动画 ==================== */
.admin-fade-enter-active,
.admin-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.admin-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.admin-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .admin-fade-enter-active,
  .admin-fade-leave-active {
    transition: none;
  }
}
</style>
