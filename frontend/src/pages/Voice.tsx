import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useWorkflow } from "../state/workflow";
import StepIndicator from "../components/StepIndicator";
import Header from "../components/Header";

const voices = [
  { id: "layla", name: "Layla", language: "Arabic", description: "Warm & natural", initial: "L" },
  { id: "noor", name: "Noor", language: "Arabic", description: "Soft & friendly", initial: "N" },
  { id: "omar", name: "Omar", language: "Arabic", description: "Clear & confident", initial: "O" },
];

export default function Voice() {
  const navigate = useNavigate();
  const { data, update } = useWorkflow();
  const selected = data.voice;
  if (!data.portrait) return <Navigate to="/upload" replace />;
  if (!data.dialogue.trim()) return <Navigate to="/add-text" replace />;
  function next() { navigate("/generate"); }

  return (
    <div className="min-h-screen bg-qool-background">
      <Header />

      <main className="mx-auto max-w-[1050px] px-6 pb-16">
        <div className="relative mt-10 flex items-center justify-center">
          <button
            onClick={() => navigate("/add-text")}
            className="absolute left-0"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>

          <StepIndicator current={3} />
        </div>

        <section className="mx-auto mt-16 max-w-[760px]">
          <h1 className="text-3xl font-bold">Choose a voice</h1>
          <p className="mt-3 text-qool-muted">
            Choose prompt preferences. These are descriptions for Google Flow, not synthesized voices or voice previews.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="language" className="font-semibold">Language</label><select id="language" className="mt-2 w-full rounded-xl border border-[#DDD8D0] bg-white p-3" value={data.language} onChange={e => update({ language: e.target.value, accent: e.target.value === 'Lebanese Arabic' ? 'Lebanese' : e.target.value === 'Modern Standard Arabic' ? 'Modern Standard Arabic' : 'Natural for the selected language' })}>
              {['Lebanese Arabic', 'Modern Standard Arabic', 'English', 'French', 'Mixed languages'].map(value => <option key={value}>{value}</option>)}
            </select></div>
            <div><label htmlFor="accent" className="font-semibold">Accent</label><input id="accent" className="mt-2 w-full rounded-xl border border-[#DDD8D0] bg-white p-3" value={data.accent} onChange={e => update({ accent: e.target.value })} /></div>
            <div><label htmlFor="style" className="font-semibold">Speaking style</label><select id="style" className="mt-2 w-full rounded-xl border border-[#DDD8D0] bg-white p-3" value={data.style} onChange={e => update({ style: e.target.value })}>
              {['natural', 'friendly', 'professional', 'enthusiastic', 'calm'].map(value => <option key={value}>{value}</option>)}
            </select></div>
            <div><label htmlFor="speed" className="font-semibold">Speaking speed</label><select id="speed" className="mt-2 w-full rounded-xl border border-[#DDD8D0] bg-white p-3" value={data.speed} onChange={e => update({ speed: e.target.value })}>
              {['slow', 'normal', 'fast'].map(value => <option key={value}>{value}</option>)}
            </select></div>
          </div>
          <div className="mt-10 space-y-5">
            {voices.map((voice) => (
              <button
                key={voice.id}
                aria-pressed={selected === voice.description}
                onClick={() => update({ voice: voice.description })}
                className={`flex w-full items-center gap-5 rounded-[22px] border-2 p-6 text-left transition ${
                  selected === voice.description
                    ? "border-qool-orange bg-qool-peach"
                    : "border-[#DDD8D0] bg-white hover:border-qool-orange"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8E1D8] text-xl font-bold">
                  {voice.initial}
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold">{voice.name}</h2>
                  <p className="mt-1 text-sm text-qool-muted">
                    Prompt preference · {voice.description}
                  </p>
                </div>

                <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  selected === voice.description
                    ? "border-qool-orange bg-qool-orange text-white"
                    : "border-[#CCC]"
                }`}>
                  {selected === voice.description && <Check size={16} />}
                </div>
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm text-qool-muted">
            Voice names are preference labels only. Exact voice control is not guaranteed.
          </p>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => navigate("/add-text")}
              className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold"
            >
              Back
            </button>

            <button
              onClick={next}
              className="flex items-center gap-2 rounded-full bg-qool-orange px-9 py-3 font-semibold text-white"
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
