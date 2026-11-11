<template>
  <div class="w-full rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900">
    <div class="flex justify-between items-center p-1">
      <h3 class="text-[17px] font-semibold text-slate-600">博客列表</h3>
      <div class="flex gap-3">
        <AdminAddButton text="写博客" @addHandler="addHandler"></AdminAddButton>
        <AdminDeleteButton text="删除所选博客" @delHandler="delHandler"></AdminDeleteButton>
      </div>
    </div>
    <ArticleManageContentTable
      :articleList="articleList"
      :searchquery="searchquery"
      @pageJump="pageJump"
    ></ArticleManageContentTable>
  </div>
</template>
<script setup lang="ts">
//articleList为文章列表数据
const props = defineProps(['articleList', 'searchquery'])
const emit = defineEmits(['pageJump'])
// 点击添加按钮时的回调
function addHandler() {
  // 出现写文章页面
}
//点击删除按钮时的回调
function delHandler() {}

// 分页回调：页码从表格里的分页条传上来，原样再交给页面（AdminArticleManage）
function pageJump(page: number) {
  emit('pageJump', page)
}
</script>

<style scoped></style>
