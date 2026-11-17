import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileAudio, Type } from "lucide-react";
import { useWorkflow } from "../state/workflow";
import StepIndicator from "../components/StepIndicator";
import Header from "../components/Header";

export default function AddText() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "audio">("text");
  const { data, update } = useWorkflow();
  const text = data.dialogue;
  const audio = data.audio;
  const [error, setError] = useState("");
  if (!data.portrait) return <Navigate to="/upload" replace />;
  function next() {
    if (text.trim()) navigate("/voice");
    else { setMode("text"); setError("Enter the exact dialogue, including a transcript if you uploaded audio."); }
  }

  return (
    <div className="min-h-screen bg-qool-background">
      <Header />

      <main className="mx-auto max-w-[1050px] px-6 pb-16">
        <div className="relative mt-10 flex items-center justify-center">
          <button
            onClick={() => navigate("/upload")}
            className="absolute left-0"
            aria-label="Back to upload"
          >
            <ArrowLeft size={24} />
          </button>

          <StepIndicator current={2} />
        </div>

        <section className="mx-auto mt-16 max-w-[760px]">
          <h1 className="text-3xl font-bold">Add your text</h1>
          <p className="mt-3 text-qool-muted">
            What would you like your portrait to say?
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("text")}
              className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-5 font-semibold ${
                mode === "text"
                  ? "border-qool-orange bg-qool-peach"
                  : "border-[#DDD8D0] bg-white"
              }`}
            >
              <Type size={23} />
              Type text
            </button>

            <button
              onClick={() => setMode("audio")}
              className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-5 font-semibold ${
                mode === "audio"
                  ? "border-qool-orange bg-qool-peach"
                  : "border-[#DDD8D0] bg-white"
              }`}
            >
              <FileAudio size={23} />
              Upload audio
            </button>
          </div>

          {mode === "text" ? (
            <div className="mt-8">
              <label htmlFor="dialogue" className="mb-3 block font-semibold">
                Your script
              </label>

              <textarea
                id="dialogue"
                dir="auto"
                value={text}
                onChange={(e) => update({ dialogue: e.target.value })}
                placeholder="اكتب النص الذي تريد أن تقوله الصورة..."

                className="font-arabic min-h-[230px] w-full resize-none rounded-2xl border border-[#DDD8D0] bg-white p-6 text-lg leading-9 outline-none focus:border-qool-orange"
              />

              <p className="mt-2 text-right text-sm text-qool-muted">
                {text.length} characters
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-[#DDD8D0] bg-white p-12 text-center">
              <FileAudio
                size={38}
                strokeWidth={1.5}
                className="mx-auto text-qool-orange"
              />

              <p className="mt-5 font-semibold">
                Upload your voice recording
              </p>

              <p className="mt-2 text-sm text-qool-muted">
                MP3 or WAV audio. This recording stays in your local draft; Qool cannot transcribe or automatically lip-sync uploaded audio. Enter the exact transcript in Type text before continuing.
              </p>

              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={(e) =>
                  update({ audio: e.target.files?.[0] || null })
                }
                className="mx-auto mt-6 block max-w-full text-sm"
              />

              {audio && (
                <p className="mt-4 text-sm text-qool-orange">
                  Selected: {audio.name}
                </p>
              )}
            </div>
          )}

          {mode === "audio" && <button className="mt-4 font-semibold text-qool-orange underline" onClick={() => setMode("text")}>Enter the exact transcript</button>}
          {audio && <div className="mt-4 rounded-2xl bg-qool-peach p-4"><p>Retained recording: <bdi>{audio.name}</bdi>. It is not sent to Google Flow or included in the text download.</p><button className="mt-2 underline" onClick={() => update({ audio: null })}>Remove recording</button></div>}
          {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => navigate("/upload")}
              className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold"
            >
              Back
            </button>

            <button
              onClick={next}
              disabled={
                !text.trim()
              }
              className="flex items-center gap-2 rounded-full bg-qool-orange px-9 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
