import { useState } from "react";
import { cn } from "../utils/cn";
import Markdown from "./Markdown";
import {
  AlertIcon,
  CheckIcon,
  CopyIcon,
  PinIcon,
  SparkleIcon,
  UserIcon,
} from "./Icons";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  states?: string[];
  error?: boolean;
}

export default function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3 sm:gap-4",
        isUser ? "flex-row-reverse" : "flex-row",
        "animate-in"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg sm:h-10 sm:w-10",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/30"
            : message.error
            ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30"
            : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/30"
        )}
      >
        {isUser ? (
          <UserIcon className="h-5 w-5" />
        ) : message.error ? (
          <AlertIcon className="h-5 w-5" />
        ) : (
          <SparkleIcon className="h-5 w-5" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-2 sm:max-w-[78%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-lg",
            isUser
              ? "rounded-tr-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-900/40"
              : message.error
              ? "rounded-tl-md border border-rose-500/30 bg-rose-950/40 text-rose-100"
              : "glass-strong rounded-tl-md text-slate-100 shadow-black/30"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : message.error ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}

          {/* Copy button */}
          {!isUser && (
            <button
              onClick={copy}
              title="Copy response"
              className={cn(
                "absolute -bottom-3 right-2 flex items-center gap-1 rounded-full border border-white/10 bg-ink-800/90 px-2 py-1 text-[0.65rem] font-medium text-slate-300 opacity-0 shadow-lg backdrop-blur transition-all hover:text-white",
                "group-hover:opacity-100 focus-visible:opacity-100"
              )}
            >
              {copied ? (
                <>
                  <CheckIcon className="h-3 w-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <CopyIcon className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          )}
        </div>

        {/* Detected states */}
        {!isUser && message.states && message.states.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {message.states.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300"
              >
                <PinIcon className="h-3 w-3" />
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
