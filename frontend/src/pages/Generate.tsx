import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, Volume2 } from "lucide-react";
import Header from "../components/Header";

export default function Generate() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  const portrait =
    sessionStorage.getItem("qool-example-image") ||
    "/assets/images/example-woman.png";

  const script = sessionStorage.getItem("qool-text") || "";
  const mode = sessionStorage.getItem("qool-input-mode") || "text";
  const voice = sessionStorage.getItem("qool-voice") || "layla";

  return (
    <div className="min-h-screen bg-qool-background">
      <Header />

      <main className="mx-auto max-w-[1050px] px-6 pb-16">
        <div className="relative mt-10 flex items-center justify-center">
          <button
            onClick={() => navigate(mode === "audio" ? "/add-text" : "/voice")}
            className="absolute left-0"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium md:gap-10">
            {["Upload", "Add text", "Voice", "Generate"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index === 3
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
          <h1 className="text-3xl font-bold">Generate your video</h1>
          <p className="mt-3 text-qool-muted">
            Review your choices before creating your talking portrait.
          </p>

          <div className="mt-10 overflow-hidden rounded-[26px] border border-[#DDD8D0] bg-white p-6 md:p-8">
            <div className="flex flex-col gap-7 sm:flex-row">
              <img
                src={portrait}
                alt="Selected portrait"
                className="h-[230px] w-full rounded-2xl object-cover sm:w-[230px]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-qool-muted">
                  <ImageIcon size={18} />
                  <span className="text-sm">Your portrait</span>
                </div>

                <h2 className="mt-5 text-lg font-bold">
                  {mode === "audio" ? "Uploaded audio" : "Your script"}
                </h2>

                <p dir="auto" className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words text-qool-muted">
                  {mode === "audio"
                    ? "Your audio was selected in the previous step."
                    : script || "No text entered."}
                </p>

                {mode === "text" && (
                  <div className="mt-6 flex items-center gap-2">
                    <Volume2 size={18} className="text-qool-orange" />
                    <span className="text-sm">
                      Voice: <strong className="capitalize">{voice}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!started ? (
            <div className="mt-10 rounded-[24px] bg-qool-peach p-7 text-center">
              <Sparkles size={30} className="mx-auto text-qool-orange" />

              <h2 className="mt-4 text-xl font-bold">
                Ready to bring your portrait to life?
              </h2>

              <p className="mt-3 text-sm text-qool-muted">
                This is a frontend demo. AI video generation will be
                available after the backend is connected.
              </p>

              <button
                onClick={() => setStarted(true)}
                className="mt-7 rounded-full bg-qool-orange px-10 py-3.5 font-semibold text-white"
              >
                Preview demo
              </button>
            </div>
          ) : (
            <div className="mt-10 rounded-[24px] border border-[#DDD8D0] bg-white p-8 text-center">
              <Sparkles size={36} className="mx-auto text-qool-orange" />

              <h2 className="mt-5 text-xl font-bold">
                Demo preview ready
              </h2>

              <p className="mt-3 text-sm text-qool-muted">
                Your selections have been captured. The next screen
                will show a sample video when we add one.
              </p>

              <button
                onClick={() => navigate("/video-ready")}
                className="mx-auto mt-7 flex items-center gap-2 rounded-full bg-qool-orange px-9 py-3 font-semibold text-white"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          <div className="mt-10">
            <button
              onClick={() => navigate(mode === "audio" ? "/add-text" : "/voice")}
              className="rounded-full border border-[#DDD8D0] px-8 py-3 font-semibold"
            >
              Back
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
