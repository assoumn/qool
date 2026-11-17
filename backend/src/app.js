import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { ApiError, validateInput } from './veo.js';

const TTL = 60 * 60 * 1000;
export function createApp({ client, enabled, model, origin = 'http://localhost:5173', now = Date.now }) {
  // Local, single-user prototype. Never expose this server publicly without user
  // authentication, durable job ownership/storage, and per-user spending limits.
  const jobs = new Map();
  let submitting = false;
  let lastSubmission = -Infinity;
  function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); }
  function publicJob(id, job) { return { id, status: job.status, error: job.error, videoUrl: job.status === 'succeeded' ? `/api/videos/${id}/content` : undefined }; }
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Requests from the Vite proxy retain the browser Origin. Other origins cannot spend credits.
    if (req.headers.origin && req.headers.origin !== origin) return json(res, 403, { error: 'This origin is not allowed.' });
    const allowedHosts = new Set([new URL(origin).host, `127.0.0.1:${req.socket.localPort}`, `localhost:${req.socket.localPort}`]);
    if (!allowedHosts.has(req.headers.host)) return json(res, 403, { error: 'This host is not allowed.' });
    const path = req.url?.split('?')[0];
    try {
      for (const [id, job] of jobs) if (now() - job.created > TTL) jobs.delete(id);
      if (path === '/api/video-config' && req.method === 'GET') return json(res, 200, {
        enabled: !!(enabled && client), model, durationSeconds: 8,
        message: enabled && client ? 'Veo generation is enabled. Requests may consume credits or incur charges.' : 'Veo is not enabled. Configure the backend project, credentials, model access, and credit coverage first.',
      });
      if (path === '/api/videos' && req.method === 'POST') {
        if (req.headers.origin !== origin) throw new ApiError(403, 'A same-origin browser request is required.');
        if (!enabled || !client) throw new ApiError(503, 'Veo generation is not configured or enabled.');
        if (submitting || [...jobs.values()].some(job => job.status === 'running')) throw new ApiError(409, 'A generation is already active. Wait for it or check the existing job.');
        if (now() - lastSubmission < 30000) throw new ApiError(429, 'Wait at least 30 seconds before starting another generation.');
        if (!req.headers['content-type']?.startsWith('application/json')) throw new ApiError(415, 'JSON is required.');
        submitting = true;
        try {
          const chunks = []; let size = 0;
          for await (const chunk of req) { size += chunk.length; if (size > 15 * 1024 * 1024) throw new ApiError(413, 'Upload too large.'); chunks.push(chunk); }
          let input;
          try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ApiError(400, 'Invalid JSON.'); }
          if (input.confirmCost !== true) throw new ApiError(400, 'Confirm that this request may use credits or incur charges.');
          validateInput(input);
          lastSubmission = now();
          const operation = await client.start(input);
          // Bound prototype memory: retain at most three completed/running videos.
          if (jobs.size >= 3) {
            const oldest = [...jobs].find(([, job]) => job.status !== 'running');
            if (oldest) jobs.delete(oldest[0]);
          }
          const id = randomUUID();
          const job = { operation, status: 'running', created: now(), lastPoll: -Infinity };
          jobs.set(id, job);
          return json(res, 202, publicJob(id, job));
        } finally { submitting = false; }
      }
      const match = path?.match(/^\/api\/videos\/([a-f0-9-]{36})(\/content)?$/);
      if (match && req.method === 'GET') {
        const id = match[1]; const job = jobs.get(id);
        if (!job) throw new ApiError(404, 'This local job expired or the backend restarted. Check Google Cloud before submitting again.');
        if (match[2]) {
          if (job.status !== 'succeeded') throw new ApiError(409, 'Video is not ready.');
          res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': job.video.length, 'Content-Disposition': 'inline; filename="qool-veo-video.mp4"', 'Cache-Control': 'no-store' });
          return res.end(job.video);
        }
        if (job.status === 'running' && !job.polling && now() - job.lastPoll >= 10000) {
          job.lastPoll = now(); job.polling = true;
          try { Object.assign(job, await client.poll(job.operation)); } finally { job.polling = false; }
        }
        return json(res, 200, publicJob(id, job));
      }
      throw new ApiError(404, 'Not found.');
    } catch (error) { json(res, error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.message : 'The backend encountered an unexpected error.' }); }
  });
}
