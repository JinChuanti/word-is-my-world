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
      // 默认为相对路径，自动适配 EdgeOne Pages / Vercel 等同源部署
      // 本地开发如果需要连接远程后端，请在 .env 中配置 VITE_API_URL
      const apiUrl = import.meta.env.VITE_API_URL || '/api/recognize';
      
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
      console.log('API Response:', data); // Debug log

      if (response.ok) {
        let text = '';
        // 适配腾讯云返回格式 { Response: { Result: "..." } }
        if (data.Response && data.Response.Result) {
          text = data.Response.Result;
        } 
        // 适配百度/旧格式 { result: ["..."] }
        else if (data.result && data.result.length > 0) {
          text = data.result[0];
        }
        // 腾讯云错误 { Response: { Error: { Message: "..." } } }
        else if (data.Response && data.Response.Error) {
           throw new Error(data.Response.Error.Message);
        }
        else {
           throw new Error(data.error || '识别结果为空');
        }

        // 移除末尾标点符号 (.,!?)
        result.value = text.replace(/[.,!?。，！？]+$/, '').trim();
        
      } else {
        throw new Error(data.error || '请求失败');
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
