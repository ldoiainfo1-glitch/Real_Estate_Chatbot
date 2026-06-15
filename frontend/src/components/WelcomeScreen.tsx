import { BuildingIcon, ShieldIcon, SparkleIcon } from "./Icons";

const SUGGESTIONS = [
  {
    icon: "🏘️",
    title: "Understand RERA",
    prompt: "What is RERA in Maharashtra and why does it matter for homebuyers?",
  },
  {
    icon: "📑",
    title: "Documents to check",
    prompt:
      "What property documents should I verify before buying a flat in India?",
  },
  {
    icon: "💰",
    title: "Stamp duty & tax",
    prompt: "What are the current stamp duty and registration charges in Mumbai?",
  },
  {
    icon: "⚖️",
    title: "Buyer rights",
    prompt:
      "What can I do if my builder delays possession of my booked apartment?",
  },
];

export default function WelcomeScreen({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="animate-in mx-auto flex max-w-3xl flex-col items-center px-2 py-6 text-center sm:py-10">
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-full bg-emerald-400/30 blur-2xl" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 sm:h-20 sm:w-20">
          <BuildingIcon className="h-9 w-9 sm:h-11 sm:w-11" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        How can I help with your{" "}
        <span className="text-gradient">property journey</span>?
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
        Ask about RERA, property documents, stamp duty, registration, taxes or
        your rights as a homebuyer. I'll break it down clearly.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.prompt)}
            className="glass group flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-semibold text-slate-100">
                {s.title}
                <SparkleIcon className="h-3.5 w-3.5 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                {s.prompt}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <ShieldIcon className="h-4 w-4 text-emerald-400/70" />
        Informational guidance only — not legal or financial advice.
      </div>
    </div>
  );
}
