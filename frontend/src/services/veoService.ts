import type { Workflow } from '../state/workflow';
import { generateFlowPrompt } from './flowPromptService';

export interface VideoJob { id: string; status: 'running' | 'succeeded' | 'failed'; error?: string; videoUrl?: string }
export interface VideoConfig { enabled: boolean; model: string; durationSeconds: number; message: string }
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(135000) });
  let body;
  try { body = await response.json(); } catch { throw new Error('The video backend is unavailable. Start it in a separate terminal.'); }
  if (!response.ok) throw new Error(body.error || 'The video request failed.');
  return body as T;
}
export function getVideoConfig(signal?: AbortSignal) { return request<VideoConfig>('/api/video-config', { signal }); }
export function getVideoJob(id: string, signal?: AbortSignal) { return request<VideoJob>(`/api/videos/${encodeURIComponent(id)}`, { signal }); }
export async function startVideo(data: Workflow): Promise<VideoJob> {
  // Resolve only locally selected images; never pass a remote URL for the server to fetch.
  if (!data.portrait.startsWith('data:image/') && !data.portrait.startsWith('/assets/images/')) throw new Error('Please reselect a local portrait.');
  const response = await fetch(data.portrait);
  if (!response.ok) throw new Error('The selected portrait could not be read.');
  const image = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the portrait.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(image);
  });
  const prompt = generateFlowPrompt(data)
    .replace(/Create a photorealistic talking-head video[^\n]+/, 'Create an 8-second photorealistic talking-head video using the attached portrait as the starting image. Preserve the subject’s identity.')
    .replace(/Choose a clip duration[^\n]+/, 'The clip is 8 seconds. Speak the exact dialogue naturally within the available duration; do not add or rewrite words.');
  return request<VideoJob>('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, image: { mimeType: image.type, bytesBase64Encoded: dataUrl.split(',')[1] }, confirmCost: true }) });
}
