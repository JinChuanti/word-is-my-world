import { ref, computed, onMounted, shallowRef } from 'vue'
import type { WordData, SearchResult } from '../types/word'

export function useWordSearch() {
  // 响应式数据 - 使用 shallowRef 优化大数据量性能，避免深度响应式转换
  const wordsData = shallowRef<WordData[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 加载单词数据
  const loadWordsData = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch('/words.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      // 冻结数据对象，进一步提升性能并防止意外修改
      wordsData.value = Object.freeze(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载数据失败'
      console.error('Failed to load words data:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 搜索单词
  const searchWord = (query: string): SearchResult => {
    if (!query.trim()) {
      return { found: false }
    }

    const normalizedQuery = query.trim().toLowerCase()
    const foundWord = wordsData.value.find(
      word => word.word.toLowerCase() === normalizedQuery
    )

    return foundWord 
      ? { found: true, data: foundWord }
      : { found: false }
  }

  // 计算属性：当前搜索结果
  const currentSearchResult = computed(() => {
    return searchWord(searchQuery.value)
  })

  // 设置搜索查询
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  // 清空搜索
  const clearSearch = () => {
    searchQuery.value = ''
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadWordsData()
  })

  return {
    // 状态
    wordsData,
    searchQuery,
    isLoading,
    error,
    
    // 计算属性
    currentSearchResult,
    
    // 方法
    loadWordsData,
    searchWord,
    setSearchQuery,
    clearSearch
  }
}