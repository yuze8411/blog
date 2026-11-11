<template>
  <div class="w-full rounded-[12px] bg-white p-3 transition-colors duration-300 dark:bg-slate-900">
    <div class="flex justify-between items-center p-1">
      <h3 class="text-[17px] font-semibold text-slate-600">博客列表</h3>
      <div class="flex gap-3">
        <AdminAddButton text="写博客" @addHandler="addHandler"></AdminAddButton>
        <AdminDeleteButton text="删除所选博客" @delHandler="requestDeleteSelected"></AdminDeleteButton>
      </div>
    </div>
    <ArticleManageContentTable
      :articleList="articleList"
      :searchquery="searchquery"
      @pageJump="pageJump"
      @edit="handleEdit"
      @toggle="requestToggle"
      @delete="requestDelete"
      @selection-change="handleSelectionChange"
    ></ArticleManageContentTable>

    <!-- 删除确认：单篇和批量共用同一个弹窗 -->
    <AdminConfirm
      v-model="deleteVisible"
      type="danger"
      :title="deleteTitle"
      message="删除后无法恢复，文章下的评论和标签关联也会一起清掉。"
      confirm-text="删除"
      loading-text="删除中…"
      :loading="deleteLoading"
      :mask-closable="!deleteLoading"
      @confirm="confirmDelete"
    />

    <!-- 隐藏确认：隐藏后前台列表和详情页都不再展示，重新展示不需要确认 -->
    <AdminConfirm
      v-model="hideVisible"
      type="warning"
      title="隐藏这篇文章？"
      :message="hideMessage"
      confirm-text="隐藏"
      cancel-text="再想想"
      loading-text="隐藏中…"
      :loading="hideLoading"
      :mask-closable="!hideLoading"
      @confirm="confirmHide"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import AdminConfirm from '@/components/common/admin/AdminConfirm.vue'
import { useAdminAlert } from '@/components/common/admin/useAdminAlert'
import type { ArticleManageRow } from './types'

//articleList为文章列表数据
const props = defineProps(['articleList', 'searchquery'])
const emit = defineEmits(['pageJump', 'refresh'])
const router = useRouter()
const adminAlert = useAdminAlert()

// 当前在表格里勾选的文章，批量删除用
const selectedRows = ref<ArticleManageRow[]>([])

// ---------------- 编辑 ----------------

// 点击行内「编辑」：带着文章 id 跳到写文章页，由编辑页按 id 载入内容
function handleEdit(row: ArticleManageRow) {
  router.push({ path: '/admin/articleedit', query: { id: row.id } })
}

// ---------------- 删除 ----------------

const deleteVisible = ref(false)
const deleteLoading = ref(false)
const deleteRows = ref<ArticleManageRow[]>([])

const deleteTitle = computed(() => {
  const rows = deleteRows.value
  if (rows.length === 1) {
    return `删除「${shortTitle(rows[0]?.title ?? '这篇文章')}」？`
  }
  return `删除选中的 ${rows.length} 篇文章？`
})

function requestDelete(row: ArticleManageRow) {
  deleteRows.value = [row]
  deleteVisible.value = true
}

// 顶部「删除所选博客」：没勾选就先提醒，不要弹一个没意义的确认框
function requestDeleteSelected() {
  if (!selectedRows.value.length) {
    adminAlert.warning('先在表格左侧勾选要删除的文章')
    return
  }
  deleteRows.value = [...selectedRows.value]
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!deleteRows.value.length || deleteLoading.value) return

  const rows = deleteRows.value
  const ids = rows.map((row) => row.id)
  deleteLoading.value = true

  try {
    // post_tags / comments 都有级联删除，删文章时不用再手动清
    const { error } = await supabase.from('posts').delete().in('id', ids)
    if (error) throw error

    deleteVisible.value = false
    deleteRows.value = []
    adminAlert.success(ids.length === 1 ? '文章已删除' : `已删除 ${ids.length} 篇文章`)
    emit('refresh')
  } catch (error) {
    console.error('[articleManage] 删除文章失败', error)
    adminAlert.error(error instanceof Error ? error.message : '删除失败，请稍后重试')
  } finally {
    deleteLoading.value = false
  }
}

// ---------------- 隐藏 / 展示 ----------------

const hideVisible = ref(false)
const hideLoading = ref(false)
const hideRow = ref<ArticleManageRow | null>(null)

const hideMessage = computed(() => {
  const row = hideRow.value
  if (!row) return ''
  return `隐藏后「${shortTitle(row.title)}」不会再出现在前台，随时可以重新展示。`
})

function requestToggle(row: ArticleManageRow) {
  // 草稿本来就不在前台展示，不做无意义的操作
  if (!row.is_published) {
    adminAlert.info('草稿本来就不会在前台展示，不需要隐藏')
    return
  }

  // 展示是恢复操作，不挡确认，直接执行
  if (!row.is_visible) {
    void setVisible(row, true)
    return
  }

  hideRow.value = row
  hideVisible.value = true
}

async function confirmHide() {
  const row = hideRow.value
  if (!row || hideLoading.value) return

  hideLoading.value = true
  const success = await setVisible(row, false)
  hideLoading.value = false

  if (success) {
    hideVisible.value = false
    hideRow.value = null
  }
}

/** 修改 posts.is_visible，成功返回 true */
async function setVisible(row: ArticleManageRow, visible: boolean) {
  try {
    const { error } = await supabase.from('posts').update({ is_visible: visible }).eq('id', row.id)
    if (error) throw error

    adminAlert.success(visible ? '文章已重新展示' : '文章已隐藏')
    emit('refresh')
    return true
  } catch (error) {
    console.error('[articleManage] 修改展示状态失败', error)
    adminAlert.error(error instanceof Error ? error.message : '操作失败，请稍后重试')
    return false
  }
}

// ---------------- 其它 ----------------

// 表格勾选变化
function handleSelectionChange(rows: ArticleManageRow[]) {
  selectedRows.value = rows
}

// 点击添加按钮时的回调：跳到写文章页面
function addHandler() {
  router.push('/admin/articleedit')
}

// 分页回调：页码从表格里的分页条传上来，原样再交给页面（AdminArticleManage）
function pageJump(page: number) {
  emit('pageJump', page)
}

// 标题太长时截断，避免确认框标题撑成两行
function shortTitle(title: string) {
  return title.length > 14 ? `${title.slice(0, 14)}…` : title
}
</script>

<style scoped></style>
