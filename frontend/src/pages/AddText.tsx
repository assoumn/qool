import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileAudio, Type } from "lucide-react";
import Header from "../components/Header";

export default function AddText() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "audio">("text");
  const [text, setText] = useState(
    sessionStorage.getItem("qool-text") || ""
  );
  const [audio, setAudio] = useState<File | null>(null);

  function next() {
    if (mode === "text") {
      sessionStorage.setItem("qool-text", text);
      sessionStorage.setItem("qool-input-mode", "text");
      navigate("/voice");
    } else if (audio) {
      sessionStorage.setItem("qool-input-mode", "audio");
      navigate("/voice");
    }
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

          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium md:gap-10">
            {["Upload", "Add text", "Voice", "Generate"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    index === 1
                      ? "bg-qool-orange text-white"
                      : "bg-[#E8E5DF] text-[#777]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
            ))}
          </div>
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
              <label className="mb-3 block font-semibold">
                Your script
              </label>

              <textarea
                dir="auto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب النص الذي تريد أن تقوله الصورة..."
                maxLength={1000}
                className="font-arabic min-h-[230px] w-full resize-none rounded-2xl border border-[#DDD8D0] bg-white p-6 text-lg leading-9 outline-none focus:border-qool-orange"
              />

              <p className="mt-2 text-right text-sm text-qool-muted">
                {text.length} / 1000 characters
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
                MP3 or WAV audio
              </p>

              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={(e) =>
                  setAudio(e.target.files?.[0] || null)
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
                mode === "text" ? !text.trim() : !audio
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
