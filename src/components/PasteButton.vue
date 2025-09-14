<template>
  <div class="paste-button-container">
    <button
      @click="handlePaste"
      :disabled="!isSupported || isLoading"
      class="paste-button"
      :class="{
        'paste-button--loading': isLoading,
        'paste-button--disabled': !isSupported
      }"
      type="button"
    >
      <span class="paste-button__icon" v-if="!isLoading">
        📋
      </span>
      <span class="paste-button__loading" v-if="isLoading">
        ⏳
      </span>
      <span class="paste-button__text">
        {{ buttonText }}
      </span>
    </button>
    
    <!-- 错误提示 */
    <div v-if="error" class="paste-error">
      {{ error }}
    </div>
    
    <!-- 不支持提示 -->
    <div v-if="!isSupported" class="paste-unsupported">
      您的浏览器不支持剪贴板功能
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '../composables/useClipboard'

// Emits
interface Emits {
  'paste': [text: string]
  'error': [error: string]
}

const emit = defineEmits<Emits>()

// 使用剪贴板composable
const { isSupported, pasteFromClipboard } = useClipboard()

// 本地状态
const isLoading = ref(false)
const error = ref<string | null>(null)

// 计算属性
const buttonText = computed(() => {
  if (isLoading.value) return '粘贴中...'
  if (!isSupported.value) return '不支持粘贴'
  return '粘贴查询'
})

// 处理粘贴事件
const handlePaste = async () => {
  if (!isSupported.value || isLoading.value) {
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    const text = await pasteFromClipboard()
    
    if (!text) {
      throw new Error('剪贴板内容为空')
    }
    
    // 简单验证是否为英文单词（只包含字母）
    const cleanText = text.trim()
    if (!/^[a-zA-Z]+$/.test(cleanText)) {
      throw new Error('请粘贴有效的英文单词')
    }
    
    emit('paste', cleanText)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '粘贴失败'
    error.value = errorMessage
    emit('error', errorMessage)
    
    // 3秒后清除错误信息
    setTimeout(() => {
      error.value = null
    }, 3000)
  } finally {
    isLoading.value = false
  }
}



// 暴露方法给父组件
defineExpose({
  handlePaste
})
</script>

<style scoped>
.paste-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.paste-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  background-color: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 120px;
  justify-content: center;
}

.paste-button:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.paste-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.paste-button--loading {
  cursor: wait;
  opacity: 0.8;
}

.paste-button--disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.paste-button--disabled:hover {
  transform: none;
  box-shadow: none;
}

.paste-button__icon {
  font-size: 16px;
  line-height: 1;
}

.paste-button__loading {
  font-size: 16px;
  line-height: 1;
  animation: spin 1s linear infinite;
}

.paste-button__text {
  white-space: nowrap;
}

.paste-error {
  color: #dc2626;
  font-size: 12px;
  text-align: center;
  padding: 4px 8px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  max-width: 200px;
}

.paste-unsupported {
  color: #d97706;
  font-size: 12px;
  text-align: center;
  padding: 4px 8px;
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  max-width: 200px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .paste-button {
    min-width: 100px;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .paste-error,
  .paste-unsupported {
    font-size: 11px;
    max-width: 180px;
  }
}
</style>