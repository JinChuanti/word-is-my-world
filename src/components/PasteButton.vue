<template>
  <div class="paste-button-container">
    <button
      @click="handlePaste"
      :disabled="!isSupported || isLoading || isRecognizing"
      class="paste-button"
      :class="{
        'paste-button--loading': isLoading || isRecognizing,
        'paste-button--disabled': !isSupported
      }"
      type="button"
      title="点击选择屏幕区域进行识别"
    >
      <span class="paste-button__icon" v-if="!isLoading && !isRecognizing">
        📸
      </span>
      <span class="paste-button__loading" v-if="isLoading || isRecognizing">
        {{ isRecognizing ? '🔍' : '⏳' }}
      </span>
      <span class="paste-button__text">
        {{ buttonText }}
      </span>
    </button>
    
    <!-- 进度提示 -->
    <div v-if="isRecognizing && progress > 0" class="ocr-progress">
      识别中: {{ Math.round(progress * 100) }}%
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error || ocrError" class="paste-error">
      {{ error || ocrError }}
    </div>
    
    <!-- 不支持提示 -->
    <div v-if="!isSupported" class="paste-unsupported">
      您的浏览器不支持剪贴板功能
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOCR } from '../composables/useOCR'
// import { useClipboard } from '../composables/useClipboard' // 不再需要读取剪贴板
import { useScreenCapture } from '../composables/useScreenCapture'

interface Emits {
  (e: 'paste', text: string): void
  (e: 'error', message: string): void
}

const emit = defineEmits<Emits>()

const { recognizeImage, extractWord, isRecognizing, error: ocrError, progress } = useOCR()
// const { readClipboardItems, isSupported, error: clipboardError } = useClipboard()
const { captureScreen, isCapturing, captureError } = useScreenCapture()

// Screen Capture support check
const isSupported = ref(!!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia))

const isLoading = computed(() => isCapturing.value)
const error = computed(() => {
  // 优先显示 OCR 错误，其次是截图错误
  const err = ocrError.value || captureError.value
  return err ? err : null
})

// 按钮文本
const buttonText = computed(() => {
  if (isRecognizing.value) return '识别中...'
  if (isCapturing.value) return '截屏中...'
  return '截屏识别查询'
})

// 处理点击事件（屏幕截图 -> OCR）
const handlePaste = async () => {
  if (isLoading.value || isRecognizing.value) {
    return
  }

  try {
    // 1. 触发屏幕截图
    const imageBlob = await captureScreen()
    
    // 如果返回 null，说明用户取消了或失败了
    if (!imageBlob) {
      if (captureError.value) {
        throw new Error(captureError.value)
      }
      return // 用户取消，不做处理
    }

    // 2. OCR 识别
    const text = await recognizeImage(imageBlob)
    const word = extractWord(text)
    
    if (!word) {
      throw new Error('未能从屏幕截图中识别出有效的英文单词')
    }
    
    emit('paste', word)
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '操作失败'
    emit('error', errorMessage)
  }
}
</script>

<style scoped>
/* 可以在这里添加一些样式，或者复用全局样式 */
.ocr-progress {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
  text-align: center;
}
</style>

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