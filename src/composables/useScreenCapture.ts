import { ref } from 'vue';

export function useScreenCapture() {
  const isCapturing = ref(false);
  const captureError = ref<string | null>(null);

  /**
   * 捕获当前屏幕截图
   * 注意：这会调用浏览器原生的屏幕分享 API，用户需要手动选择分享整个屏幕
   */
  const captureScreen = async (): Promise<Blob | null> => {
    isCapturing.value = true;
    captureError.value = null;

    try {
      // 请求屏幕共享权限
      // video: true 请求视频流
      // audio: false 不需要音频
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // 提示浏览器用户可能想要分享整个屏幕
          // 注意：这是一个提示属性，浏览器可能会忽略，且无法跳过用户确认步骤
          displaySurface: 'monitor',
          // 尝试获取较高的分辨率
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 1 } // 我们只需要一帧，帧率低一点没关系
        },
        audio: false,
        // @ts-ignore - 这些是较新的实验性参数，TS 类型可能尚未更新
        systemAudio: 'exclude',      // 不捕获系统音频
        selfBrowserSurface: 'exclude', // 尝试不包含当前标签页
        surfaceSwitching: 'include'  // 允许用户动态切换源
      } as DisplayMediaStreamOptions);

      // 获取视频轨道
      const videoTrack = stream.getVideoTracks()[0];
      
      if (!videoTrack) {
        throw new Error('无法获取视频轨道');
      }

      // 创建一个隐藏的 video 元素来播放流
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true; // iOS 兼容性，虽然这里是 PC

      return new Promise<Blob | null>((resolve, reject) => {
        // 当视频元数据加载完成后
        video.onloadedmetadata = () => {
          video.play().then(() => {
            // 给一点时间让视频流稳定（有时候第一帧是黑屏）
            setTimeout(() => {
              try {
                // 创建 Canvas 绘制当前帧
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  throw new Error('无法创建 Canvas 上下文');
                }

                // 将视频帧绘制到 Canvas 上
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 停止所有轨道，释放摄像头/屏幕资源
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null; // 断开连接

                // 将 Canvas 内容转换为 Blob
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Canvas 导出图片失败'));
                  }
                }, 'image/png');
                
              } catch (err) {
                // 确保发生错误时也关闭流
                stream.getTracks().forEach(track => track.stop());
                reject(err);
              }
            }, 300); // 延迟 300ms 截取
          }).catch(reject);
        };

        video.onerror = (err) => {
          stream.getTracks().forEach(track => track.stop());
          reject(err);
        };
      });

    } catch (err) {
      // 用户取消选择（NotAllowedError）或 API 不支持
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          // 用户点了取消，不算系统错误，返回 null
          console.log('用户取消了屏幕分享');
          return null;
        }
        captureError.value = err.message;
      } else {
        captureError.value = '屏幕捕获发生未知错误';
      }
      console.error('Screen capture failed:', err);
      return null;
    } finally {
      isCapturing.value = false;
    }
  };

  return {
    captureScreen,
    isCapturing,
    captureError
  };
}
