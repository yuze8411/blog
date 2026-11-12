<!--
  后台表单字段：统一「标签 + 输入框 + 提示 / 错误」的排版和输入框样式。

  用法：
  <AdminFormField label="名称" hint="最多 20 个字" :error="nameError">
    <input v-model="form.name" class="w-full" />
  </AdminFormField>

  插槽里的 input / textarea / select 会自动套用统一的边框和聚焦样式。
-->
<template>
  <!-- 用 div 而不是 label：图片上传里本身有按钮和文件选择，套 label 会重复触发点击 -->
  <div class="admin-form-field block">
    <span class="admin-form-label">
      {{ label }}
      <em v-if="required" class="admin-form-required" aria-hidden="true">*</em>
    </span>

    <slot />

    <span v-if="error" class="admin-form-error">{{ error }}</span>
    <span v-else-if="hint" class="admin-form-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    /** 输入框下方的灰色说明 */
    hint?: string
    /** 校验不通过时的红色提示，优先于 hint 显示 */
    error?: string
    required?: boolean
  }>(),
  {
    hint: '',
    error: '',
    required: false,
  },
)
</script>

<style scoped>
.admin-form-label {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 6px;
  color: #475569;
  font-size: 12.5px;
  font-weight: 500;
}

.admin-form-required {
  color: #f43f5e;
  font-style: normal;
}

.admin-form-hint {
  display: block;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.admin-form-error {
  display: block;
  margin-top: 5px;
  color: #e11d48;
  font-size: 11px;
  line-height: 1.6;
}

/* 插槽里的原生表单控件统一风格 */
.admin-form-field :deep(input),
.admin-form-field :deep(textarea),
.admin-form-field :deep(select) {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fbfdff;
  padding: 8px 11px;
  color: #334155;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.admin-form-field :deep(textarea) {
  resize: vertical;
  min-height: 84px;
}

.admin-form-field :deep(select) {
  cursor: pointer;
}

.admin-form-field :deep(input::placeholder),
.admin-form-field :deep(textarea::placeholder) {
  color: #94a3b8;
}

.admin-form-field :deep(input:hover),
.admin-form-field :deep(textarea:hover),
.admin-form-field :deep(select:hover) {
  border-color: #cbd5e1;
}

.admin-form-field :deep(input:focus),
.admin-form-field :deep(textarea:focus),
.admin-form-field :deep(select:focus) {
  border-color: #7dd3fc;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(186, 230, 253, 0.45);
}

/* ==================== 黑夜模式 ==================== */
:global(html.dark) .admin-form-label {
  color: #cbd5e1;
}

:global(html.dark) .admin-form-hint {
  color: #64748b;
}

:global(html.dark) .admin-form-error {
  color: #fda4af;
}

:global(html.dark) .admin-form-field :deep(input),
:global(html.dark) .admin-form-field :deep(textarea),
:global(html.dark) .admin-form-field :deep(select) {
  border-color: #334155;
  background: #111c2e;
  color: #e2e8f0;
}

:global(html.dark) .admin-form-field :deep(input:hover),
:global(html.dark) .admin-form-field :deep(textarea:hover),
:global(html.dark) .admin-form-field :deep(select:hover) {
  border-color: #475569;
}

:global(html.dark) .admin-form-field :deep(input:focus),
:global(html.dark) .admin-form-field :deep(textarea:focus),
:global(html.dark) .admin-form-field :deep(select:focus) {
  border-color: #0369a1;
  background: #0f1c30;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
}
</style>
