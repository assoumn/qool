import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Play, Plus, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";

const demoVideo = "/assets/videos/qool-demo.mp4";

export default function VideoReady() {
  const navigate = useNavigate();
  const [videoAvailable, setVideoAvailable] = useState(true);

  function startNew() {
    sessionStorage.removeItem("qool-example-image");
    sessionStorage.removeItem("qool-text");
    sessionStorage.removeItem("qool-voice");
    sessionStorage.removeItem("qool-input-mode");
    navigate("/upload");
  }

  return (
    <div className="min-h-screen bg-qool-background">
      <Header />

      <main className="mx-auto max-w-[900px] px-6 pb-20">
        <section className="mt-16 text-center">
          <CheckCircle2
            size={48}
            className="mx-auto text-qool-orange"
            strokeWidth={1.5}
          />

          <h1 className="mt-5 text-4xl font-bold">
            Your video is ready!
          </h1>

          <p className="mt-3 text-qool-muted">
            Watch the sample talking portrait below.
          </p>

          <div className="mx-auto mt-10 max-w-[620px] overflow-hidden rounded-[26px] border border-[#DDD8D0] bg-[#E8E1D8]">
            {videoAvailable ? (
              <video
                src={demoVideo}
                controls
                playsInline
                className="aspect-square w-full object-contain"
                onError={() => setVideoAvailable(false)}
              />
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center px-8">
                <Play size={46} className="text-qool-orange" />
                <h2 className="mt-5 text-xl font-bold">
                  Demo video not added yet
                </h2>
                <p className="mt-3 text-sm text-qool-muted">
                  Add qool-demo.mp4 to public/assets/videos
                  to display your sample video here.
                </p>
              </div>
            )}
          </div>

          <p className="mt-5 text-sm text-qool-muted">
            Demo video — not generated from your current selections.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {videoAvailable && (
              <a
                href={demoVideo}
                download="qool-demo.mp4"
                className="flex items-center gap-2 rounded-full bg-qool-orange px-8 py-3.5 font-semibold text-white"
              >
                <Download size={18} />
                Download video
              </a>
            )}

            <button
              onClick={startNew}
              className="flex items-center gap-2 rounded-full border border-[#DDD8D0] px-8 py-3.5 font-semibold"
            >
              <Plus size={18} />
              New video
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
