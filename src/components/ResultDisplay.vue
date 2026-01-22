<template>
  <div class="result-display">
    <!-- 搜索结果 -->
    <div v-if="searchResult.found" class="result-card">
      <div class="word-header">
        <h2 class="word-title">{{ searchResult.data!.word }}</h2>
        <button
          @click="copyWord"
          class="copy-button"
          :class="{ 'copy-button--copied': isCopied }"
          type="button"
          :title="isCopied ? '已复制' : '复制单词'"
        >
          {{ isCopied ? '✓' : '📋' }}
        </button>
      </div>
      
      <div class="word-content">
        <!-- 释义 -->
        <div class="definition-section">
          <h3 class="section-title">释义</h3>
          <p class="definition-text">{{ searchResult.data!.definition }}</p>
        </div>
        
        <!-- 记忆法 -->
        <div class="mnemonic-section">
          <h3 class="section-title">
            <span class="mnemonic-type-badge" :class="`mnemonic-type--${searchResult.data!.mnemonic_type}`">
              {{ getMnemonicTypeLabel(searchResult.data!.mnemonic_type) }}
            </span>
            趣味记忆法
          </h3>
          <div class="mnemonic-content" v-html="parseMarkdown(searchResult.data!.mnemonic_content)">
          </div>
        </div>
        
        <!-- 例句 -->
        <div class="example-section" v-if="searchResult.data!.example_sentence">
          <h3 class="section-title">例句</h3>
          <p class="example-text">{{ searchResult.data!.example_sentence }}</p>
          <p class="example-translation" v-if="searchResult.data!.sentence_translation">{{ searchResult.data!.sentence_translation }}</p>
        </div>
      </div>
    </div>
    
    <!-- 未找到结果 -->
    <div v-else-if="searchQuery && !searchResult.found" class="no-result">
      <div class="no-result-icon">🔍</div>
      <h3 class="no-result-title">未找到单词</h3>
      <p class="no-result-text">
        抱歉，没有找到单词 "<strong>{{ searchQuery }}</strong>" 的记忆法。
      </p>
      <p class="no-result-suggestion">
        请检查拼写是否正确，或尝试搜索其他单词。
      </p>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">📚</div>
      <h3 class="empty-state-title">开始查询单词</h3>
      <p class="empty-state-text">
        在上方输入框中输入英文单词，或点击按钮识别截图中的单词，即可查看趣味记忆法。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'
import type { SearchResult } from '../types/word'
import { useClipboard } from '../composables/useClipboard'

// Props
interface Props {
  searchResult: SearchResult
  searchQuery: string
}

const props = defineProps<Props>()

// 使用剪贴板功能
const { copyToClipboard } = useClipboard()

// 本地状态
const isCopied = ref(false)

// 记忆法类型标签映射
const getMnemonicTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'phonetic': '谐音',
    'root': '词根',
    'association': '联想',
    'story': '故事',
    'visual': '图像',
    'compound': '组合'
  }
  return typeMap[type] || '其他'
}

// 解析Markdown内容
const parseMarkdown = (content: string): string => {
  try {
    const result = marked(content, { breaks: true })
    return typeof result === 'string' ? result : String(result)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return content
  }
}

// 复制单词
const copyWord = async () => {
  if (!props.searchResult.found || !props.searchResult.data) {
    return
  }
  
  try {
    await copyToClipboard(props.searchResult.data.word)
    isCopied.value = true
    
    // 2秒后重置状态
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.result-display {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.word-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.copy-button {
  padding: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.copy-button--copied {
  background: rgba(34, 197, 94, 0.8);
}

.word-content {
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.definition-section {
  margin-bottom: 24px;
}

.definition-text {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.mnemonic-section {
  margin-bottom: 24px;
}

.mnemonic-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.mnemonic-type--phonetic {
  background: #f59e0b;
}

.mnemonic-type--root {
  background: #10b981;
}

.mnemonic-type--association {
  background: #8b5cf6;
}

.mnemonic-type--story {
  background: #ef4444;
}

.mnemonic-type--visual {
  background: #06b6d4;
}

.mnemonic-type--compound {
  background: #84cc16;
}

.mnemonic-content {
  font-size: 15px;
  line-height: 1.7;
  color: #1f2937;
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
  border: 1px solid #f59e0b;
  position: relative;
}

.mnemonic-content::before {
  content: '💡';
  position: absolute;
  top: -8px;
  left: 16px;
  background: white;
  padding: 0 4px;
  font-size: 16px;
}

.example-section {
  margin-bottom: 0;
}

.example-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 8px 0;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 8px;
  border-left: 4px solid #64748b;
  font-style: italic;
}

.example-translation {
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #94a3b8;
}

/* 未找到结果 */
.no-result {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.no-result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-result-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.no-result-text {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px 0;
}

.no-result-suggestion {
  font-size: 14px;
  color: #4b5563;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #6b7280;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.empty-state-text {
  font-size: 16px;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
  color: #374151;
}

@media (max-width: 640px) {
  .word-header {
    padding: 16px 20px 12px;
  }
  
  .word-title {
    font-size: 24px;
  }
  
  .word-content {
    padding: 20px;
  }
  
  .empty-state {
    padding: 48px 20px;
  }
  
  .empty-state-icon {
    font-size: 48px;
  }
  
  .empty-state-title {
    font-size: 20px;
  }
}
</style>