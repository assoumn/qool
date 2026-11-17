import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, ArrowRight } from "lucide-react";
import Header from "../components/Header";

const examples = [
  { name: "Woman", src: "/assets/images/example-woman.png" },
  { name: "Man", src: "/assets/images/example-man.png" },
  { name: "Hijab", src: "/assets/images/example-hijab.png" },
  { name: "Sami", src: "/assets/images/example-sami.jpeg" },
];

export default function Upload() {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(
    sessionStorage.getItem("qool-example-image")
  );
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleFile(file?: File) {
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Maximum image size is 10 MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImage(url);
    sessionStorage.removeItem("qool-example-image");
    setError("");
  }

  function chooseExample(src: string) {
    setImage(src);
    sessionStorage.setItem("qool-example-image", src);
    setError("");
  }

  return (
    <div className="min-h-screen bg-qool-background">
      <Header />

      <main className="mx-auto max-w-[1050px] px-6 pb-16">
        <div className="relative mt-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute left-0"
            aria-label="Back to home"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium md:gap-10">
            {["Upload", "Add text", "Voice", "Generate"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    index === 0
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

        <section className="mt-14">
          <h1 className="text-3xl font-bold">Upload a portrait</h1>
          <p className="mt-2 text-qool-muted">
            Use a clear front-facing photo for the best results.
          </p>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInput.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`mx-auto mt-8 flex min-h-[275px] max-w-[650px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[26px] border-2 border-dashed p-5 ${
              dragging
                ? "border-qool-orange bg-qool-peach"
                : "border-[#DDD8D0] bg-[#EEECE8]"
            }`}
          >
            {image ? (
              <>
                <img
                  src={image}
                  alt="Selected portrait"
                  className="max-h-[215px] max-w-full rounded-xl object-contain"
                />
                <p className="mt-3 text-sm text-qool-orange">
                  Click to change image
                </p>
              </>
            ) : (
              <>
                <ImagePlus size={40} strokeWidth={1.5} />
                <p className="mt-4 font-semibold">Drag & drop your image</p>
                <p className="mt-1 text-sm">
                  or <span className="text-qool-orange">click to browse</span>
                </p>
                <p className="mt-8 text-xs text-qool-muted">
                  JPG · PNG · Maximum 10 MB
                </p>
              </>
            )}
          </div>

          {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Example photos</h2>

          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {examples.map((example) => (
              <button
                key={example.name}
                type="button"
                onClick={() => chooseExample(example.src)}
                className={`overflow-hidden rounded-[20px] border-2 ${
                  image === example.src
                    ? "border-qool-orange"
                    : "border-transparent hover:border-qool-orange"
                }`}
              >
                <img
                  src={example.src}
                  alt={example.name}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            disabled={!image}
            onClick={() => navigate("/add-text")}
            className="flex items-center gap-2 rounded-full bg-qool-orange px-9 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight size={17} />
          </button>
        </div>
      </main>
    </div>
  );
}
