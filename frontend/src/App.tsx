import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import AddText from "./pages/AddText";
import Voice from "./pages/Voice";
import Generate from "./pages/Generate";
import VideoReady from "./pages/VideoReady";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/add-text" element={<AddText />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/video-ready" element={<VideoReady />} />
      </Routes>
    </BrowserRouter>
  );
}
