# 个人博客项目

## 命名规范

- 文件夹：**小驼峰（小写字母开头）**
- 组件文件：**大驼峰（大写字母开头）**

## 项目目录结构说明

```
├── /api                 # Vercel 代理配置目录，用于解决跨域、转发接口请求
├── /src
│   ├── /src/api         # 请求接口模块，存放 axios 请求封装、各个业务接口函数
│   ├── /src/assets      # 静态资源目录：图片、全局样式 CSS、字体等静态文件
│   ├── /src/components  # 公共可复用组件（导航栏、卡片、分页、弹窗等通用组件）
│   ├── /src/views       # 路由页面组件（首页、文章页、关于页、归档页等路由视图）
│   ├── /src/router      # Vue Router 路由配置，路由表、路由守卫
│   ├── /src/stores      # Pinia 状态管理，全局共享状态（用户信息、主题、菜单等）
```

## 技术栈

### ✅ 前端

- 框架：`Vue3`（组合式 API）
- 状态管理：`Pinia`
- 路由：`Vue Router`
- 网络请求：`Axios`
- 图表可视化：`ECharts`（访问统计、分类数据图表等）
- 特效：`particles.js` 粒子背景
- UI 组件库：`Element Plus`
- 第三方服务：和风天气 API（天气查询功能）

### ✅ 后端

> 
> 本项目采用 Vercel Serverless 代理转发，可对接各类后端接口 / 无头 CMS，按需接入

### ✅ 部署方案

- 部署平台：`Vercel`
- 利用 `/api` 目录实现 Vercel Serverless Function，处理接口代理，规避浏览器跨域限制

## 项目简要说明

该项目为 Vue3 个人博客系统，依托 Vercel 实现一键部署。通过 Vercel 提供的 Serverless 代理能力，中转第三方接口（和风天气等）；使用 Pinia 维护全局状态，Element Plus 快速搭建页面，搭配 ECharts 实现博客数据可视化、particles.js 实现首页粒子背景特效。
