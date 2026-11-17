import { Navigate, useNavigate } from 'react-router-dom';
import VideoGenerator from '../components/VideoGenerator';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';
import { useWorkflow } from '../state/workflow';
import { estimateSeconds } from '../services/flowPromptService';

export default function Generate() {
  const navigate = useNavigate();
  const { data } = useWorkflow();
  if (!data.portrait) return <Navigate to="/upload" replace />;
  if (!data.dialogue.trim()) return <Navigate to="/add-text" replace />;
  const seconds = estimateSeconds(data.dialogue, data.speed);
  return <div className="min-h-screen bg-qool-background"><Header />
    <main className="mx-auto max-w-[1050px] px-6 pb-16">
      <div className="mt-10"><StepIndicator current={4} /></div>
      <section className="mx-auto mt-16 max-w-[760px]">
        <h1 className="text-3xl font-bold">Generate your talking portrait</h1>
        <p className="mt-3 text-qool-muted">Review your choices. Generate through the Veo API when configured, or prepare a prompt for Google Flow.</p>
        <div className="mt-10 rounded-[26px] border border-[#DDD8D0] bg-white p-6 md:p-8">
          <div className="flex flex-col gap-7 sm:flex-row">
            <img src={data.portrait} alt="Selected portrait" className="h-[230px] w-full rounded-2xl object-contain sm:w-[230px]" />
            <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">Exact dialogue</h2>
              <p dir="auto" className="mt-2 whitespace-pre-wrap break-words">{data.dialogue}</p>
              <p className="mt-6">{data.language} · {data.accent}<br />{data.voice} · {data.style} · {data.speed}</p>
            </div>
          </div>
          {data.pronunciationNotes && <div className="mt-5"><h3 className="font-semibold">Pronunciation notes</h3><p dir="auto" className="mt-2 whitespace-pre-wrap break-words">{data.pronunciationNotes}</p></div>}
          {data.audio && <p className="mt-5">Retained audio: <bdi>{data.audio.name}</bdi>. Not attached to the prompt; automatic audio lip-sync is unavailable.</p>}
        </div>
        {seconds > 8 && <p role="status" className="mt-5 rounded-2xl bg-qool-peach p-5">This dialogue may be too long for a short video (roughly {seconds} seconds at your selected speed). Model limits vary; consider separate clips or shorten your dialogue yourself.</p>}
        <p className="mt-5 text-sm">Lip synchronization and voice matching depend on the model and are not guaranteed. API generation requires your own Google project and available credits or billing.</p>
        <VideoGenerator data={data} />
        <div className="mt-10 flex flex-wrap justify-between gap-4">
          <button onClick={() => navigate('/voice')} className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold">Back</button>
          <button onClick={() => navigate('/prompt-ready')} className="rounded-full bg-qool-orange px-8 py-3 font-semibold text-white">Generate Flow Prompt</button>
        </div>
      </section>
    </main>
  </div>;
}
