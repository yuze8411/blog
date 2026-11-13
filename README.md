# 雨落千山 · 个人博客

一个基于 **Vue 3 + TypeScript + Supabase** 的个人博客，前台记录技术笔记、生活随笔与旅行照片，后台提供文章、评论、留言等内容管理。第三方能力通过 **Vercel Edge Functions** 代理，密钥不会进入前端产物。

在线访问：<https://blog-rho-gules.vercel.app/>

## 功能概览

### 前台

- **首页**：封面、个人数据、实时天气与最新文章。
- **文章详情**：Markdown 渲染、代码高亮、标题目录、阅读量统计、评论与二级回复。
- **分类 / 标签**：按分类筛选文章、标签墙、按标签查看文章列表。
- **游记**：照片瀑布流、大图预览、拍摄时间与标签展示。
- **里程碑**：时间轴形式回顾重要节点，搭配轻量粒子动效。
- **数据统计**：站点汇总数据、分类玫瑰图、月度文章折线图与标签墙。
- **关于**：个人介绍、数据展示、GitHub 贡献热力图。
- **留言墙**：瀑布流展示、全部 / 博主 / 访客筛选、发表留言。
- **主题切换**：明暗主题共用 `localStorage` 中的 `theme`，前台与后台保持一致。

### 后台（仅博主）

- 邮箱 + 密码登录，路由守卫校验 `app_metadata.role === 'owner'`。
- **文章管理**：新建、编辑、预览、封面上传、草稿、发布、隐藏与删除。
- **AI 写作**：通过 DeepSeek 流式生成内容，可多轮对话，按指令修改或重写正文。
- **分类 / 标签 / 评论 / 游记 / 留言管理**：筛选、编辑、审核、隐藏与删除。
- **AI 审核**：调用 DeepSeek 批量审核评论与留言，审核规则与密钥只保留在服务端。
- 后台提示与确认框使用项目自定义的 `AdminAlert` / `AdminConfirm`。

> 后台首页、网站数据、设置等页面目前为占位页，现有的内容管理功能均可正常使用。

## 技术栈

| 类别       | 技术                                                      |
| ---------- | --------------------------------------------------------- |
| 前端框架   | Vue 3（组合式 API）、TypeScript、Vite                     |
| 路由与状态 | Vue Router、Pinia                                         |
| 样式与组件 | Tailwind CSS、Element Plus、自定义组件与动画              |
| 内容渲染   | md-editor-v3、markdown-it、markdown-it-anchor、Shiki      |
| 图表       | ECharts                                                   |
| 数据与认证 | Supabase（Postgres、Auth、Storage、RLS）                  |
| 服务端能力 | Vercel Edge Functions、DeepSeek、和风天气、GitHub GraphQL |
| 部署       | Vercel                                                    |

## 目录结构

```text
├── api/                  # Vercel Edge Function 入口
├── server/               # 服务端共享逻辑（评论 / 留言审核）
├── public/               # 静态资源
├── src/
│   ├── api/              # Supabase、天气、AI 等前端请求封装
│   ├── assets/           # 图片、字体、全局样式
│   ├── components/       # 公共组件与业务组件
│   ├── data/             # 客户端静态数据与类型
│   ├── directives/       # 自定义指令（滚动显现等）
│   ├── layouts/          # 后台布局
│   ├── router/           # 路由表与登录守卫
│   ├── stores/           # Pinia 状态
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 日期、Markdown、统计等工具
│   └── views/            # 前台页面与后台管理页面
├── sql.text              # Supabase 建表、视图、RLS、Storage 配置
├── vite.config.ts        # Vite 配置与本地 /api 代理
└── vercel.json           # SPA 路由重写
```

## 快速开始

### 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- 一个 Supabase 项目
- 可选：和风天气、GitHub PAT、DeepSeek API Key

### 安装与运行

```bash
npm install
npm run dev
```

本地开发时，`vite.config.ts` 会在 Vite 中注册 `/api/*` 中间件，直接复用 `api/` 下的处理逻辑，因此不需要额外启动 `vercel dev`。

### 环境变量

在项目根目录创建 `.env`（可参考 `.env.example`）：

| 变量                     | 说明                                               | 使用位置                   |
| ------------------------ | -------------------------------------------------- | -------------------------- |
| `VITE_SUPABASE_URL`      | Supabase 项目 URL                                  | 前端 / 服务端校验          |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key，可公开，但必须配合 RLS          | 前端 / 服务端校验          |
| `QWEATHER_KEY`           | 和风天气 API Key                                   | `/api/weather`             |
| `QWEATHER_API_HOST`      | 和风天气 API Host，形如 `abcxyz.qweatherapi.com`   | `/api/weather`             |
| `GITHUB_PAT`             | GitHub Classic PAT，勾选 `read:user` 即可          | `/api/githubcontributions` |
| `DEEPSEEK_API_KEY`       | DeepSeek API Key                                   | AI 写作与审核              |
| `DEEPSEEK_MODEL`         | 模型名称，默认 `deepseek-flash`                    | AI 写作与审核              |
| `DEEPSEEK_BASE_URL`      | DeepSeek 接口地址，默认 `https://api.deepseek.com` | AI 写作与审核              |

> 除 `VITE_` 开头的变量外，其余变量只在服务端使用，不要打包进前端，也不要提交真实密钥。`.env` 已被 `.gitignore` 忽略。

### Supabase 初始化

1. 创建 Supabase 项目，在 SQL Editor 中按编号执行根目录 `sql.text` 中的脚本，完成建表、公开视图、RLS 策略、初始分类与 `blog-media` Storage 桶配置。该文件已加入 `.gitignore`，不会随仓库发布。
2. 在 Authentication 中创建博主账号，并关闭不需要的公开注册入口。
3. 将博主账号的 `app_metadata.role` 设为 `owner`：

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb
where email = '你的博主邮箱';
```

4. 重新登录一次，让新的 JWT 携带 `role`，随后即可访问 `/admin`。

前台读取走 `posts_public`、`comments_public`、`messages_public` 等公开视图；后台直接读写基础表，写入权限由 RLS 根据 `auth.uid()` 和 `is_owner()` 控制。

## 服务端接口

所有接口都位于 `api/`，使用 Vercel Edge Runtime：

| 接口                       | 作用                                   |
| -------------------------- | -------------------------------------- |
| `/api/weather`             | 代理和风天气，返回首页实时天气         |
| `/api/githubcontributions` | 通过 GitHub GraphQL 获取近一年贡献日历 |
| `/api/deepseek`            | 校验博主身份后转发 DeepSeek 流式响应   |
| `/api/comment-review`      | 批量 AI 审核文章评论                   |
| `/api/message-review`      | 批量 AI 审核留言墙留言                 |

评论与留言审核共用 `server/review.ts` 中的逻辑。该文件放在 `/api` 之外，避免两个 Edge Function 入口互相引用导致 Vercel 部署报错。

## 常用命令

| 命令                 | 说明                        |
| -------------------- | --------------------------- |
| `npm run dev`        | 启动本地开发服务器          |
| `npm run build`      | 类型检查并构建生产版本      |
| `npm run build-only` | 只执行 Vite 构建            |
| `npm run preview`    | 预览构建结果                |
| `npm run type-check` | 运行 `vue-tsc` 类型检查     |
| `npm run format`     | 使用 Prettier 格式化 `src/` |

## 部署到 Vercel

1. 将仓库导入 Vercel，框架选择 **Vite**，构建命令 `npm run build`，输出目录 `dist`。
2. 在 **Settings → Environment Variables** 中配置上表中的全部变量。
3. 重新部署。`vercel.json` 已配置 SPA 重写，刷新前端路由不会 404。

## 安全说明

- 前端只使用 Supabase anon key，所有数据权限由 RLS 控制；不要在前端使用 service role key。
- DeepSeek、和风天气、GitHub PAT 等密钥只存在于服务端环境变量。
- 后台仅允许 `app_metadata.role === 'owner'` 的账号访问。
- DeepSeek 写作与 AI 审核接口都会校验请求者的 Supabase 登录状态和博主身份。
- 访客评论进入待审核状态，博主评论直接通过；所有留言统一进入审核队列，审核通过后才会出现在前台。

## 命名约定

- 文件夹：小驼峰，小写字母开头。
- Vue 组件文件：大驼峰，大写字母开头。
- 页面组件统一放在 `src/views`，可复用组件放在 `src/components`。
