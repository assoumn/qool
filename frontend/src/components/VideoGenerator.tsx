import { useEffect, useState } from 'react';
import type { Workflow } from '../state/workflow';
import { getVideoConfig, getVideoJob, startVideo, type VideoJob, type VideoConfig } from '../services/veoService';

const jobKey = 'qool-veo-job';
function restoreJob(): VideoJob | null {
  try { const job = JSON.parse(sessionStorage.getItem(jobKey) || 'null'); return job && typeof job.id === 'string' ? job : null; } catch { return null; }
}
export default function VideoGenerator({ data }: { data: Workflow }) {
  const [config, setConfig] = useState<VideoConfig | null>(null);
  const [job, setJob] = useState<VideoJob | null>(restoreJob);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [configAttempt, setConfigAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getVideoConfig(controller.signal).then(setConfig).catch(() => {
      if (!controller.signal.aborted) setError('The video backend is unavailable. Start it in a separate terminal, then check the connection again.');
    });
    return () => controller.abort();
  }, [configAttempt]);
  useEffect(() => {
    try { if (job) sessionStorage.setItem(jobKey, JSON.stringify(job)); else sessionStorage.removeItem(jobKey); } catch { /* Current tab still keeps its job in memory. */ }
  }, [job]);
  const jobId = job?.id;
  const jobStatus = job?.status;
  useEffect(() => {
    if (!jobId || jobStatus !== 'running' || paused) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const updated = await getVideoJob(jobId!, controller.signal);
        if (!controller.signal.aborted) {
          setJob(updated);
          if (updated.status === 'running') timer = setTimeout(poll, 10000);
        }
      } catch (cause) {
        if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Could not check generation status.'); setPaused(true); }
      }
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [jobId, jobStatus, paused]); // Poll one submitted job; never submit automatically.

  async function generate() {
    setSubmitting(true); setError('');
    try { setJob(await startVideo(data)); setPaused(false); }
    catch (cause) { setError((cause instanceof Error ? cause.message : 'Generation could not be started.') + ' Submission was not confirmed. Check Google Cloud before trying again; a request may already be running.'); }
    finally { setSubmitting(false); }
  }
  return <section aria-label="Veo video generation" className="mt-8 rounded-[24px] border border-[#DDD8D0] bg-white p-6">
    <h2 className="text-xl font-bold">Generate video inside Qool</h2>
    <p className="mt-3 text-sm">Uses the official Google Veo API, separate from the Google Flow website. An 8-second video with generated speech is requested. Uploaded audio is not sent. Lebanese pronunciation, identity preservation, and lip synchronization depend on the model.</p>
    <p role="status" className="mt-3">{config ? config.message : 'Checking video backend…'}</p>
    {config && <p className="mt-2 text-sm">Configured model: {config.model}. Enabled does not confirm Google access or credits.</p>}
    {(!config || !config.enabled) && <button className="mt-3 font-semibold underline" onClick={() => { setError(''); setConfigAttempt(value => value + 1); }}>Check connection again</button>}
    {!job && <>
      <label className="mt-5 flex items-start gap-3"><input className="mt-1" type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>I understand that this sends my portrait and dialogue to Google and may consume trial credits or incur charges. I have verified my project’s access and credit coverage.</span></label>
      <button disabled={!config?.enabled || !confirmed || submitting} onClick={generate} className="mt-5 rounded-full bg-qool-orange px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Submitting to Google…' : 'Generate video with Veo'}</button>
    </>}
    {job?.status === 'running' && <div className="mt-5"><p role="status">Google accepted the request. Waiting for the video; no completion percentage is available. You can refresh this tab to reconnect.</p><p className="mt-2 text-sm">Job: {job.id}</p>{paused && <button className="mt-3 underline" onClick={() => { setError(''); setPaused(false); }}>Resume status checks</button>}</div>}
    {job?.status === 'succeeded' && <div className="mt-5"><h3 className="font-bold">Your submitted video is ready</h3><p className="mt-2 text-sm">This is the result of your submitted request. Editing your draft does not change this video. Local videos expire after one hour or when the backend restarts.</p><video controls playsInline src={job.videoUrl} className="mt-4 w-full rounded-2xl" onError={() => setError('The local video is unavailable. The job may have expired or the backend may have restarted.')} /><a href={job.videoUrl} download="qool-veo-video.mp4" className="mt-4 inline-block rounded-full bg-qool-orange px-8 py-3 font-semibold text-white">Download video</a></div>}
    {job?.status === 'failed' && <p role="alert" className="mt-4 text-red-700">{job.error}</p>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {job && <button className="mt-4 underline" onClick={() => {
      if (window.confirm('Forget this local job? This does not cancel Google generation or charges. Download any completed video and check Google Cloud before submitting again.')) { setJob(null); setError(''); setPaused(false); setConfirmed(false); }
    }}>Forget local job</button>}
  </section>;
}
