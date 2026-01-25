<script setup lang="ts">
import { watch } from 'vue'
import SearchBox from './components/SearchBox.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import VoiceButton from './components/VoiceButton.vue'
import { useWordSearch } from './composables/useWordSearch'

// 使用单词搜索逻辑
const { 
  searchQuery, 
  currentSearchResult: searchResult, // 修正：useWordSearch 返回的是 currentSearchResult
  loadWordsData, 
  isLoading: isDataLoading, 
  error: dataError 
} = useWordSearch()

// 处理语音搜索
const handleVoiceSearch = (text: string) => {
  if (text && text.trim()) {
    searchQuery.value = text.trim()
  }
}

// 重新加载数据
const retryLoad = () => {
  loadWordsData()
}

// 监听搜索查询变化，实现实时搜索
watch(searchQuery, (newQuery) => {
  // 实时搜索已经在 useWordSearch 的 currentSearchResult 计算属性中实现
  console.log('搜索查询变化:', newQuery)
})
</script>

<template>
  <div class="app">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>

    <div class="container">
      <!-- 头部 -->
      <header class="app-header">
        <h1 class="app-title">
          <span class="title-icon">📚</span>
          考研单词趣记法查询工具
        </h1>
        <p class="app-subtitle">让记单词变得更有趣 · 覆盖26考研红宝书所有单词</p>
      </header>

      <!-- 主要内容 -->
      <main class="app-main">
        <!-- 搜索区域 (吸顶) -->
        <div class="search-section">
          <SearchBox
            v-model="searchQuery"
            :words-data="[]"
            @clear="searchQuery = ''"
          />
          
          <div class="voice-section">
            <VoiceButton
              @search="handleVoiceSearch"
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="isDataLoading" class="loading-section">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在加载单词库...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="dataError" class="error-section">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">数据加载失败</h3>
            <p class="error-message">{{ dataError }}</p>
            <button @click="retryLoad" class="retry-button">重试</button>
          </div>
        </div>

        <!-- 搜索结果 -->
        <ResultDisplay
          v-else
          :search-result="searchResult"
          :search-query="searchQuery"
          @search="searchQuery = $event"
        />
      </main>

      <!-- 底部 -->
      <footer class="app-footer">
        <p>&copy; 2025 考研单词趣记法查询工具 | 让学习更高效</p>
        <p class="author">23计算机1金传体 作品</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 移除 OCR Overlay 样式 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}


.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
}

.app-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 0;
  font-weight: 300;
}

/* 主要内容 */
.app-main {
  flex: 1;
  padding: 40px 0;
}

.search-section {
  position: sticky;
  top: 20px;
  z-index: 100;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.paste-section {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.voice-section {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-text {
  color: white;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-section {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.error-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 12px 0;
}

.error-message {
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* 结果区域 */
.result-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页脚 */
.app-footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
  margin-top: auto;
}

.footer-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 14px;
}

.footer-author {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0 0;
  font-size: 12px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 24px;
    flex-direction: column;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 14px;
  }
  
  .app-main {
    padding: 30px 0;
  }
  
  .container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 20px 0;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .error-card {
    padding: 30px 20px;
  }
}
</style>
