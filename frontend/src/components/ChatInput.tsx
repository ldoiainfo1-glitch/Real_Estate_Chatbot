import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { SendIcon } from "./Icons";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        className={cn(
          "glass-strong glow-focus flex items-end gap-2 rounded-2xl p-2 transition-all sm:gap-3 sm:rounded-3xl",
          "shadow-2xl shadow-black/40"
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="Ask about RERA, documents, stamp duty, taxes…"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.95rem] text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            "group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-300",
            "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500",
            "shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110",
            "active:scale-90",
            "disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 disabled:shadow-none"
          )}
        >
          <SendIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
      <p className="mt-2 px-1 text-center text-[0.7rem] text-slate-500">
        Press{" "}
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-slate-400">
          Enter
        </kbd>{" "}
        to send ·{" "}
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-slate-400">
          Shift + Enter
        </kbd>{" "}
        for a new line
      </p>
    </div>
  );
}
