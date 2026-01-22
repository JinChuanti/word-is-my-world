import { createWorker } from 'tesseract.js';
import { ref } from 'vue';

export function useOCR() {
  const isRecognizing = ref(false);
  const error = ref<string | null>(null);
  const progress = ref(0);

  // 识别图片中的文字
  const recognizeImage = async (imageBlob: Blob): Promise<string> => {
    isRecognizing.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            progress.value = m.progress;
          }
        }
      });
      
      const ret = await worker.recognize(imageBlob);
      await worker.terminate();
      
      return ret.data.text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR识别失败';
      error.value = msg;
      console.error('OCR Error:', err);
      throw new Error(msg);
    } finally {
      isRecognizing.value = false;
    }
  };

  // 从识别结果中提取第一个有效的英文单词
  const extractWord = (text: string): string | null => {
    // 匹配连续的英文字符（忽略短于2个字符的，除非是 I 或 a）
    // 简单的正则匹配：找出最长的一个单词，或者是第一个看起来像单词的
    // 考虑到截图可能包含噪音，我们查找第一个长度 > 1 的单词
    const words = text.match(/[a-zA-Z]{2,}/g);
    if (words && words.length > 0) {
      // 优先返回第一个单词，通常截图是截取单词区域
      return words[0].toLowerCase();
    }
    return null;
  };

  return {
    recognizeImage,
    extractWord,
    isRecognizing,
    error,
    progress
  };
}
