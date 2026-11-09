<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
    <!-- 整页背景图 -->
    <img
      src="@/assets/images/back2.jpg"
      alt=""
      class="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
    />
    <!-- 压暗背景，保证玻璃卡片和白色导航文字都清晰 -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-900/35 to-slate-950/70"
    ></div>
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,rgba(2,6,23,0.32)_100%)]"
    ></div>

    <!-- 和首页 cover 一样的枫叶粒子，给整页增加一点动态 -->
    <HomeLeafParticles />

    <!-- 顶部品牌 + 返回入口 -->
    <header
      class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10"
    >
      <RouterLink to="/" class="group flex items-center gap-3">
        <span
          class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.7)] transition-transform duration-300 group-hover:-translate-y-0.5"
        >
          <el-icon :size="18"><Reading /></el-icon>
        </span>
        <span class="leading-tight">
          <span class="block text-[15px] font-medium text-white/95">雨落千山</span>
          <span class="block text-[11px] tracking-[0.16em] text-white/45">管理后台</span>
        </span>
      </RouterLink>

      <RouterLink
        to="/"
        class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20 hover:text-white"
      >
        <el-icon :size="13"><Back /></el-icon>
        返回博客
      </RouterLink>
    </header>

    <!-- 毛玻璃登录卡片 -->
    <section class="relative z-10 w-full max-w-[400px] px-4 py-24">
      <div
        class="rounded-[26px] border border-white/45 bg-white/70 p-7 shadow-[0_36px_90px_-32px_rgba(2,6,23,0.75)] ring-1 ring-white/30 backdrop-blur-2xl sm:p-8"
      >
        <p class="text-[11px] font-medium tracking-[0.22em] text-sky-600/80">ADMIN LOGIN</p>
        <h1 class="mt-2 text-[26px] leading-tight font-[huoxie] text-slate-800">登录后台</h1>
        <p class="mt-2 text-[12px] leading-5 text-slate-500">
          使用博主邮箱登录，继续管理文章、相册与站点数据。
        </p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form mt-6"
          autocomplete="off"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              size="large"
              type="email"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
              autocomplete="off"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <!-- 邮箱或密码错误时的提示 -->
          <Transition name="login-error">
            <p
              v-if="errorMessage"
              class="login-error -mt-1 mb-3 flex items-center gap-1.5 rounded-lg bg-rose-50/80 px-3 py-2 text-[12px] text-rose-500 ring-1 ring-rose-100"
              role="alert"
            >
              <el-icon :size="13"><CircleCloseFilled /></el-icon>
              {{ errorMessage }}
            </p>
          </Transition>

          <el-button
            native-type="submit"
            class="login-submit mt-1 w-full"
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? '登录中…' : '登 录' }}
          </el-button>
        </el-form>
      </div>

      <p class="mt-5 text-center text-[11px] tracking-wide text-white/45">
        想登录？还没交互的，哈哈哈~
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { Back, CircleCloseFilled, Lock, Message, Reading } from '@element-plus/icons-vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import { isOwner, signIn, signOut } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const adminAlert = useAdminAlert()

const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const loading = ref(false)
const errorMessage = ref('')

/** 登录成功后回到来源页；没有来源就进后台首页 */
const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) return redirect
  return '/admin/dashboard'
})

async function handleSubmit() {
  if (loading.value) return

  // 表单校验不通过时 Element Plus 会自己弹出错误提示
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    // 真正的登录请求已经封装在 src/api/auth.ts 里，页面只关心结果
    const user = await signIn(form.email, form.password)

    // 账号密码正确，但不是博主账号：立刻退出，不留下一个能登录却没有后台权限的会话
    if (!isOwner(user)) {
      await signOut().catch(() => {})
      errorMessage.value = '该账号没有后台管理权限'
      return
    }

    adminAlert.success(`欢迎回来，${user.name}`)
    await router.push(redirectTarget.value)
  } catch (error) {
    // signIn 会把 Supabase 的错误翻译成中文，这里直接展示
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ==================== 玻璃卡片里的表单样式 ==================== */
.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
}

.login-form :deep(.el-form-item__error) {
  padding-top: 4px;
  font-size: 11px;
  color: #f43f5e;
}

/* 输入框做成半透明玻璃质感 */
.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 2px 12px;
  background-color: rgba(255, 255, 255, 0.72);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.65) inset;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(147, 197, 253, 0.75) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 1px #60a5fa inset,
    0 0 0 4px rgba(96, 165, 250, 0.18);
}

.login-form :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
  color: #334155;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #94a3b8;
}

/* 主按钮：蓝色渐变，和站点的蓝色调呼应 */
.login-submit {
  height: 46px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #fff;
  box-shadow: 0 14px 28px -14px rgba(37, 99, 235, 0.8);
  transition:
    filter 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.login-submit:hover:not(.is-disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 18px 32px -14px rgba(37, 99, 235, 0.85);
}

.login-submit:active:not(.is-disabled) {
  transform: translateY(0);
}

.login-submit.is-loading {
  opacity: 0.85;
}

/* 错误提示的出入场 */
.login-error-enter-active,
.login-error-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.login-error-enter-from,
.login-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .login-submit,
  .login-error-enter-active,
  .login-error-leave-active {
    transition: none;
  }
}
</style>
