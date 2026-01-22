<template>
  <div class="search-box">
    <div class="search-input-container">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="输入要查询的单词..."
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />
      <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-button"
          type="button"
          title="清空搜索"
        >
          ✕
        </button>
    </div>
    
    <!-- 候选单词列表 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
      <div 
        v-for="suggestion in suggestions" 
        :key="suggestion.word"
        class="suggestion-item"
        @mousedown="selectSuggestion(suggestion.word)"
      >
        <span class="suggestion-word">{{ suggestion.word }}</span>
        <span class="suggestion-definition">{{ suggestion.definition }}</span>
      </div>
    </div>
    
    <div class="search-hint" v-if="!searchQuery">
      💡 提示：输入单词进行查询，或点击按钮截取屏幕识别
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { WordData } from '../types/word'

interface Props {
  modelValue?: string
  wordsData?: WordData[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  wordsData: () => []
})

const emit = defineEmits<Emits>()

// 内部搜索查询状态
const searchQuery = ref(props.modelValue)

// 输入框引用
const inputRef = ref<HTMLInputElement>()

// 候选单词显示状态
const showSuggestions = ref(false)

// 候选单词计算属性
const suggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    return []
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.wordsData
    .filter(word => word.word.toLowerCase().startsWith(query))
    .slice(0, 8) // 最多显示8个候选
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// 监听内部值变化，向外发送
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue)
  emit('search', newValue)
})

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  emit('clear')
}

// 选择候选单词
const selectSuggestion = (word: string) => {
  searchQuery.value = word
  showSuggestions.value = false
}

// 隐藏候选列表（延迟执行以允许点击事件）
const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

// 聚焦输入框
const focusInput = () => {
  inputRef.value?.focus()
}

// 暴露方法给父组件
defineExpose({
  focusInput
})
</script>

<style scoped>
.search-box {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  background-color: #ffffff;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.search-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #374151;
  text-align: center;
}

/* 候选单词列表样式 */
.suggestions-list {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f8fafc;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-word {
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 2px;
}

.suggestion-definition {
  font-size: 12px;
  color: #6b7280;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .suggestions-list {
    max-height: 200px;
  }
  
  .suggestion-item {
    padding: 10px 12px;
  }
}
</style>