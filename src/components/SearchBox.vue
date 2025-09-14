<template>
  <div class="search-box">
    <div class="search-input-container">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="输入要查询的单词..."
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
    <div class="search-hint" v-if="!searchQuery">
      💡 提示：输入单词进行查询，或使用粘贴按钮快速输入
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

// 内部搜索查询状态
const searchQuery = ref(props.modelValue)

// 输入框引用
const inputRef = ref<HTMLInputElement>()

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
  color: #6b7280;
  text-align: center;
}

@media (max-width: 640px) {
  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>