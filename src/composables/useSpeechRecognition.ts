import { ref, onUnmounted } from 'vue'
import { AudioRecorder } from '../utils/audioRecorder'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const result = ref('')
  const error = ref<string | null>(null)
  const isSupported = ref(false)
  const isProcessing = ref(false) // 新增：正在处理（上传/识别）状态

  let recorder: AudioRecorder | null = null

  // 初始化检查
  // @ts-ignore
  if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    isSupported.value = true
    recorder = new AudioRecorder()
  } else {
    error.value = '您的浏览器不支持录音功能'
  }

  const startListening = async () => {
    if (!isSupported.value || !recorder) return
    
    try {
      isListening.value = true
      error.value = null
      result.value = ''
      isProcessing.value = false
      
      await recorder.start()
    } catch (e) {
      console.error('Failed to start recording', e)
      isListening.value = false
      error.value = '无法启动录音，请检查麦克风权限'
    }
  }

  const stopListening = async () => {
    if (!isSupported.value || !recorder || !isListening.value) return
    
    try {
      isListening.value = false
      isProcessing.value = true
      
      const { base64, len } = await recorder.stop()
      
      // 调用 API
       // 优先使用环境变量 VITE_API_URL
       // 如果未配置 VITE_API_URL 且在生产环境，则尝试回退到 Vercel (但在非 Vercel 环境下会超时)
       // 强烈建议在非 Vercel 部署时配置 VITE_API_URL
       const defaultUrl = import.meta.env.DEV ? '/api/recognize' : 'https://word-is-my-world.vercel.app/api/recognize';
       const apiUrl = import.meta.env.VITE_API_URL || defaultUrl;
       
       if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
         console.warn('⚠️ 未检测到 VITE_API_URL 环境变量。正在尝试连接 Vercel 后端。如果您的前端部署在腾讯云或其他平台，这可能会导致连接超时。请配置 VITE_API_URL 指向您的腾讯云 SCF 地址。');
       }
       
       const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioData: base64,
          len: len
        })
      })

      const data = await response.json()
      
      if (response.ok && data.result) {
        // 百度返回的是数组，取第一个结果
        result.value = data.result[0]
      } else {
        throw new Error(data.error || '识别失败')
      }
      
    } catch (e) {
      console.error('Recognition failed', e)
      error.value = '识别失败，请重试'
    } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(() => {
    if (recorder && isListening.value) {
      recorder.stop().catch(() => {})
    }
  })

  return {
    isListening,
    isProcessing, // 暴露给组件用于显示加载状态
    result,
    error,
    isSupported,
    startListening,
    stopListening
  }
}
