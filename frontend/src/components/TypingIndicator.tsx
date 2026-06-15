import { SparkleIcon } from "./Icons";

/** Three bouncing dots shown while the assistant is "thinking". */
export default function TypingIndicator() {
  return (
    <div className="flex animate-in items-center gap-3 sm:gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 sm:h-10 sm:w-10">
        <SparkleIcon className="h-5 w-5" />
      </div>
      <div className="glass-strong flex items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3.5 shadow-lg">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="dot inline-block h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}
