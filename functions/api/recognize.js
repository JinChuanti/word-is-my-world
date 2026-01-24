export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const body = await request.json();
    const { audioData, len } = body;

    const SECRET_ID = env.TENCENT_SECRET_ID;
    const SECRET_KEY = env.TENCENT_SECRET_KEY;
    
    if (!SECRET_ID || !SECRET_KEY) {
      throw new Error('Missing SecretId or SecretKey in environment variables');
    }

    const endpoint = "asr.tencentcloudapi.com";
    const service = "asr";
    const region = "ap-shanghai";
    const action = "SentenceRecognition";
    const version = "2019-06-14";
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

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

    // Helper functions for Web Crypto API (Standard Edge Runtime Compatible)
    async function sha256Hex(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function hmac(key, message) {
      const encoder = new TextEncoder();
      const keyData = (typeof key === 'string') ? encoder.encode(key) : key;
      const algorithm = { name: 'HMAC', hash: 'SHA-256' };
      const importedKey = await crypto.subtle.importKey('raw', keyData, algorithm, false, ['sign']);
      return await crypto.subtle.sign(algorithm, importedKey, encoder.encode(message));
    }

    function bufferToHex(buffer) {
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ************* V3 Signature Logic (Web Crypto) *************
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders = "content-type:application/json; charset=utf-8\nhost:" + endpoint + "\n";
    const signedHeaders = "content-type;host";
    const hashedRequestPayload = await sha256Hex(payload);
    const canonicalRequest = "POST" + "\n" +
      canonicalUri + "\n" +
      canonicalQueryString + "\n" +
      canonicalHeaders + "\n" +
      signedHeaders + "\n" +
      hashedRequestPayload;

    const algorithm = "TC3-HMAC-SHA256";
    const credentialScope = date + "/" + service + "/" + "tc3_request";
    const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
    const stringToSign = algorithm + "\n" +
      timestamp + "\n" +
      credentialScope + "\n" +
      hashedCanonicalRequest;

    const kDate = await hmac("TC3" + SECRET_KEY, date);
    const kService = await hmac(kDate, service);
    const kSigning = await hmac(kService, "tc3_request");
    const signatureBuffer = await hmac(kSigning, stringToSign);
    const signature = bufferToHex(signatureBuffer);

    const authorization = algorithm + " " +
      "Credential=" + SECRET_ID + "/" + credentialScope + ", " +
      "SignedHeaders=" + signedHeaders + ", " +
      "Signature=" + signature;
    // ************* End V3 Signature *************

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
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
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
