import { BuildingIcon, MemoryIcon, TrashIcon } from "./Icons";

export default function Header({
  onClear,
  hasMessages,
}: {
  onClear: () => void;
  hasMessages: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#06080f]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30">
            <BuildingIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
              Estate<span className="text-gradient">Sage</span>{" "}
              <span className="text-slate-400">AI</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="pulse-ring h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[0.7rem] text-slate-400">
                Real Estate &amp; Legal Advisor
              </span>
            </div>
          </div>
        </div>

        {hasMessages && (
          <div className="flex items-center gap-2">
            <span
              title="Session memory active — conversation context is remembered until you close this tab"
              className="hidden items-center gap-1 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[0.65rem] font-medium text-emerald-300 sm:inline-flex"
            >
              <MemoryIcon className="h-3 w-3" />
              Memory on
            </span>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear chat</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
