// 简单的 WAV 编码器
function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function downsampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number) {
  if (outSampleRate === sampleRate) {
    return buffer;
  }
  if (outSampleRate > sampleRate) {
    // 如果目标采样率更高，我们不做处理，直接返回原数据（虽然不推荐，但为了不崩溃）
    // 正常录音麦克风通常是 44100 或 48000，肯定大于 16000
    console.warn('Input sample rate is lower than target sample rate', sampleRate, outSampleRate);
    return buffer; 
  }
  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioInput: MediaStreamAudioSourceNode | null = null;
  private chunks: Float32Array[] = [];
  private recordingLength = 0;

  async start() {
    this.chunks = [];
    this.recordingLength = 0;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 创建音频源
    this.audioInput = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // 创建处理器 (bufferSize, inputChannels, outputChannels)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);
      this.chunks.push(new Float32Array(channelData));
      this.recordingLength += channelData.length;
    };

    this.audioInput.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async stop(): Promise<{ blob: Blob, base64: string, len: number }> {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.processor && this.audioInput) {
      this.audioInput.disconnect();
      this.processor.disconnect();
    }
    if (this.audioContext) {
      await this.audioContext.close();
    }

    // 合并 buffer
    const mergedBuffers = new Float32Array(this.recordingLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      mergedBuffers.set(chunk, offset);
      offset += chunk.length;
    }

    // 降采样到 16000Hz
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const downsampledBuffer = downsampleBuffer(mergedBuffers, sampleRate, 16000);
    
    // 编码为 WAV
    const wavBuffer = encodeWAV(downsampledBuffer, 16000);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    // 转换为 Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        // 百度 ASR 需要原始 PCM 长度（字节数）或者 WAV 文件长度
        // 这里 wavBuffer.byteLength 是包含 WAV 头的总长度
        resolve({ blob, base64, len: wavBuffer.byteLength });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
