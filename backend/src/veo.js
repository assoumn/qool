export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function validateInput(input) {
  if (!input || typeof input !== 'object') throw new ApiError(400, 'Invalid generation request.');
  if (typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > 16000) {
    throw new ApiError(400, 'A prompt of 1–16000 characters is required.');
  }
  const image = input.image;
  if (!image || !['image/jpeg', 'image/png'].includes(image.mimeType) || typeof image.bytesBase64Encoded !== 'string') {
    throw new ApiError(400, 'A JPG or PNG portrait is required.');
  }
  const base64 = image.bytesBase64Encoded;
  if (!base64 || base64.length > 14 * 1024 * 1024 || (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64))) {
    throw new ApiError(400, 'Invalid portrait encoding or image too large.');
  }
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length > 10 * 1024 * 1024) throw new ApiError(413, 'Maximum portrait size is 10 MB.');
  const valid = image.mimeType === 'image/png'
    ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!valid) throw new ApiError(400, 'The portrait content does not match its image type.');
  return { prompt: input.prompt, image: { mimeType: image.mimeType, bytesBase64Encoded: base64 } };
}

export function createVeoClient({ project, location, model, getToken, fetchImpl = fetch }) {
  for (const [name, value] of Object.entries({ project, location, model })) {
    if (!value || !/^[a-zA-Z0-9._-]+$/.test(value)) throw new Error(`Invalid ${name} configuration.`);
  }
  const modelPath = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/${modelPath}`;
  async function call(method, body) {
    let token;
    try { token = await getToken(); } catch { throw new ApiError(503, 'Google authentication failed. Configure server-side Application Default Credentials.'); }
    if (!token) throw new ApiError(503, 'Google authentication is unavailable.');
    let response;
    try {
      response = await fetchImpl(`${endpoint}:${method}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(120000),
      });
    } catch { throw new ApiError(502, 'Google could not be reached. Check the existing job before starting another generation.'); }
    if (!response.ok) {
      // Never expose upstream response bodies, credentials, or internal request details.
      const messages = {
        400: 'Google rejected the request. Check image, prompt, model parameters, and content restrictions.',
        401: 'Google authentication was rejected. Refresh the backend credentials.',
        403: 'Google denied access. Check Vertex AI permissions, model access, billing, and trial eligibility.',
        404: 'The configured Veo model or region is unavailable for this project.',
        429: 'Google quota is exhausted. Check project quota before retrying.',
      };
      throw new ApiError(response.status === 429 ? 429 : 502, messages[response.status] || 'Google video generation is temporarily unavailable.');
    }
    try { return await response.json(); } catch { throw new ApiError(502, 'Google returned an invalid response.'); }
  }
  return {
    async start(input) {
      const { prompt, image } = validateInput(input);
      const result = await call('predictLongRunning', {
        instances: [{ prompt, image }],
        parameters: { sampleCount: 1, durationSeconds: 8, aspectRatio: '16:9', resolution: '720p', generateAudio: true, personGeneration: 'allow_adult' },
      });
      if (typeof result.name !== 'string' || !result.name.startsWith(`${modelPath}/operations/`)) {
        throw new ApiError(502, 'Google did not return a valid generation operation. Do not immediately resubmit; inspect your Google project first.');
      }
      return result.name;
    },
    async poll(operationName) {
      if (typeof operationName !== 'string' || !operationName.startsWith(`${modelPath}/operations/`)) throw new ApiError(400, 'Invalid operation.');
      const result = await call('fetchPredictOperation', { operationName });
      if (!result.done) return { status: 'running' };
      if (result.error) return { status: 'failed', error: 'Google could not generate this video. Check model access, input, or content restrictions in your project.' };
      const video = result.response?.videos?.[0];
      if (!video?.bytesBase64Encoded || video.mimeType !== 'video/mp4') {
        return { status: 'failed', error: 'Google returned no downloadable MP4. The request may have been filtered or this model may require a different output configuration.' };
      }
      if (video.bytesBase64Encoded.length > 90 * 1024 * 1024) return { status: 'failed', error: 'The video exceeds the local prototype download limit.' };
      return { status: 'succeeded', video: Buffer.from(video.bytesBase64Encoded, 'base64') };
    },
  };
}
