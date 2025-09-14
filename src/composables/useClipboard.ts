import { ref } from 'vue'

export function useClipboard() {
  const isSupported = ref(false)
  const error = ref<string | null>(null)

  // 检查浏览器是否支持剪贴板API
  const checkSupport = () => {
    isSupported.value = !!(navigator.clipboard && navigator.clipboard.readText)
  }

  // 从剪贴板读取文本
  const pasteFromClipboard = async (): Promise<string> => {
    try {
      error.value = null
      
      if (!isSupported.value) {
        throw new Error('浏览器不支持剪贴板API')
      }

      const text = await navigator.clipboard.readText()
      return text.trim()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '读取剪贴板失败'
      error.value = errorMessage
      console.error('Failed to read from clipboard:', err)
      throw new Error(errorMessage)
    }
  }

  // 写入文本到剪贴板
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      error.value = null
      
      if (!isSupported.value) {
        throw new Error('浏览器不支持剪贴板API')
      }

      await navigator.clipboard.writeText(text)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '写入剪贴板失败'
      error.value = errorMessage
      console.error('Failed to write to clipboard:', err)
      throw new Error(errorMessage)
    }
  }

  // 初始化检查支持性
  checkSupport()

  return {
    isSupported,
    error,
    pasteFromClipboard,
    copyToClipboard,
    checkSupport
  }
}