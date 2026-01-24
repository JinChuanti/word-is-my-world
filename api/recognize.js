import * as tencentcloud from "tencentcloud-sdk-nodejs";

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 腾讯云配置
  const SECRET_ID = process.env.TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
  const REGION = 'ap-shanghai'; // 推荐就近地域

  try {
    const { audioData, len } = req.body;

    const AsrClient = tencentcloud.asr.v20190614.Client;
    const clientConfig = {
      credential: {
        secretId: SECRET_ID,
        secretKey: SECRET_KEY,
      },
      region: REGION,
      profile: {
        httpProfile: {
          endpoint: "asr.tencentcloudapi.com",
        },
      },
    };

    const client = new AsrClient(clientConfig);
    
    // 构造请求参数
    // EngSerViceType: 16k_en (英文引擎)
    // SourceType: 1 (本地语音数据上传)
    // VoiceFormat: wav
    const params = {
      EngSerViceType: "16k_en",
      SourceType: 1,
      VoiceFormat: "wav",
      Data: audioData, // Base64 数据
      DataLen: len // 字节长度
    };

    // 使用 Promise 包装 SDK 调用
    const result = await new Promise((resolve, reject) => {
      client.SentenceRecognition(params, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      });
    });

    // 腾讯云返回结构: { Result: "hello world" }
    return res.status(200).json({ result: [result.Result] });

  } catch (error) {
    console.error('Tencent ASR Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error
    });
  }
}