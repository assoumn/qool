import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#E8E5DF] px-8 md:px-[8%]">
      <Link to="/" aria-label="Qool home">
        <img
          src="/qool-logo-name.png"
          alt="Qool"
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav className="hidden items-center gap-9 text-xs font-semibold md:flex">
        <a href="/#features" className="hover:text-qool-orange">Features</a>
        <a href="/#how-it-works" className="hover:text-qool-orange">How it works</a>
        <a href="/#examples" className="hover:text-qool-orange">Examples</a>
      </nav>

      <div className="flex items-center gap-5 text-xs font-semibold">
        <button type="button">En</button>
        <button type="button" className="font-arabic">العربية</button>
      </div>
    </header>
  );
}
