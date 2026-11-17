import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Download, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import { useWorkflow } from '../state/workflow';
import { FLOW_URL, generateFlowPrompt } from '../services/flowPromptService';

export default function VideoReady() {
  const navigate = useNavigate();
  const { data, reset } = useWorkflow();
  const [status, setStatus] = useState('');
  if (!data.portrait) return <Navigate to="/upload" replace />;
  if (!data.dialogue.trim()) return <Navigate to="/add-text" replace />;
  const prompt = generateFlowPrompt(data);
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus('Prompt copied.');
    } catch {
      setStatus('Clipboard access is unavailable. Select and copy the prompt above, or download the text file.');
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([prompt], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qool-google-flow-prompt.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="min-h-screen bg-qool-background"><Header />
    <main className="mx-auto max-w-[900px] px-6 pb-20">
      <section className="mt-16">
        <CheckCircle2 size={48} className="mx-auto text-qool-orange" strokeWidth={1.5} />
        <h1 className="mt-5 text-center text-4xl font-bold">Your prompt is ready!</h1>
        <p className="mt-3 text-center text-qool-muted">Copy this prompt and upload the same portrait in Google Flow to create your video.</p>
        <div className="mt-8 grid gap-6 rounded-[26px] border border-[#DDD8D0] bg-white p-6 sm:grid-cols-[180px_1fr]">
          <img src={data.portrait} alt="Selected portrait" className="max-h-60 w-full rounded-2xl object-contain" />
          <div className="min-w-0"><h2 className="font-bold">Exact dialogue</h2><p dir="auto" className="mt-3 whitespace-pre-wrap break-words">{data.dialogue}</p></div>
        </div>
        {data.audio && <p className="mt-4">Retained recording: <bdi>{data.audio.name}</bdi>. It remains in your local draft; it is not attached to this prompt or sent to Flow.</p>}
        <label htmlFor="flow-prompt" className="mt-8 block text-xl font-bold">Google Flow prompt</label>
        <textarea id="flow-prompt" dir="auto" readOnly value={prompt} className="mt-3 min-h-[400px] w-full rounded-2xl border border-[#DDD8D0] bg-white p-5 leading-7" />
        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={copy} className="flex items-center gap-2 rounded-full bg-qool-orange px-7 py-3 font-semibold text-white"><Copy size={18} />Copy Prompt</button>
          <button onClick={download} className="flex items-center gap-2 rounded-full border border-[#DDD8D0] px-7 py-3 font-semibold"><Download size={18} />Download Prompt (.txt)</button>
          <a href={FLOW_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-[#DDD8D0] px-7 py-3 font-semibold"><ExternalLink size={18} />Open Google Flow</a>
        </div>
        <p role="status" className="mt-3">{status}</p>
        <div className="mt-8 rounded-[24px] bg-qool-peach p-7">
          <h2 className="text-xl font-bold">Create your video in Google Flow</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            <li>Open Google Flow.</li><li>Upload the same portrait as a reference.</li><li>Choose an appropriate available video-generation model.</li><li>Paste the generated prompt.</li><li>Generate the video.</li><li>Download the resulting video from Google Flow.</li>
          </ol>
          <p className="mt-4 text-sm">Available models, access, costs, and clip limits are determined by Google Flow. Lip synchronization and exact voice control are not guaranteed.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <button onClick={() => navigate('/generate')} className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold">Back to review</button>
          <button onClick={() => { if (window.confirm('Clear this draft, including the portrait, dialogue, settings, and any retained audio?')) { reset(); navigate('/upload'); } }} className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold">Start a new prompt</button>
        </div>
      </section>
    </main>
  </div>;
}
