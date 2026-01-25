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

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1 // deletion
            )
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  // 搜索单词
  const searchWord = (query: string): SearchResult => {
    if (!query.trim()) {
      return { found: false }
    }

    const normalizedQuery = query.trim().toLowerCase()
    const foundWord = wordsData.value.find(
      word => word.word.toLowerCase() === normalizedQuery
    )

    if (foundWord) {
      return { found: true, data: foundWord }
    }

    // Fuzzy search logic: Find suggestions
    const suggestions = wordsData.value
      .map(word => ({
        word,
        distance: levenshteinDistance(normalizedQuery, word.word.toLowerCase())
      }))
      .filter(item => {
        // 允许的编辑距离：单词越长，容错率越高
        const maxDistance = Math.max(2, Math.floor(normalizedQuery.length / 3));
        return item.distance <= maxDistance;
      }) 
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 5) // Take top 5
      .map(item => item.word);

    return { found: false, suggestions }
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