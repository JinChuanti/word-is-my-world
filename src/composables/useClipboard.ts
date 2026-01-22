import { ref } from 'vue'

export function useClipboard() {
  const isSupported = ref(false)
  const error = ref<string | null>(null)

  // 检查浏览器是否支持剪贴板API
  const checkSupport = () => {
    isSupported.value = !!(navigator.clipboard && navigator.clipboard.readText)
  }

  // 从剪贴板读取内容（支持文本和图片）
  const readClipboardItems = async (): Promise<{ type: 'text' | 'image' | 'unknown', data: string | Blob | null }> => {
    try {
      error.value = null;
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // 降级尝试 readText
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          return { type: 'text', data: text.trim() };
        }
        throw new Error('浏览器不支持剪贴板 API');
      }

      const items = await navigator.clipboard.read();
      for (const item of items) {
        // 优先检查图片
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          return { type: 'image', data: blob };
        }
        
        // 检查文本
        const textType = item.types.find(type => type.startsWith('text/plain'));
        if (textType) {
          const blob = await item.getType(textType);
          const text = await blob.text();
          return { type: 'text', data: text.trim() };
        }
      }
      
      return { type: 'unknown', data: null };
    } catch (err) {
      // 如果 read() 失败（可能是权限问题），回退到 readText()
      try {
        const text = await navigator.clipboard.readText();
        return { type: 'text', data: text.trim() };
      } catch (textErr) {
         const errorMessage = err instanceof Error ? err.message : '读取剪贴板失败';
         error.value = errorMessage;
         console.error('Failed to read from clipboard:', err);
         throw new Error(errorMessage);
      }
    }
  };

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

  // 传统的粘贴文本方法（为了兼容性保留）
  const pasteFromClipboard = async (): Promise<string> => {
    const result = await readClipboardItems();
    if (result.type === 'text' && typeof result.data === 'string') {
      return result.data;
    }
    return '';
  }

  // 初始化检查支持性
  checkSupport()

  return {
    isSupported,
    error,
    pasteFromClipboard,
    readClipboardItems,
    copyToClipboard,
    checkSupport
  }
}