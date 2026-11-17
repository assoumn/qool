export default function StepIndicator({ current }: { current: number }) {
  return <ol aria-label="Progress" className="flex flex-wrap justify-center gap-5 text-sm font-medium md:gap-10">
    {['Upload', 'Add text', 'Voice', 'Generate'].map((step, index) => <li key={step} aria-current={current === index + 1 ? 'step' : undefined} className="flex items-center gap-2">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${current === index + 1 ? 'bg-qool-orange text-white' : 'bg-[#E8E5DF] text-[#777]'}`}>{index + 1}</span><span className="hidden sm:inline">{step}</span>
    </li>)}
  </ol>;
}
