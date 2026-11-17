import { Link } from "react-router-dom";
import { Image, FileText, PlaySquare } from "lucide-react";
import Header from "../components/Header";

const features = [
  {
    icon: Image,
    title: "Upload a photo",
    description: "Use any clear portrait",
  },
  {
    icon: FileText,
    title: "Add your text",
    description: "Type or upload your audio",
  },
  {
    icon: PlaySquare,
    title: "Generate video",
    description: "Get a natural talking video",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-qool-background">
      <div className="mx-auto max-w-[1440px] bg-qool-background">
        <Header />

        <main>
          <section className="relative isolate flex min-h-[540px] items-center overflow-hidden px-8 py-16 md:px-[8%] lg:min-h-[610px]">

            {/* Full-width Figma hero artwork */}
            <img
              src="/assets/images/hero-woman.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-contain object-right"
            />

            {/* Left content */}
            <div className="relative z-10 max-w-[520px]">
              <h1 className="text-[48px] font-extrabold leading-[1.08] tracking-[-2px] text-black md:text-[65px]">
                Give your image
                <br />
                a <span className="text-qool-orange">voice</span>.
              </h1>

              <p className="mt-6 max-w-[400px] text-[17px] font-medium leading-7 text-qool-muted">
                Turn a portrait into natural, realistic speech in a few seconds.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/upload"
                  className="rounded-full bg-qool-orange px-9 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Get started
                </Link>

                <a
                  href="#examples"
                  className="rounded-full border border-qool-orange px-9 py-3.5 text-sm font-semibold text-qool-orange transition hover:bg-qool-peach"
                >
                  Watch demo
                </a>
              </div>
            </div>

            {/* Speech bubble — positioned near the lower-right */}
            <div className="font-arabic absolute bottom-[9%] right-[4%] z-20 hidden rounded-2xl bg-white px-5 py-4 text-right shadow-lg lg:block">
              <p className="text-sm leading-7">
                مرحبا كيف حالكم اليوم؟
              </p>

              <div className="mt-2 flex h-5 items-center justify-center gap-[3px]">
                {[7, 13, 19, 11, 16, 9, 20, 12, 7, 14, 8, 5].map(
                  (height, index) => (
                    <span
                      key={index}
                      className="w-[3px] rounded-full bg-qool-orange"
                      style={{ height }}
                    />
                  )
                )}
              </div>
            </div>
          </section>

          <section
            id="features"
            className="grid gap-10 px-8 py-12 md:grid-cols-3 md:px-[8%]"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-start gap-2">
                <Icon size={25} strokeWidth={1.8} />
                <h2 className="text-[17px] font-bold">{title}</h2>
                <p className="text-[15px] text-qool-muted">{description}</p>
              </div>
            ))}
          </section>

          <section id="how-it-works" className="sr-only">
            Upload a portrait, add text, and generate a talking video.
          </section>

          <section id="examples" className="sr-only">
            Qool talking portrait examples.
          </section>
        </main>
      </div>
    </div>
  );
}

