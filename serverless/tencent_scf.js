const tencentcloud = require("tencentcloud-sdk-nodejs");

exports.main_handler = async (event, context) => {
  // 处理 API 网关触发的 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const SECRET_ID = process.env.TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
  const REGION = 'ap-shanghai';

  try {
    const body = JSON.parse(event.body);
    const { audioData, len } = body;

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
    
    const params = {
      EngSerViceType: "16k_en",
      SourceType: 1,
      VoiceFormat: "wav",
      Data: audioData,
      DataLen: len
    };

    const result = await new Promise((resolve, reject) => {
      client.SentenceRecognition(params, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      });
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ result: [result.Result] })
    };

  } catch (error) {
    console.error('Tencent ASR Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: error
      })
    };
  }
};
