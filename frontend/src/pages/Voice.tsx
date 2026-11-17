import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Volume2 } from "lucide-react";
import Header from "../components/Header";

const voices = [
  { id: "layla", name: "Layla", language: "Arabic", description: "Warm & natural", initial: "L" },
  { id: "noor", name: "Noor", language: "Arabic", description: "Soft & friendly", initial: "N" },
  { id: "omar", name: "Omar", language: "Arabic", description: "Clear & confident", initial: "O" },
];

export default function Voice() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(
    sessionStorage.getItem("qool-voice") || "layla"
  );

  useEffect(() => {
    if (sessionStorage.getItem("qool-input-mode") === "audio") {
      navigate("/generate", { replace: true });
    }
  }, [navigate]);

  function next() {
    sessionStorage.setItem("qool-voice", selected);
    navigate("/generate");
  }

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

          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium md:gap-10">
            {["Upload", "Add text", "Voice", "Generate"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index === 2
                    ? "bg-qool-orange text-white"
                    : "bg-[#E8E5DF] text-[#777]"
                }`}>
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="mx-auto mt-16 max-w-[760px]">
          <h1 className="text-3xl font-bold">Choose a voice</h1>
          <p className="mt-3 text-qool-muted">
            Select the voice that brings your portrait to life.
          </p>

          <div className="mt-10 space-y-5">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelected(voice.id)}
                className={`flex w-full items-center gap-5 rounded-[22px] border-2 p-6 text-left transition ${
                  selected === voice.id
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
                    {voice.language} · {voice.description}
                  </p>
                </div>

                <Volume2 size={21} className="text-qool-orange" />

                <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  selected === voice.id
                    ? "border-qool-orange bg-qool-orange text-white"
                    : "border-[#CCC]"
                }`}>
                  {selected === voice.id && <Check size={16} />}
                </div>
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm text-qool-muted">
            Voice previews will be available when audio samples are connected.
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
