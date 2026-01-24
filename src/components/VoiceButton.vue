<template>
  <div class="voice-button-container">
    <button
      ref="btnRef"
      class="voice-button"
      :class="{ 
        'voice-button--listening': isListening,
        'voice-button--processing': isProcessing,
        'voice-button--disabled': !isSupported,
        'voice-button--canceling': isCanceling
      }"
      @mousedown="handleStart"
      @touchstart.prevent="handleStart"
      @contextmenu.prevent
      type="button"
      :disabled="isProcessing"
      :title="isSupported ? '长按说话，松开搜索' : '浏览器不支持语音输入'"
    >
      <div class="voice-icon-wrapper">
        <span class="voice-icon" v-if="isProcessing">⏳</span>
        <span class="voice-icon" v-else>{{ isCanceling ? '↩️' : '🎤' }}</span>
        <div v-if="isListening && !isCanceling" class="voice-ripple"></div>
      </div>
      <span class="voice-text">
        {{ buttonText }}
      </span>
    </button>
    
    <!-- 状态提示 -->
    <div v-if="isProcessing" class="voice-preview">
      正在识别...
    </div>
    <div v-else-if="isListening && !isCanceling" class="voice-preview">
      正在聆听...
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="voice-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onUnmounted } from 'vue'
import { useSpeechRecognition } from '../composables/useSpeechRecognition'

interface Emits {
  (e: 'search', text: string): void
  (e: 'update:modelValue', text: string): void
}

const emit = defineEmits<Emits>()

const { 
  isListening, 
  isProcessing,
  result, 
  error, 
  isSupported, 
  startListening, 
  stopListening 
} = useSpeechRecognition()

const btnRef = ref<HTMLButtonElement | null>(null)
const isCanceling = ref(false) // 是否处于“即将取消”状态（手指移出区域）
const shouldSearch = ref(true) // 标记本次录音结束时是否应该搜索

// 按钮文本
const buttonText = computed(() => {
  if (isProcessing.value) return '识别中...'
  if (isCanceling.value) return '松开取消'
  if (isListening.value) return '松开搜索'
  if (!isSupported.value) return '不支持语音'
  return '按住说话'
})

// 添加全局事件监听，确保松手必停
const addGlobalListeners = () => {
  window.addEventListener('mouseup', handleGlobalStop)
  window.addEventListener('touchend', handleGlobalStop)
  window.addEventListener('touchcancel', handleGlobalStop)
  window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
}

const removeGlobalListeners = () => {
  window.removeEventListener('mouseup', handleGlobalStop)
  window.removeEventListener('touchend', handleGlobalStop)
  window.removeEventListener('touchcancel', handleGlobalStop)
  window.removeEventListener('touchmove', handleGlobalTouchMove)
}

// 处理开始录音
const handleStart = () => {
  if (isProcessing.value) return
  isCanceling.value = false
  shouldSearch.value = true
  // 清空之前的输入
  emit('update:modelValue', '')
  
  startListening()
  addGlobalListeners()
}

// 全局处理触摸移动（检测是否滑出按钮）
const handleGlobalTouchMove = (event: TouchEvent) => {
  if (!isListening.value || !btnRef.value) return

  const touch = event.touches[0]
  const rect = btnRef.value.getBoundingClientRect()
  
  // 检查触点是否在按钮范围内 (稍微放宽一点容差，比如 50px)
  const buffer = 50 
  const isOutside = 
    touch.clientX < rect.left - buffer ||
    touch.clientX > rect.right + buffer ||
    touch.clientY < rect.top - buffer ||
    touch.clientY > rect.bottom + buffer

  if (isOutside) {
    isCanceling.value = true
    shouldSearch.value = false
  } else {
    isCanceling.value = false
    shouldSearch.value = true
  }
}

// 全局处理停止（任何地方松手都算停止）
const handleGlobalStop = () => {
  removeGlobalListeners()
  
  if (isListening.value) {
    // 如果处于取消状态，则不搜索
    if (isCanceling.value) {
      shouldSearch.value = false
    }
    isCanceling.value = false
    stopListening()
  }
}

// 组件卸载时清理
onUnmounted(() => {
  removeGlobalListeners()
})

// 监听结果变化，实时更新输入框
watch(result, (newVal) => {
  if (newVal && !isCanceling.value) {
    emit('update:modelValue', newVal)
  }
})

// 监听录音结束，触发搜索
watch(isListening, (newVal, oldVal) => {
  // 从 听 -> 不听 (结束)
  if (!newVal && oldVal) {
    removeGlobalListeners() // 确保清理
    
    if (shouldSearch.value && result.value && result.value.trim()) {
      // 简单的清理，去除末尾标点
      const cleanText = result.value.trim().replace(/[.,?!]+$/, '')
      emit('search', cleanText)
    } else {
      // 如果被取消了，清空输入框回显
      emit('update:modelValue', '')
    }
    // 重置状态
    shouldSearch.value = true
    isCanceling.value = false
  }
})
</script>

<style scoped>
.voice-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.voice-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  user-select: none;
  -webkit-user-select: none;
}

.voice-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.voice-button:active:not(:disabled) {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.voice-button--listening {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.voice-button--disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.voice-button--processing {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  cursor: wait;
}

.voice-button--canceling {
  background: #6b7280 !important;
  transform: scale(0.96);
}

.voice-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-icon {
  font-size: 20px;
  z-index: 2;
}

.voice-ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: ripple 1.5s infinite;
  z-index: 1;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.voice-preview {
  font-size: 1.2rem;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.voice-error {
  color: #fca5a5;
  font-size: 14px;
  background: rgba(127, 29, 29, 0.5);
  padding: 6px 12px;
  border-radius: 6px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
