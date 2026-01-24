import crypto from 'node:crypto';

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS Headers (虽然同源部署不需要，但在调试或跨域调用时有用)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const body = await request.json();
    const { audioData, len } = body;

    // 环境变量 (需要在 EdgeOne Pages 控制台配置)
    const SECRET_ID = env.TENCENT_SECRET_ID;
    const SECRET_KEY = env.TENCENT_SECRET_KEY;
    
    if (!SECRET_ID || !SECRET_KEY) {
      throw new Error('Missing SecretId or SecretKey in environment variables');
    }

    // 腾讯云 API 配置
    const endpoint = "asr.tencentcloudapi.com";
    const service = "asr";
    const region = "ap-shanghai";
    const action = "SentenceRecognition";
    const version = "2019-06-14";
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

    // 构造请求包体
    const payload = JSON.stringify({
      EngSerViceType: "16k_en",
      SourceType: 1,
      VoiceFormat: "wav",
      Data: audioData,
      DataLen: len,
      ProjectId: 0,
      SubServiceType: 2,
      UsrAudioKey: Math.random().toString(36).substr(2)
    });

    // ************* V3 签名逻辑 Start *************
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders = "content-type:application/json; charset=utf-8\nhost:" + endpoint + "\n";
    const signedHeaders = "content-type;host";
    const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
    const canonicalRequest = "POST" + "\n" +
      canonicalUri + "\n" +
      canonicalQueryString + "\n" +
      canonicalHeaders + "\n" +
      signedHeaders + "\n" +
      hashedRequestPayload;

    const algorithm = "TC3-HMAC-SHA256";
    const credentialScope = date + "/" + service + "/" + "tc3_request";
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = algorithm + "\n" +
      timestamp + "\n" +
      credentialScope + "\n" +
      hashedCanonicalRequest;

    const kDate = crypto.createHmac('sha256', "TC3" + SECRET_KEY).update(date).digest();
    const kService = crypto.createHmac('sha256', kDate).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update("tc3_request").digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorization = algorithm + " " +
      "Credential=" + SECRET_ID + "/" + credentialScope + ", " +
      "SignedHeaders=" + signedHeaders + ", " +
      "Signature=" + signature;
    // ************* V3 签名逻辑 End *************

    // 发起请求 (使用 fetch)
    const response = await fetch(`https://${endpoint}`, {
      method: 'POST',
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/json; charset=utf-8",
        "Host": endpoint,
        "X-TC-Action": action,
        "X-TC-Version": version,
        "X-TC-Timestamp": timestamp.toString(),
        "X-TC-Region": region
      },
      body: payload
    });

    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
